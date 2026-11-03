import { describe, it } from "node:test";
import assert from "node:assert/strict";
(process.env as Record<string, string | undefined>).NODE_ENV = "test";
import { getProvider } from "../src/lib/providers/adapters";

describe("Social Provider Adapters", () => {
  it("provides adapters for all supported platforms", () => {
    const platforms = ["TWITTER", "INSTAGRAM", "LINKEDIN", "FACEBOOK", "TIKTOK"] as const;
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
      body: "A great tweet via Postly!",
      hashtags: ["demo", "postly"],
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
      body: "Photo caption via Postly",
      hashtags: ["demo"],
      mediaUrls: ["https://example.com/photo.jpg"],
      credentials: {},
    });
    assert.equal(result.success, true);
    assert.ok(result.externalId?.startsWith("ig_"));
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
});
