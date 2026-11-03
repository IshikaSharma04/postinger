import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { replyCommentSchema } from "@/lib/validators/schemas";
import { createAuditLog } from "@/lib/utils/audit";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/community/comments/:id/reply
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = replyCommentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const comment = await prisma.socialComment.findUnique({ where: { id } });
  if (!comment) return apiNotFound("Comment not found");

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: comment.workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const updated = await prisma.socialComment.update({
    where: { id },
    data: {
      replyText: parsed.data.replyText,
      status: "REPLIED",
      repliedAt: new Date(),
    },
  });

  await createAuditLog({
    workspaceId: comment.workspaceId,
    userId: session.user.id,
    action: "COMMENT_REPLIED",
    entity: "social_comment",
    entityId: id,
    metadata: { platform: comment.platform, author: comment.authorHandle },
  });

  return apiSuccess(updated);
}
