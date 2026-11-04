import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { Role, Workspace, WorkspaceMember } from "@prisma/client";
import { redirect } from "next/navigation";
import { apiForbidden } from "@/lib/utils/api";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export type WorkspaceMemberWithWorkspace = WorkspaceMember & { workspace: Workspace };

export async function requireWorkspaceMember(
  userId: string,
  workspaceId: string,
  check?: (role: Role) => boolean
): Promise<{ member: WorkspaceMemberWithWorkspace; error: null } | { member: null; error: NextResponse }> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
    include: { workspace: true },
  });

  if (!member) {
    return { member: null, error: apiForbidden("Access denied: not a workspace member") };
  }

  if (check && !check(member.role)) {
    return { member: null, error: apiForbidden("Forbidden: insufficient permissions") };
  }

  return { member, error: null };
}

export async function getDefaultWorkspace(userId: string) {
  const member = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { joinedAt: "asc" },
  });
  return member?.workspace ?? null;
}
