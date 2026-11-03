import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { createPostCommentSchema } from "@/lib/validators/schemas";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/posts/:id/comments
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();
  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return apiNotFound("Post not found");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: post.workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const comments = await prisma.postComment.findMany({
    where: { postId: id },
    include: {
      author: { select: { id: true, name: true, image: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return apiSuccess({ comments });
}

// POST /api/posts/:id/comments
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

  const parsed = createPostCommentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return apiNotFound("Post not found");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: post.workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const comment = await prisma.postComment.create({
    data: {
      postId: id,
      authorId: session.user.id,
      content: parsed.data.content,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return apiSuccess(comment, 201);
}
