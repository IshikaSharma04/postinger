import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/utils/api";
import { enqueuePublishJob } from "@/lib/queue/worker";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  const status = req.nextUrl.searchParams.get("status");
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(req.nextUrl.searchParams.get("limit") ?? "20"));

  if (!workspaceId) return apiError("workspaceId is required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const where: import("@prisma/client").Prisma.PublishingJobWhereInput = {
    post: { workspaceId },
    ...(status ? { status: status as import("@prisma/client").JobStatus } : {}),
  };

  const [jobs, total] = await Promise.all([
    prisma.publishingJob.findMany({
      where,
      include: {
        post: { select: { id: true, title: true, body: true, status: true } },
        socialAccount: { select: { id: true, platform: true, handle: true, displayName: true } },
        jobAttempts: { orderBy: { attemptedAt: "desc" }, take: 10 },
      },
      orderBy: { scheduledAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.publishingJob.count({ where }),
  ]);

  return apiSuccess({ jobs, total, page, limit, pages: Math.ceil(total / limit) });
}

// POST /api/queue/retry
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const { jobId, workspaceId } = await req.json();
  if (!jobId || !workspaceId) return apiError("jobId and workspaceId are required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();
  if (member.role === "MEMBER") return apiForbidden("Only admins can retry jobs");

  const job = await prisma.publishingJob.findFirst({
    where: { id: jobId, post: { workspaceId } },
  });
  if (!job) return apiNotFound("Job not found");
  if (job.status !== "FAILED") return apiError("Only failed jobs can be retried");
  if (job.attempts >= job.maxAttempts + 3) {
    return apiError("Maximum retry limit reached");
  }

  const idempotencyKey = uuidv4();
  const scheduledAt = new Date(Date.now() + 5000); // retry in 5 seconds

  const updated = await prisma.$transaction(async (tx) => {
    const newKey = idempotencyKey;
    const updatedJob = await tx.publishingJob.update({
      where: { id: jobId },
      data: {
        status: "PENDING",
        idempotencyKey: newKey,
        nextRetryAt: scheduledAt,
        lastError: null,
      },
    });

    await tx.post.update({
      where: { id: job.postId },
      data: { status: "SCHEDULED" },
    });

    return updatedJob;
  });

  await enqueuePublishJob(
    {
      publishingJobId: jobId,
      postId: job.postId,
      socialAccountId: job.socialAccountId,
      workspaceId,
      idempotencyKey,
    },
    scheduledAt
  );

  return apiSuccess(updated);
}
