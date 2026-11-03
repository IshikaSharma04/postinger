import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { updatePostSchema } from "@/lib/validators/schemas";
import { createAuditLog } from "@/lib/utils/audit";
import { enqueuePublishJob, processPublishJob } from "@/lib/queue/worker";
import { getNextQueueSlot } from "@/lib/utils/queue-slot";
import { v4 as uuidv4 } from "uuid";

type RouteParams = { params: Promise<{ id: string }> };

async function getPostWithAuth(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      postAccounts: { include: { socialAccount: true } },
      variants: { include: { socialAccount: true } },
      mediaAttachments: { include: { asset: true }, orderBy: { order: "asc" } },
      publishingJobs: {
        include: { jobAttempts: { orderBy: { attemptedAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) return { post: null, member: null };

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: post.workspaceId, userId } },
  });

  return { post, member };
}

// GET /api/posts/:id
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();
  const { id } = await params;

  const { post, member } = await getPostWithAuth(id, session.user.id);
  if (!post) return apiNotFound("Post not found");
  if (!member) return apiForbidden();

  return apiSuccess(post);
}

// PATCH /api/posts/:id
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();
  const { id } = await params;

  const { post, member } = await getPostWithAuth(id, session.user.id);
  if (!post) return apiNotFound("Post not found");
  if (!member) return apiForbidden();

  // Only author or ADMIN/OWNER can edit
  const canEdit =
    post.authorId === session.user.id ||
    member.role === "ADMIN" ||
    member.role === "OWNER";
  if (!canEdit) return apiForbidden("Only the author or admin can edit this post");

  // Cannot edit published/processing posts
  if (["PUBLISHED", "PROCESSING"].includes(post.status)) {
    return apiError("Cannot edit a post that is published or being processed");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const bodyObj = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const parsed = updatePostSchema.safeParse({ ...bodyObj, id, workspaceId: post.workspaceId });
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const data = parsed.data;

  if (data.scheduledAt && data.scheduledAt < new Date()) {
    return apiError("Scheduled time must be in the future");
  }

  let targetStatus = data.status;
  let targetScheduledAt: Date | null | undefined = data.scheduledAt;
  const isPublishNow = data.action === "PUBLISH_NOW";

  if (isPublishNow) {
    targetStatus = "PROCESSING";
    targetScheduledAt = new Date();
  } else if (data.action === "QUEUE") {
    targetStatus = "SCHEDULED";
    targetScheduledAt = await getNextQueueSlot(post.workspaceId);
  } else if (data.action === "SUBMIT_FOR_APPROVAL") {
    targetStatus = "NEEDS_APPROVAL";
  } else if (data.action === "SCHEDULE" || data.scheduledAt) {
    targetStatus = "SCHEDULED";
  } else if (data.action === "DRAFT") {
    targetStatus = "DRAFT";
    targetScheduledAt = null;
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Cancel existing pending jobs if rescheduling or setting to draft
    await tx.publishingJob.updateMany({
      where: { postId: id, status: { in: ["PENDING", "RETRYING"] } },
      data: { status: "CANCELLED" },
    });

    const updatedPost = await tx.post.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.body && { body: data.body }),
        ...(data.hashtags && { hashtags: data.hashtags }),
        ...(targetStatus && { status: targetStatus }),
        ...(targetScheduledAt !== undefined && { scheduledAt: targetScheduledAt }),
        ...(data.socialAccountIds && {
          postAccounts: {
            deleteMany: {},
            create: data.socialAccountIds.map((sid) => ({ socialAccountId: sid })),
          },
        }),
        ...(data.variants && {
          variants: {
            deleteMany: {},
            create: data.variants.map((v) => ({
              socialAccountId: v.socialAccountId,
              customBody: v.customBody,
              customHashtags: v.customHashtags ?? [],
              firstComment: v.firstComment,
            })),
          },
        }),
        ...(data.mediaAssetIds && {
          mediaAttachments: {
            deleteMany: {},
            create: data.mediaAssetIds.map((mid, idx) => ({
              assetId: mid,
              order: idx,
            })),
          },
        }),
      },
      include: {
        postAccounts: { include: { socialAccount: true } },
        variants: { include: { socialAccount: true } },
        mediaAttachments: { include: { asset: true }, orderBy: { order: "asc" } },
      },
    });

    // Schedule or dispatch jobs if needed
    if ((updatedPost.status === "SCHEDULED" || isPublishNow) && updatedPost.scheduledAt) {
      for (const acc of updatedPost.postAccounts) {
        const idempotencyKey = uuidv4();
        const job = await tx.publishingJob.create({
          data: {
            postId: id,
            socialAccountId: acc.socialAccountId,
            scheduledAt: updatedPost.scheduledAt!,
            idempotencyKey,
            status: isPublishNow ? "RUNNING" : "PENDING",
            startedAt: isPublishNow ? new Date() : null,
          },
        });

        await enqueuePublishJob(
          {
            publishingJobId: job.id,
            postId: id,
            socialAccountId: acc.socialAccountId,
            workspaceId: post.workspaceId,
            idempotencyKey,
          },
          updatedPost.scheduledAt!
        );

        if (isPublishNow) {
          processPublishJob({
            publishingJobId: job.id,
            postId: id,
            socialAccountId: acc.socialAccountId,
            workspaceId: post.workspaceId,
            idempotencyKey,
          }).catch((err) => console.error("[PublishNow] PATCH execution error:", err?.message));
        }
      }
    }

    return updatedPost;
  });


  await createAuditLog({
    workspaceId: post.workspaceId,
    userId: session.user.id,
    action: "POST_UPDATED",
    entity: "post",
    entityId: id,
    metadata: { status: updated.status },
  });

  return apiSuccess(updated);
}

// DELETE /api/posts/:id
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();
  const { id } = await params;

  const { post, member } = await getPostWithAuth(id, session.user.id);
  if (!post) return apiNotFound("Post not found");
  if (!member) return apiForbidden();

  const canDelete =
    post.authorId === session.user.id ||
    member.role === "ADMIN" ||
    member.role === "OWNER";
  if (!canDelete) return apiForbidden();

  if (post.status === "PROCESSING") {
    return apiError("Cannot delete a post that is currently being processed");
  }

  await prisma.post.delete({ where: { id } });

  await createAuditLog({
    workspaceId: post.workspaceId,
    userId: session.user.id,
    action: "POST_DELETED",
    entity: "post",
    entityId: id,
  });

  return apiSuccess({ deleted: true });
}
