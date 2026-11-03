import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

/** Get the current session user, or redirect to login */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

/** Get the current user's workspace membership and enforce role */
export async function requireWorkspaceAccess(
  workspaceId: string,
  minimumRole: Role = "MEMBER"
) {
  const user = await requireAuth();

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: user.id! },
    },
    include: { workspace: true },
  });

  if (!member) {
    throw new Error("ACCESS_DENIED");
  }

  const roleHierarchy: Record<Role, number> = {
    VIEWER: 0,
    MEMBER: 1,
    CONTRIBUTOR: 2,
    MANAGER: 3,
    ADMIN: 4,
    OWNER: 5,
  };

  if (roleHierarchy[member.role] < roleHierarchy[minimumRole]) {
    throw new Error("INSUFFICIENT_ROLE");
  }

  return { user, member, workspace: member.workspace };
}

/** Get the first workspace for the current user */
export async function getDefaultWorkspace(userId: string) {
  const member = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { joinedAt: "asc" },
  });
  return member?.workspace ?? null;
}
