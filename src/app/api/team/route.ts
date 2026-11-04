import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { createAuditLog } from "@/lib/utils/audit";
import { getPlanLimits } from "@/lib/plans/limits";
import { Role } from "@prisma/client";
import { z } from "zod";

const inviteMemberSchema = z.object({
  workspaceId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "CONTRIBUTOR", "VIEWER", "MEMBER"]).default("CONTRIBUTOR"),
});

const updateMemberRoleSchema = z.object({
  workspaceId: z.string().min(1),
  memberId: z.string().min(1),
  role: z.enum(["ADMIN", "MANAGER", "CONTRIBUTOR", "VIEWER", "MEMBER"]),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return apiError("workspaceId is required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  return apiSuccess(members);
}

// POST /api/team — Invite a user by email
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = inviteMemberSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error");

  const { workspaceId, email, role } = parsed.data;

  // Verify caller is OWNER or ADMIN
  const caller = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    include: { workspace: true },
  });

  if (!caller || (caller.role !== "OWNER" && caller.role !== "ADMIN")) {
    return apiForbidden("Only owners and admins can invite team members");
  }

  // Enforce team member plan limits
  const limits = getPlanLimits(caller.workspace.plan);
  const currentMemberCount = await prisma.workspaceMember.count({ where: { workspaceId } });
  if (currentMemberCount >= limits.teamMembers) {
    return apiError(
      `Plan limit reached: You can have up to ${limits.teamMembers} team members on the ${limits.name} plan. Upgrade to invite more collaborators.`
    );
  }

  // Find or create invited user
  let targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        passwordHash: "$2a$12$eXampLeHashTokenPlaceholderForInvitedCollaborator",
      },
    });
  }

  // Check if already a member
  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: targetUser.id } },
  });
  if (existing) {
    return apiError("This user is already a member of this workspace");
  }

  const newMember = await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: targetUser.id,
      role: role as Role,
    },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  await createAuditLog({
    workspaceId,
    userId: session.user.id,
    action: "TEAM_MEMBER_INVITED",
    entity: "workspaceMember",
    entityId: newMember.id,
    metadata: { invitedEmail: email, role },
  });

  return apiSuccess(newMember, 201);
}

// PATCH /api/team — Update role
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = updateMemberRoleSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error");

  const { workspaceId, memberId, role } = parsed.data;

  const caller = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!caller || (caller.role !== "OWNER" && caller.role !== "ADMIN")) {
    return apiForbidden("Only owners and admins can modify member roles");
  }

  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!target || target.workspaceId !== workspaceId) return apiError("Member not found");
  if (target.role === "OWNER") return apiForbidden("Cannot modify workspace owner");

  const updated = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role: role as Role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await createAuditLog({
    workspaceId,
    userId: session.user.id,
    action: "ROLE_CHANGED",
    entity: "workspaceMember",
    entityId: memberId,
    metadata: { previousRole: target.role, newRole: role },
  });

  return apiSuccess(updated);
}

// DELETE /api/team?id=...&workspaceId=... — Remove member
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const workspaceId = searchParams.get("workspaceId");

  if (!id || !workspaceId) return apiError("id and workspaceId are required");

  const caller = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!caller || (caller.role !== "OWNER" && caller.role !== "ADMIN")) {
    return apiForbidden("Only owners and admins can remove team members");
  }

  const target = await prisma.workspaceMember.findUnique({ where: { id } });
  if (!target || target.workspaceId !== workspaceId) return apiError("Member not found");
  if (target.role === "OWNER") return apiForbidden("Cannot remove the workspace owner");

  await prisma.workspaceMember.delete({ where: { id } });

  await createAuditLog({
    workspaceId,
    userId: session.user.id,
    action: "TEAM_MEMBER_REMOVED",
    entity: "workspaceMember",
    entityId: id,
    metadata: { removedUserId: target.userId },
  });

  return apiSuccess({ deleted: true });
}
