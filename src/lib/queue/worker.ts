import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@/lib/db/client";
import { getProvider } from "@/lib/providers/adapters";
import { deriveAndUpdatePostStatus } from "@/lib/posts/publishing";
import { logger } from "@/lib/utils/logger";
import type { Platform } from "@prisma/client";

export const PUBLISH_QUEUE_NAME = "postinger-publish";

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL environment variable is not set");

    redisConnection = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        return Math.min(times * 100, 3000);
      },
    });

    redisConnection.on("error", (err) => {
      logger.warn(`Redis connection error: ${err.message}`);
    });
  }
  return redisConnection;
}

let publishQueue: Queue | null = null;

export function getPublishQueue(): Queue {
  if (!publishQueue) {
    publishQueue = new Queue(PUBLISH_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 100 },
      },
    });
  }
  return publishQueue;
}

export interface PublishJobData {
  publishingJobId: string;
  postId: string;
  socialAccountId: string;
  workspaceId: string;
  idempotencyKey: string;
}

export async function enqueuePublishJob(
  jobData: PublishJobData,
  scheduledAt: Date
): Promise<void> {
  try {
    const queue = getPublishQueue();
    const delay = Math.max(0, scheduledAt.getTime() - Date.now());

    await queue.add("publish", jobData, {
      delay,
      jobId: jobData.idempotencyKey,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.warn(`Failed to enqueue job to Redis: ${msg}`);
  }
}

export async function removeJobFromQueue(jobId: string): Promise<void> {
  try {
    const queue = getPublishQueue();
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.warn(`Failed to remove job ${jobId} from queue: ${msg}`);
  }
}

export async function processPublishJob(jobData: PublishJobData): Promise<void> {
  const { publishingJobId, postId, socialAccountId } = jobData;
  const startedAt = new Date();

  // Atomic claim: only PENDING or RETRYING jobs can be claimed
  const claim = await prisma.publishingJob.updateMany({
    where: {
      id: publishingJobId,
      status: { in: ["PENDING", "RETRYING"] },
    },
    data: {
      status: "RUNNING",
      startedAt,
      lockedAt: startedAt,
      attempts: { increment: 1 },
    },
  });

  if (claim.count === 0) {
    return;
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: "PROCESSING" },
  });

  const attemptStart = Date.now();

  try {
    const [post, socialAccount, variant] = await Promise.all([
      prisma.post.findUnique({
        where: { id: postId },
        include: {
          mediaAttachments: { include: { asset: true }, orderBy: { order: "asc" } },
        },
      }),
      prisma.socialAccount.findUnique({ where: { id: socialAccountId } }),
      prisma.postVariant.findUnique({
        where: { postId_socialAccountId: { postId, socialAccountId } },
      }),
    ]);

    if (!post || !socialAccount) {
      throw new Error("Post or social account not found");
    }

    if (!socialAccount.isConnected) {
      throw new Error(`Social account @${socialAccount.handle} is disconnected.`);
    }

    const publishBody = variant?.customBody?.trim() ? variant.customBody : post.body;
    const publishHashtags = variant?.customHashtags?.length ? variant.customHashtags : post.hashtags;
    const mediaUrls = post.mediaAttachments.map((m) => m.asset.url);

    const provider = getProvider(socialAccount.platform as Platform);
    const result = await provider.publish({
      handle: socialAccount.handle,
      body: publishBody,
      hashtags: publishHashtags,
      mediaUrls,
      credentials: (socialAccount.credentials as Record<string, unknown>) ?? {},
    });

    if (!result.success) {
      throw new Error(result.error ?? "Provider rejected publish attempt");
    }

    const duration = Date.now() - attemptStart;

    await prisma.$transaction([
      prisma.jobAttempt.create({
        data: {
          jobId: publishingJobId,
          status: "COMPLETED",
          duration,
        },
      }),
      prisma.publishingJob.update({
        where: { id: publishingJobId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          lockedAt: null,
          lastError: null,
        },
      }),
    ]);

    await deriveAndUpdatePostStatus(postId);
    logger.info(`Published job ${publishingJobId} to ${socialAccount.platform} (@${socialAccount.handle})`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const duration = Date.now() - attemptStart;

    const currentJob = await prisma.publishingJob.findUnique({
      where: { id: publishingJobId },
      select: { attempts: true, maxAttempts: true },
    });
    const currentAttempts = currentJob?.attempts ?? 1;
    const isLastAttempt = currentAttempts >= (currentJob?.maxAttempts ?? 3);

    await prisma.$transaction([
      prisma.jobAttempt.create({
        data: {
          jobId: publishingJobId,
          status: "FAILED",
          error: errorMessage,
          duration,
        },
      }),
      prisma.publishingJob.update({
        where: { id: publishingJobId },
        data: {
          status: isLastAttempt ? "FAILED" : "RETRYING",
          lockedAt: null,
          lastError: errorMessage,
          nextRetryAt: isLastAttempt
            ? null
            : new Date(Date.now() + 5000 * Math.pow(2, currentAttempts - 1)),
        },
      }),
    ]);

    await deriveAndUpdatePostStatus(postId);
    throw err;
  }
}

let isSweeperRunning = false;

export async function sweepOverdueScheduledJobs(): Promise<number> {
  if (isSweeperRunning) return 0;
  isSweeperRunning = true;

  try {
    const now = new Date();

    // 1. Recover jobs stuck in RUNNING for more than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await prisma.publishingJob.updateMany({
      where: {
        status: "RUNNING",
        lockedAt: { lt: fiveMinutesAgo },
      },
      data: {
        status: "PENDING",
        lockedAt: null,
      },
    });

    // 2. Query overdue PENDING jobs (overdue by > 1 minute with respect to nextRetryAt)
    const overdueThreshold = new Date(Date.now() - 60 * 1000);
    const overdueJobs = await prisma.publishingJob.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { lte: overdueThreshold },
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
      },
      take: 10,
      include: {
        post: { select: { workspaceId: true } },
      },
    });

    for (const job of overdueJobs) {
      try {
        await processPublishJob({
          publishingJobId: job.id,
          postId: job.postId,
          socialAccountId: job.socialAccountId,
          workspaceId: job.post.workspaceId,
          idempotencyKey: job.idempotencyKey,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        logger.warn(`Sweeper job ${job.id} failed: ${msg}`);
      }
    }

    return overdueJobs.length;
  } finally {
    isSweeperRunning = false;
  }
}

let globalWorker: Worker | null = null;
let sweeperInterval: NodeJS.Timeout | null = null;

export function startPublishWorker(): Worker | null {
  if (globalWorker) return globalWorker;

  try {
    globalWorker = new Worker<PublishJobData>(
      PUBLISH_QUEUE_NAME,
      async (job: Job<PublishJobData>) => {
        await processPublishJob(job.data);
      },
      {
        connection: getRedisConnection(),
        concurrency: 5,
      }
    );

    globalWorker.on("failed", (job, err) => {
      logger.warn(`BullMQ job failed: ${job?.id} - ${err?.message}`);
    });

    globalWorker.on("completed", (job) => {
      logger.info(`BullMQ job completed: ${job?.id}`);
    });

    if (!sweeperInterval) {
      sweeperInterval = setInterval(() => {
        sweepOverdueScheduledJobs().catch((err) => {
          logger.warn(`Error sweeping overdue jobs: ${err?.message}`);
        });
      }, 30000);
      sweepOverdueScheduledJobs().catch(() => {});
    }

    return globalWorker;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.warn(`Could not start BullMQ worker: ${msg}`);
    return null;
  }
}

export async function stopPublishWorker(): Promise<void> {
  if (sweeperInterval) {
    clearInterval(sweeperInterval);
    sweeperInterval = null;
  }
  if (globalWorker) {
    await globalWorker.close();
    globalWorker = null;
  }
  if (publishQueue) {
    await publishQueue.close();
    publishQueue = null;
  }
  if (redisConnection) {
    try {
      await redisConnection.quit();
    } catch {
      redisConnection.disconnect();
    }
    redisConnection = null;
  }
}

