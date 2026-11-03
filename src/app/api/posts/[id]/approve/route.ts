import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { approvePostSchema } from "@/lib/validators/schemas";
import { createAuditLog } from "@/lib/utils/audit";
import { enqueuePublishJob } from "@/lib/queue/worker";
import { v4 as uuidv4 } from "uuid";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/posts/:id/approve
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();
  const reviewerId = session.user.id;
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = approvePostSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const { decision, notes } = parsed.data;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      postAccounts: true,
      approvalRequests: { where: { status: "PENDING" }, take: 1 },
    },
  });
  if (!post) return apiNotFound("Post not found");

  // Verify user has ADMIN or OWNER role in the workspace (Authorization)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: post.workspaceId, userId: reviewerId } },
  });
  if (!member) return apiForbidden();

  if (member.role !== "ADMIN" && member.role !== "OWNER") {
    return apiForbidden("Only workspace Admins and Owners can approve or reject posts");
  }

  const isApproved = decision === "APPROVE";
  const nextStatus = isApproved
    ? post.scheduledAt
      ? "SCHEDULED"
      : "DRAFT"
    : "DRAFT";

  const updated = await prisma.$transaction(async (tx) => {
    // 1. Update or create PostApproval
    const pendingApproval = post.approvalRequests[0];
    if (pendingApproval) {
      await tx.postApproval.update({
        where: { id: pendingApproval.id },
        data: {
          status: isApproved ? "APPROVED" : "REJECTED",
          reviewerId,
          notes,
        },
      });
    } else {
      await tx.postApproval.create({
        data: {
          postId: post.id,
          requestedById: post.authorId,
          reviewerId,
          status: isApproved ? "APPROVED" : "REJECTED",
          notes,
        },
      });
    }

    // 2. Update post status
    const updatedPost = await tx.post.update({
      where: { id },
      data: { status: nextStatus },
      include: { postAccounts: true },
    });

    // 3. If approved and scheduled, enqueue publishing jobs
    if (isApproved && updatedPost.status === "SCHEDULED" && updatedPost.scheduledAt) {
      for (const acc of updatedPost.postAccounts) {
        const idempotencyKey = uuidv4();
        const job = await tx.publishingJob.create({
          data: {
            postId: id,
            socialAccountId: acc.socialAccountId,
            scheduledAt: updatedPost.scheduledAt!,
            idempotencyKey,
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
      }
    }

    return updatedPost;
  });

  await createAuditLog({
    workspaceId: post.workspaceId,
    userId: session.user.id,
    action: isApproved ? "POST_APPROVED" : "POST_REJECTED",
    entity: "post",
    entityId: id,
    metadata: { decision, notes },
  });

  return apiSuccess({
    post: updated,
    message: isApproved ? "Post approved successfully" : "Post rejected and returned to draft",
  });
}
