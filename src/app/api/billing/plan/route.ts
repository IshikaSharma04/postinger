import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { createAuditLog } from "@/lib/utils/audit";
import { Plan } from "@prisma/client";
import { z } from "zod";

const planUpdateSchema = z.object({
  workspaceId: z.string(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = planUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid plan request", 400);
  }

  const { workspaceId, plan } = parsed.data;

  // Verify caller is OWNER or ADMIN
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return apiForbidden("Only workspace owners and administrators can change billing plans.");
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { plan: plan as Plan },
  });

  await createAuditLog({
    workspaceId,
    userId: session.user.id,
    action: "PLAN_UPDATED",
    entity: "workspace",
    entityId: workspaceId,
    metadata: { previousPlan: member.role, newPlan: plan },
  });

  return apiSuccess({
    workspace: updatedWorkspace,
    message: `Successfully upgraded to the ${plan} plan! Your caps and features have been updated.`,
  });
}
