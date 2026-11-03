import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { updateIdeaSchema } from "@/lib/validators/schemas";
import { createAuditLog } from "@/lib/utils/audit";

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/ideas/:id
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return apiNotFound("Idea not found");

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: idea.workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const bodyObj = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const parsed = updateIdeaSchema.safeParse({ ...bodyObj, id, workspaceId: idea.workspaceId });
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const data = parsed.data;

  const updated = await prisma.idea.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.mediaUrl !== undefined && { mediaUrl: data.mediaUrl }),
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return apiSuccess(updated);
}

// DELETE /api/ideas/:id
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return apiNotFound("Idea not found");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: idea.workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  await prisma.idea.delete({ where: { id } });

  await createAuditLog({
    workspaceId: idea.workspaceId,
    userId: session.user.id,
    action: "IDEA_DELETED",
    entity: "idea",
    entityId: id,
  });

  return apiSuccess({ deleted: true });
}
