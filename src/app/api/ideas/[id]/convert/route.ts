import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { createAuditLog } from "@/lib/utils/audit";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/ideas/:id/convert — turns an idea into a Post draft
export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();
  const userId = session.user.id;
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return apiNotFound("Idea not found");

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: idea.workspaceId, userId } },
  });
  if (!member) return apiForbidden();

  // Find the first connected social account in workspace
  const defaultAccount = await prisma.socialAccount.findFirst({
    where: { workspaceId: idea.workspaceId, isConnected: true },
  });

  const post = await prisma.$transaction(async (tx) => {
    // 1. Create draft post from idea
    const newPost = await tx.post.create({
      data: {
        workspaceId: idea.workspaceId,
        authorId: userId,
        title: idea.title,
        body: idea.content || idea.title,
        hashtags: idea.tags,
        status: "DRAFT",
        ...(defaultAccount
          ? {
              postAccounts: {
                create: [{ socialAccountId: defaultAccount.id }],
              },
            }
          : {}),
      },
    });

    // 2. Mark idea as DONE and link converted post
    await tx.idea.update({
      where: { id },
      data: {
        status: "DONE",
        convertedToPostId: newPost.id,
      },
    });

    return newPost;
  });

  await createAuditLog({
    workspaceId: idea.workspaceId,
    userId: session.user.id,
    action: "IDEA_CONVERTED_TO_POST",
    entity: "idea",
    entityId: id,
    metadata: { postId: post.id },
  });

  return apiSuccess({ post, message: "Idea successfully turned into post draft" }, 201);
}
