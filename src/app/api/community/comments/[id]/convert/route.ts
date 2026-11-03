import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/community/comments/:id/convert
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();
  const { id } = await params;

  const comment = await prisma.socialComment.findUnique({ where: { id } });
  if (!comment) return apiNotFound("Comment not found");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: comment.workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  // Find a connected account to pre-select
  const account = await prisma.socialAccount.findFirst({
    where: { workspaceId: comment.workspaceId },
  });

  const postBody = `Responding to ${comment.authorHandle}:\n\n"${comment.content}"\n\nHere is our perspective: `;

  const post = await prisma.post.create({
    data: {
      workspaceId: comment.workspaceId,
      authorId: session.user.id,
      title: `Response to ${comment.authorHandle}`,
      body: postBody,
      hashtags: ["community", "qa"],
      status: "DRAFT",
      postAccounts: account ? { create: [{ socialAccountId: account.id }] } : undefined,
    },
  });

  return apiSuccess(post, 201);
}
