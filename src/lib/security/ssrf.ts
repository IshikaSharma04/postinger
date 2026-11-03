import dns from "node:dns/promises";

/**
 * Validates that a URL does NOT resolve to a private, loopback, or metadata IP address.
 * Prevents Server-Side Request Forgery (SSRF) attacks on RSS and external fetchers.
 */
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

  // 1. Block common loopback and metadata names
  const blockedHostnames = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"];
  if (blockedHostnames.includes(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error("Access to local or internal network targets is prohibited");
  }

  // 2. DNS resolve to check target IP address
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateOrReservedIp(addr.address)) {
        throw new Error(`Target resolved to a private or restricted IP address (${addr.address})`);
      }
    }
  } catch (err: any) {
    if (err.message.includes("private or restricted")) throw err;
    throw new Error(`Could not resolve hostname: ${hostname}`);
  }

  return url;
}

export function isPrivateOrReservedIp(ip: string): boolean {
  // IPv4 Checks
  if (ip === "127.0.0.1" || ip === "0.0.0.0" || ip === "169.254.169.254") return true;

  const parts = ip.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local / AWS metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 100.64.0.0/10 (Carrier grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // 127.0.0.0/8
    if (parts[0] === 127) return true;
  }

  // IPv6 Checks
  if (ip === "::1" || ip.toLowerCase().startsWith("fe80:") || ip.toLowerCase().startsWith("fc00:")) {
    return true;
  }

  return false;
}
