import { decryptToken } from "@/lib/security/encryption";
import { ProviderAdapter, PublishResult } from "./adapters";

export class BlueskyAuthError extends Error {
  readonly retryable = false;
  readonly needsReconnect = true;
  constructor(message: string) {
    super(message);
    this.name = "BlueskyAuthError";
  }
}

export class BlueskyRateLimitError extends Error {
  readonly retryable = true;
  readonly needsReconnect = false;
  constructor(message: string) {
    super(message);
    this.name = "BlueskyRateLimitError";
  }
}

export class BlueskyServerError extends Error {
  readonly retryable = true;
  readonly needsReconnect = false;
  constructor(message: string) {
    super(message);
    this.name = "BlueskyServerError";
  }
}

const BSKY_API_URL = process.env.BLUESKY_API_URL || "https://bsky.social";

export async function createBlueskySession(
  handle: string,
  appPassword: string
): Promise<{ accessJwt: string; did: string; handle: string }> {
  const cleanHandle = handle.replace(/^@/, "").trim();
  const res = await fetch(`${BSKY_API_URL}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: cleanHandle, password: appPassword }),
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as { message?: string };
    const message = errorBody.message || `Bluesky authentication failed (${res.status})`;
    if (res.status === 401 || res.status === 400) {
      throw new BlueskyAuthError(message);
    }
    if (res.status === 429) {
      throw new BlueskyRateLimitError(message);
    }
    if (res.status >= 500) {
      throw new BlueskyServerError(message);
    }
    throw new Error(message);
  }

  return (await res.json()) as { accessJwt: string; did: string; handle: string };
}

export async function publishToBluesky({
  handle,
  body,
  credentials,
}: {
  handle: string;
  body: string;
  credentials: Record<string, unknown>;
}): Promise<PublishResult> {
  const encryptedPassword = credentials.appPassword as string | undefined;
  const rawPassword = credentials.rawPassword as string | undefined;

  let password = rawPassword;
  if (!password && encryptedPassword) {
    password = decryptToken(encryptedPassword);
  }

  if (!password) {
    throw new BlueskyAuthError("No Bluesky app password found in account credentials");
  }

  const session = await createBlueskySession(handle, password);

  const nowIso = new Date().toISOString();
  const record = {
    $type: "app.bsky.feed.post",
    text: body,
    createdAt: nowIso,
  };

  const res = await fetch(`${BSKY_API_URL}/xrpc/com.atproto.repo.createRecord`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({
      repo: session.did,
      collection: "app.bsky.feed.post",
      record,
    }),
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as { message?: string };
    const message = errorBody.message || `Bluesky publishing failed (${res.status})`;
    if (res.status === 401) throw new BlueskyAuthError(message);
    if (res.status === 429) throw new BlueskyRateLimitError(message);
    if (res.status >= 500) throw new BlueskyServerError(message);
    throw new Error(message);
  }

  const created = (await res.json()) as { uri: string; cid: string };
  const rkey = created.uri.split("/").pop() || "";
  const postUrl = `https://bsky.app/profile/${session.handle}/post/${rkey}`;

  return {
    success: true,
    externalId: created.uri,
    platformData: {
      uri: created.uri,
      cid: created.cid,
      url: postUrl,
    },
  };
}

export const blueskyProvider: ProviderAdapter = {
  platform: "BLUESKY",
  name: "Bluesky",
  description: "Live AT Protocol publishing via handle & app password",
  isSimulated: false,
  async publish({ handle, body, credentials }) {
    return publishToBluesky({ handle, body, credentials });
  },
};
