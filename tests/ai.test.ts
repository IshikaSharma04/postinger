import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aiGenerateSchema } from "../src/lib/validators/schemas";

describe("AI Assistant Validation Schema", () => {
  it("accepts valid generation request with IDEAS action", () => {
    const input = {
      action: "IDEAS",
      prompt: "5 tips for optimizing PostgreSQL connection pools in Next.js",
      tone: "Technical",
      platform: "LINKEDIN",
    };
    const res = aiGenerateSchema.safeParse(input);
    assert.equal(res.success, true);
    if (res.success) {
      assert.equal(res.data.action, "IDEAS");
      assert.equal(res.data.tone, "Technical");
    }
  });

  it("accepts REWRITE request with Punchy tone", () => {
    const input = {
      action: "REWRITE",
      prompt: "We just launched our new background queue dashboard today.",
      tone: "Punchy",
      platform: "TWITTER",
    };
    const res = aiGenerateSchema.safeParse(input);
    assert.equal(res.success, true);
  });

  it("accepts HOOKS and SUMMARIZE actions", () => {
    const hooks = aiGenerateSchema.safeParse({
      action: "HOOKS",
      prompt: "How we scaled to 100k daily scheduled social posts with Redis",
    });
    assert.equal(hooks.success, true);

    const summarize = aiGenerateSchema.safeParse({
      action: "SUMMARIZE",
      prompt: "A lengthy 500 word article on modern engineering practices and distributed systems architecture.",
    });
    assert.equal(summarize.success, true);
  });

  it("rejects empty prompt string", () => {
    const input = {
      action: "IDEAS",
      prompt: "",
    };
    const res = aiGenerateSchema.safeParse(input);
    assert.equal(res.success, false);
  });

  it("rejects unsupported action", () => {
    const input = {
      action: "TRANSLATE_TO_FRENCH",
      prompt: "Hello world",
    };
    const res = aiGenerateSchema.safeParse(input);
    assert.equal(res.success, false);
  });

  it("rejects prompt exceeding 3000 characters", () => {
    const input = {
      action: "REWRITE",
      prompt: "A".repeat(3001),
    };
    const res = aiGenerateSchema.safeParse(input);
    assert.equal(res.success, false);
  });
});
