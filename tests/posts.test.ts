import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { updatePostSchema, createPostSchema } from "../src/lib/validators/schemas";

describe("Post Validation Schemas", () => {
  describe("createPostSchema", () => {
    it("validates valid post payload", () => {
      const payload = {
        workspaceId: "ws_clx001",
        title: "Product Launch Announcement",
        body: "Excited to introduce Postly — an enterprise-grade social planning suite.",
        hashtags: ["buildinpublic", "nextjs", "tech"],
        socialAccountIds: ["acc_tw_123", "acc_li_456"],
        status: "SCHEDULED" as const,
      };
      const res = createPostSchema.safeParse(payload);
      assert.equal(res.success, true);
    });

    it("rejects post with empty body", () => {
      const payload = {
        workspaceId: "ws_clx001",
        body: "",
        socialAccountIds: ["acc_tw_123"],
      };
      const res = createPostSchema.safeParse(payload);
      assert.equal(res.success, false);
    });

    it("rejects post without any selected social accounts", () => {
      const payload = {
        workspaceId: "ws_clx001",
        body: "Valid body text",
        socialAccountIds: [],
      };
      const res = createPostSchema.safeParse(payload);
      assert.equal(res.success, false);
    });
  });

  describe("updatePostSchema", () => {
    it("validates partial post updates", () => {
      const partialUpdate = {
        id: "post_12345",
        workspaceId: "ws_clx001",
        body: "Updated caption text for social feed.",
        status: "DRAFT" as const,
      };
      const res = updatePostSchema.safeParse(partialUpdate);
      assert.equal(res.success, true);
    });

    it("rejects update missing post id or workspaceId", () => {
      const missingId = {
        workspaceId: "ws_clx001",
        body: "Updated body",
      };
      const res1 = updatePostSchema.safeParse(missingId);
      assert.equal(res1.success, false);

      const missingWs = {
        id: "post_12345",
        body: "Updated body",
      };
      const res2 = updatePostSchema.safeParse(missingWs);
      assert.equal(res2.success, false);
    });
  });
});
