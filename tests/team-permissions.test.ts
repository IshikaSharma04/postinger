import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  canPublishDirectly,
  canSubmitForApproval,
  canApprovePost,
  canManageChannels,
  canManageTeam,
  canCreateDraft,
} from "../src/lib/auth/permissions";

describe("Role & Team Permissions Logic", () => {
  test("VIEWER role has strictly read-only permissions", () => {
    assert.equal(canPublishDirectly("VIEWER"), false);
    assert.equal(canSubmitForApproval("VIEWER"), false);
    assert.equal(canApprovePost("VIEWER"), false);
    assert.equal(canManageChannels("VIEWER"), false);
    assert.equal(canManageTeam("VIEWER"), false);
    assert.equal(canCreateDraft("VIEWER"), false);
  });

  test("CONTRIBUTOR can draft and submit for approval but cannot publish directly", () => {
    assert.equal(canCreateDraft("CONTRIBUTOR"), true);
    assert.equal(canSubmitForApproval("CONTRIBUTOR"), true);
    assert.equal(canPublishDirectly("CONTRIBUTOR"), false);
    assert.equal(canApprovePost("CONTRIBUTOR"), false);
    assert.equal(canManageChannels("CONTRIBUTOR"), false);
    assert.equal(canManageTeam("CONTRIBUTOR"), false);
  });

  test("MANAGER can approve posts and publish directly but cannot alter team/billing", () => {
    assert.equal(canCreateDraft("MANAGER"), true);
    assert.equal(canPublishDirectly("MANAGER"), true);
    assert.equal(canApprovePost("MANAGER"), true);
    assert.equal(canManageChannels("MANAGER"), false);
    assert.equal(canManageTeam("MANAGER"), false);
  });

  test("ADMIN and OWNER have full authority across publishing, approvals, and team management", () => {
    for (const role of ["ADMIN", "OWNER"] as const) {
      assert.equal(canCreateDraft(role), true);
      assert.equal(canPublishDirectly(role), true);
      assert.equal(canApprovePost(role), true);
      assert.equal(canManageChannels(role), true);
      assert.equal(canManageTeam(role), true);
    }
  });
});
