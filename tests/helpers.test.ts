import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { slugify, truncate, getPlatformColor } from "../src/lib/utils/helpers";

describe("Helper Utilities", () => {
  describe("slugify", () => {
    it("converts strings with spaces and punctuation to URL-friendly slugs", () => {
      assert.equal(slugify("My Workspace #1!"), "my-workspace-1");
      assert.equal(slugify("  Lots   of   spaces  "), "lots-of-spaces");
      assert.equal(slugify("Special---Characters???"), "special-characters");
    });
  });

  describe("truncate", () => {
    it("truncates long strings with ellipsis", () => {
      assert.equal(truncate("Hello world this is a test", 10), "Hello worl…");
    });

    it("returns original string if within limit", () => {
      assert.equal(truncate("Short", 10), "Short");
    });
  });

  describe("getPlatformColor", () => {
    it("returns correct brand colors for supported platforms", () => {
      assert.equal(getPlatformColor("TWITTER"), "#1DA1F2");
      assert.equal(getPlatformColor("INSTAGRAM"), "#E1306C");
      assert.equal(getPlatformColor("LINKEDIN"), "#0077B5");
    });
  });
});
