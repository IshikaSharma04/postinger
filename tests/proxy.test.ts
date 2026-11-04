import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isPublicPath, PUBLIC_PATHS } from "../src/proxy";

describe("Proxy Route Matching", () => {
  it("matches root '/' exactly", () => {
    assert.equal(isPublicPath("/"), true);
  });

  it("does not match non-public paths that happen to start with '/'", () => {
    assert.equal(isPublicPath("/posts"), false);
    assert.equal(isPublicPath("/compose"), false);
    assert.equal(isPublicPath("/queue"), false);
    assert.equal(isPublicPath("/settings"), false);
    assert.equal(isPublicPath("/api/posts"), false);
    assert.equal(isPublicPath("/api/v1/posts"), false);
  });

  it("matches explicitly listed public path prefixes", () => {
    assert.equal(isPublicPath("/login"), true);
    assert.equal(isPublicPath("/register"), true);
    assert.equal(isPublicPath("/verify-email"), true);
    assert.equal(isPublicPath("/reset-password"), true);
    assert.equal(isPublicPath("/pricing"), true);
    assert.equal(isPublicPath("/blog"), true);
    assert.equal(isPublicPath("/blog/launching-postinger"), true);
    assert.equal(isPublicPath("/help"), true);
    assert.equal(isPublicPath("/legal/terms"), true);
    assert.equal(isPublicPath("/p/my-brand"), true);
    assert.equal(isPublicPath("/api/auth/session"), true);
    assert.equal(isPublicPath("/api/health"), true);
  });
});
