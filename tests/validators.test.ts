import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  registerSchema,
  loginSchema,
  createPostSchema,
  createWorkspaceSchema,
  connectAccountSchema,
} from "../src/lib/validators/schemas";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("validates valid registration data", () => {
      const valid = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Password123!",
      };
      const res = registerSchema.safeParse(valid);
      assert.equal(res.success, true);
    });

    it("rejects invalid email", () => {
      const invalid = {
        name: "Jane Doe",
        email: "not-an-email",
        password: "Password123!",
      };
      const res = registerSchema.safeParse(invalid);
      assert.equal(res.success, false);
    });

    it("rejects weak password without number", () => {
      const invalid = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Password!",
      };
      const res = registerSchema.safeParse(invalid);
      assert.equal(res.success, false);
    });

    it("rejects password shorter than 8 characters", () => {
      const invalid = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Pass1",
      };
      const res = registerSchema.safeParse(invalid);
      assert.equal(res.success, false);
    });
  });

  describe("loginSchema", () => {
    it("validates correct login credentials format", () => {
      const valid = { email: "user@postly.app", password: "Password123!" };
      const res = loginSchema.safeParse(valid);
      assert.equal(res.success, true);
    });

    it("rejects empty password", () => {
      const invalid = { email: "user@postly.app", password: "" };
      const res = loginSchema.safeParse(invalid);
      assert.equal(res.success, false);
    });
  });

  describe("createWorkspaceSchema", () => {
    it("validates correct workspace name and slug", () => {
      const valid = { name: "Acme Marketing", slug: "acme-marketing" };
      const res = createWorkspaceSchema.safeParse(valid);
      assert.equal(res.success, true);
    });

    it("rejects slugs with uppercase or special characters", () => {
      const invalid = { name: "Acme", slug: "Acme_Marketing!" };
      const res = createWorkspaceSchema.safeParse(invalid);
      assert.equal(res.success, false);
    });
  });

  describe("createPostSchema", () => {
    it("validates valid draft post", () => {
      const valid = {
        workspaceId: "ws-123456",
        body: "Hello social media world!",
        hashtags: ["launch", "marketing"],
        socialAccountIds: ["acc-1"],
        mediaAssetIds: [],
        status: "DRAFT",
      };
      const res = createPostSchema.safeParse(valid);
      assert.equal(res.success, true);
    });

    it("rejects post with empty content", () => {
      const invalid = {
        workspaceId: "ws-123456",
        body: "",
        socialAccountIds: ["acc-1"],
      };
      const res = createPostSchema.safeParse(invalid);
      assert.equal(res.success, false);
    });

    it("rejects post with no selected accounts", () => {
      const invalid = {
        workspaceId: "ws-123456",
        body: "Test post",
        socialAccountIds: [],
      };
      const res = createPostSchema.safeParse(invalid);
      assert.equal(res.success, false);
    });
  });

  describe("connectAccountSchema", () => {
    it("accepts valid supported platform and handle", () => {
      const valid = {
        workspaceId: "ws-123",
        platform: "TWITTER",
        handle: "postlyapp",
        displayName: "Postly App",
      };
      const res = connectAccountSchema.safeParse(valid);
      assert.equal(res.success, true);
    });

    it("rejects unsupported platform", () => {
      const invalid = {
        workspaceId: "ws-123",
        platform: "MYSPACE",
        handle: "test",
      };
      const res = connectAccountSchema.safeParse(invalid);
      assert.equal(res.success, false);
    });
  });

  describe("createIdeaSchema & updateIdeaSchema", () => {
    it("validates valid scratchpad idea", () => {
      const { createIdeaSchema } = require("../src/lib/validators/schemas");
      const valid = {
        workspaceId: "ws-123",
        title: "Video series on React server components",
        content: "Drafting script and screen recordings",
        tags: ["React", "Video"],
        status: "UNASSIGNED",
      };
      const res = createIdeaSchema.safeParse(valid);
      assert.equal(res.success, true);
    });

    it("rejects idea with empty title", () => {
      const { createIdeaSchema } = require("../src/lib/validators/schemas");
      const invalid = { workspaceId: "ws-123", title: "" };
      const res = createIdeaSchema.safeParse(invalid);
      assert.equal(res.success, false);
    });
  });

  describe("createPostingSlotSchema", () => {
    it("validates recurring weekly queue schedule slot", () => {
      const { createPostingSlotSchema } = require("../src/lib/validators/schemas");
      const valid = {
        workspaceId: "ws-123",
        dayOfWeek: 3, // Wednesday
        time: "14:30",
        timezone: "America/New_York",
      };
      const res = createPostingSlotSchema.safeParse(valid);
      assert.equal(res.success, true);
    });

    it("rejects invalid time format for queue slot", () => {
      const { createPostingSlotSchema } = require("../src/lib/validators/schemas");
      const invalid = {
        workspaceId: "ws-123",
        dayOfWeek: 3,
        time: "25:99",
      };
      const res = createPostingSlotSchema.safeParse(invalid);
      assert.equal(res.success, false);
    });
  });

  describe("approvePostSchema & replyCommentSchema", () => {
    it("validates post approval decision", () => {
      const { approvePostSchema } = require("../src/lib/validators/schemas");
      const valid = { decision: "APPROVE", notes: "Looks great, approved for publishing" };
      const res = approvePostSchema.safeParse(valid);
      assert.equal(res.success, true);
    });

    it("validates social inbox comment reply", () => {
      const { replyCommentSchema } = require("../src/lib/validators/schemas");
      const valid = { replyText: "Thanks for reaching out! We support this out of the box." };
      const res = replyCommentSchema.safeParse(valid);
      assert.equal(res.success, true);
    });
  });
});

