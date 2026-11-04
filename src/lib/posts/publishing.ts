import { prisma } from "@/lib/db/client";
import { enqueuePublishJob, removeJobFromQueue } from "@/lib/queue/worker";
import { v4 as uuidv4 } from "uuid";
import type { Prisma, PostStatus } from "@prisma/client";

export interface CreateJobsResult {
  jobs: Array<{
    id: string;
    postId: string;
    socialAccountId: string;
    workspaceId: string;
    idempotencyKey: string;
    scheduledAt: Date;
  }>;
}

export async function createJobsForPost(
  tx: Prisma.TransactionClient,
  params: {
    postId: string;
    workspaceId: string;
    socialAccountIds: string[];
    scheduledAt: Date;
    isPublishNow: boolean;
  }
): Promise<CreateJobsResult["jobs"]> {
  const { postId, workspaceId, socialAccountIds, scheduledAt, isPublishNow } = params;
  const createdJobs: CreateJobsResult["jobs"] = [];

  for (const accountId of socialAccountIds) {
    const idempotencyKey = uuidv4();
    const job = await tx.publishingJob.create({
      data: {
        postId,
        socialAccountId: accountId,
        scheduledAt,
        idempotencyKey,
        status: "PENDING",
      },
    });

    createdJobs.push({
      id: job.id,
      postId,
      socialAccountId: accountId,
      workspaceId,
      idempotencyKey,
      scheduledAt: isPublishNow ? new Date() : scheduledAt,
    });
  }

  return createdJobs;
}

export async function enqueueJobsAfterCommit(
  jobs: CreateJobsResult["jobs"]
): Promise<void> {
  for (const job of jobs) {
    await enqueuePublishJob(
      {
        publishingJobId: job.id,
        postId: job.postId,
        socialAccountId: job.socialAccountId,
        workspaceId: job.workspaceId,
        idempotencyKey: job.idempotencyKey,
      },
      job.scheduledAt
    );
  }
}

export async function cancelJobsForPost(
  tx: Prisma.TransactionClient,
  postId: string
): Promise<void> {
  const pendingJobs = await tx.publishingJob.findMany({
    where: { postId, status: { in: ["PENDING", "RETRYING"] } },
    select: { id: true, idempotencyKey: true },
  });

  if (pendingJobs.length === 0) return;

  await tx.publishingJob.updateMany({
    where: { postId, status: { in: ["PENDING", "RETRYING"] } },
    data: { status: "CANCELLED" },
  });

  for (const j of pendingJobs) {
    await removeJobFromQueue(j.idempotencyKey);
  }
}

export async function deriveAndUpdatePostStatus(postId: string): Promise<PostStatus> {
  const jobs = await prisma.publishingJob.findMany({
    where: { postId },
    select: { status: true },
  });

  if (jobs.length === 0) {
    return "DRAFT";
  }

  const completed = jobs.filter((j) => j.status === "COMPLETED").length;
  const failed = jobs.filter((j) => j.status === "FAILED").length;
  const inFlight = jobs.filter((j) =>
    j.status === "RUNNING" || j.status === "PENDING" || j.status === "RETRYING"
  ).length;

  let derived: PostStatus = "PROCESSING";

  if (inFlight === 0) {
    if (completed === jobs.length) {
      derived = "PUBLISHED";
    } else if (failed === jobs.length) {
      derived = "FAILED";
    } else if (completed > 0) {
      derived = "PARTIALLY_FAILED";
    }
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: derived,
      ...(derived === "PUBLISHED" || derived === "PARTIALLY_FAILED"
        ? { publishedAt: new Date() }
        : {}),
    },
  });

  return derived;
}
