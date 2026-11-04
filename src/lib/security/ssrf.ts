import dns from "node:dns/promises";

export function isPrivateOrReservedIp(ip: string): boolean {
  const lower = ip.toLowerCase().trim();

  // IPv4 Checks
  if (lower === "127.0.0.1" || lower === "0.0.0.0" || lower === "169.254.169.254") {
    return true;
  }

  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (lower.startsWith("::ffff:")) {
    const rest = lower.slice(7);
    if (rest.includes(".")) {
      return isPrivateOrReservedIp(rest);
    }
    return true;
  }

  const parts = lower.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 100.64.0.0/10 (Carrier grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 169.254.0.0/16 (Link-local / Cloud metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
  }

  // IPv6 Checks
  if (lower === "::1" || lower === "::") {
    return true;
  }

  // Unique Local Addresses: fc00::/7 (covers fc00:: through fdff::)
  if (/^f[cd][0-9a-f]{0,2}:/.test(lower)) {
    return true;
  }

  // Link-Local: fe80::/10 (covers fe80:: through febf::)
  if (/^fe[89ab][0-9a-f]{0,2}:/.test(lower)) {
    return true;
  }

  return false;
}

export async function assertSafeUrl(urlString: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https protocols are permitted");
  }

  const hostname = url.hostname.toLowerCase();

  const blockedHostnames = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "metadata.google.internal",
  ];
  if (
    blockedHostnames.includes(hostname) ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("Access to local or internal network targets is prohibited");
  }

  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateOrReservedIp(addr.address)) {
        throw new Error(
          `Target resolved to a private or restricted IP address (${addr.address})`
        );
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("private or restricted")) {
      throw err;
    }
    throw new Error(`Could not resolve hostname: ${hostname}`);
  }

  return url;
}

export async function safeFetch(
  urlString: string,
  init?: RequestInit,
  maxRedirects = 5
): Promise<Response> {
  let currentUrl = urlString;
  let redirects = 0;

  while (redirects <= maxRedirects) {
    const validatedUrl = await assertSafeUrl(currentUrl);
    const response = await fetch(validatedUrl.toString(), {
      ...init,
      redirect: "manual",
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("Redirect response missing Location header");
      }
      redirects++;
      currentUrl = new URL(location, validatedUrl).toString();
      continue;
    }

    return response;
  }

  throw new Error("Too many redirects");
}
