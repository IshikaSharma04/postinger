import { describe, it } from "node:test";
import assert from "node:assert/strict";
(process.env as Record<string, string | undefined>).NODE_ENV = "test";
import { getProvider } from "../src/lib/providers/adapters";
import {
  blueskyProvider,
  createBlueskySession,
  BlueskyAuthError,
  BlueskyRateLimitError,
} from "../src/lib/providers/bluesky";

describe("Social Provider Adapters", () => {
  it("provides adapters for all supported platforms", () => {
    const platforms = ["BLUESKY", "TWITTER", "INSTAGRAM", "LINKEDIN", "FACEBOOK", "TIKTOK"] as const;
    for (const p of platforms) {
      const adapter = getProvider(p);
      assert.ok(adapter, `Adapter should exist for ${p}`);
      assert.equal(adapter.platform, p);
      assert.ok(adapter.name);
      assert.ok(adapter.description);
    }
  });

  it("publishes simulated Twitter / X post with externalId", async () => {
    const twitter = getProvider("TWITTER");
    const result = await twitter.publish({
      handle: "demouser",
      body: "A great tweet via Postinger!",
      hashtags: ["demo", "postinger"],
      mediaUrls: [],
      credentials: {},
    });
    assert.equal(result.success, true);
    assert.ok(result.externalId?.startsWith("tw_"));
  });

  it("publishes simulated Instagram post with externalId", async () => {
    const instagram = getProvider("INSTAGRAM");
    const result = await instagram.publish({
      handle: "demouser.ig",
      body: "Photo caption via Postinger",
      hashtags: ["demo"],
      mediaUrls: ["https://example.com/photo.jpg"],
      credentials: {},
    });
    assert.equal(result.success, true);
    assert.ok(result.externalId?.startsWith("in_") || result.externalId?.startsWith("ig_"));
  });

  it("publishes simulated LinkedIn post with externalId", async () => {
    const linkedin = getProvider("LINKEDIN");
    const result = await linkedin.publish({
      handle: "company",
      body: "Excited to share our latest product update with our professional network.",
      hashtags: [],
      mediaUrls: [],
      credentials: {},
    });
    assert.equal(result.success, true);
    assert.ok(result.externalId?.startsWith("li_"));
  });

  it("publishes to Bluesky via AT Protocol with mocked API", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
        const urlStr = url.toString();
        if (urlStr.includes("com.atproto.server.createSession")) {
          return new Response(
            JSON.stringify({
              accessJwt: "mock_jwt_token_123",
              did: "did:plc:testuser12345",
              handle: "testuser.bsky.social",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
        if (urlStr.includes("com.atproto.repo.createRecord")) {
          return new Response(
            JSON.stringify({
              uri: "at://did:plc:testuser12345/app.bsky.feed.post/3kn4abcdef",
              cid: "bafyreihypotestcid123",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response("Not found", { status: 404 });
      }) as typeof fetch;

      const result = await blueskyProvider.publish({
        handle: "testuser.bsky.social",
        body: "Hello from Postinger on AT Protocol! 🦋",
        hashtags: [],
        mediaUrls: [],
        credentials: { rawPassword: "app-password-xyz" },
      });

      assert.equal(result.success, true);
      assert.equal(result.externalId, "at://did:plc:testuser12345/app.bsky.feed.post/3kn4abcdef");
      assert.equal(
        (result.platformData as { url: string }).url,
        "https://bsky.app/profile/testuser.bsky.social/post/3kn4abcdef"
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("classifies Bluesky 401 as non-retryable auth error requiring reconnect", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = (async () => {
        return new Response(JSON.stringify({ message: "Invalid identifier or password" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }) as typeof fetch;

      await assert.rejects(
        async () => {
          await createBlueskySession("baduser.bsky.social", "wrong-password");
        },
        (err: unknown) => {
          assert.ok(err instanceof BlueskyAuthError);
          assert.equal(err.needsReconnect, true);
          assert.equal(err.retryable, false);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("classifies Bluesky 429 as retryable rate limit error", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = (async () => {
        return new Response(JSON.stringify({ message: "Rate limit exceeded" }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }) as typeof fetch;

      await assert.rejects(
        async () => {
          await createBlueskySession("user.bsky.social", "app-password");
        },
        (err: unknown) => {
          assert.ok(err instanceof BlueskyRateLimitError);
          assert.equal(err.retryable, true);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
