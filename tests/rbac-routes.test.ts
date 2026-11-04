import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/db/client";
import { requireWorkspaceMember } from "../src/lib/auth/helpers";
import {
  canCreateDraft,
  canPublishDirectly,
  canManageChannels,
  canManageTeam,
} from "../src/lib/auth/permissions";

describe("Workspace RBAC and Tenant Isolation", () => {
  let wsAId = "";
  let wsBId = "";
  let viewerUserId = "";
  let contributorUserId = "";
  let ownerUserId = "";
  let wsBUserId = "";

  before(async () => {
    // Create test workspace A
    const wsA = await prisma.workspace.upsert({
      where: { slug: "test-rbac-workspace-a" },
      update: {},
      create: { name: "RBAC Workspace A", slug: "test-rbac-workspace-a" },
    });
    wsAId = wsA.id;

    // Create test workspace B
    const wsB = await prisma.workspace.upsert({
      where: { slug: "test-rbac-workspace-b" },
      update: {},
      create: { name: "RBAC Workspace B", slug: "test-rbac-workspace-b" },
    });
    wsBId = wsB.id;

    // Create Owner user
    const owner = await prisma.user.upsert({
      where: { email: "owner@rbactest.com" },
      update: {},
      create: { name: "Owner", email: "owner@rbactest.com", passwordHash: "mock" },
    });
    ownerUserId = owner.id;
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: wsAId, userId: ownerUserId } },
      update: { role: "OWNER" },
      create: { workspaceId: wsAId, userId: ownerUserId, role: "OWNER" },
    });

    // Create Contributor user
    const contributor = await prisma.user.upsert({
      where: { email: "contributor@rbactest.com" },
      update: {},
      create: { name: "Contributor", email: "contributor@rbactest.com", passwordHash: "mock" },
    });
    contributorUserId = contributor.id;
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: wsAId, userId: contributorUserId } },
      update: { role: "CONTRIBUTOR" },
      create: { workspaceId: wsAId, userId: contributorUserId, role: "CONTRIBUTOR" },
    });

    // Create Viewer user
    const viewer = await prisma.user.upsert({
      where: { email: "viewer@rbactest.com" },
      update: {},
      create: { name: "Viewer", email: "viewer@rbactest.com", passwordHash: "mock" },
    });
    viewerUserId = viewer.id;
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: wsAId, userId: viewerUserId } },
      update: { role: "VIEWER" },
      create: { workspaceId: wsAId, userId: viewerUserId, role: "VIEWER" },
    });

    // Create Workspace B user
    const wsBUser = await prisma.user.upsert({
      where: { email: "userb@rbactest.com" },
      update: {},
      create: { name: "User B", email: "userb@rbactest.com", passwordHash: "mock" },
    });
    wsBUserId = wsBUser.id;
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: wsBId, userId: wsBUserId } },
      update: { role: "OWNER" },
      create: { workspaceId: wsBId, userId: wsBUserId, role: "OWNER" },
    });
  });

  it("permits OWNER to create drafts, publish, manage channels and team", async () => {
    const res = await requireWorkspaceMember(ownerUserId, wsAId, canManageTeam);
    assert.equal(res.error, null);
    assert.ok(res.member);
    assert.equal(res.member.role, "OWNER");
  });

  it("denies VIEWER from creating drafts", async () => {
    const res = await requireWorkspaceMember(viewerUserId, wsAId, canCreateDraft);
    assert.notEqual(res.error, null);
    assert.equal(res.member, null);
    assert.equal(res.error?.status, 403);
  });

  it("permits CONTRIBUTOR to create drafts but denies direct publishing", async () => {
    const canDraft = await requireWorkspaceMember(contributorUserId, wsAId, canCreateDraft);
    assert.equal(canDraft.error, null);
    assert.ok(canDraft.member);

    const canPublish = await requireWorkspaceMember(contributorUserId, wsAId, canPublishDirectly);
    assert.notEqual(canPublish.error, null);
    assert.equal(canPublish.error?.status, 403);
  });

  it("denies CONTRIBUTOR from managing social channels", async () => {
    const res = await requireWorkspaceMember(contributorUserId, wsAId, canManageChannels);
    assert.notEqual(res.error, null);
    assert.equal(res.error?.status, 403);
  });

  it("strictly enforces tenant isolation: member of workspace A cannot touch workspace B", async () => {
    // Owner of Workspace A attempting to access Workspace B
    const resAonB = await requireWorkspaceMember(ownerUserId, wsBId);
    assert.notEqual(resAonB.error, null);
    assert.equal(resAonB.error?.status, 403);

    // Member of Workspace B attempting to access Workspace A
    const resBonA = await requireWorkspaceMember(wsBUserId, wsAId);
    assert.notEqual(resBonA.error, null);
    assert.equal(resBonA.error?.status, 403);
  });
});
