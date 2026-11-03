import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@/lib/db/client";
import { getProvider } from "@/lib/providers/adapters";
import { Platform } from "@prisma/client";

// ── Redis Connection ───────────────────────────────────────────────────────────

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
      console.error("[Redis] Connection error:", err.message);
    });
  }
  return redisConnection;
}

// ── Queue Definition ──────────────────────────────────────────────────────────

export const PUBLISH_QUEUE_NAME = "postly-publish";

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

// ── Job Types ─────────────────────────────────────────────────────────────────

export interface PublishJobData {
  publishingJobId: string;
  postId: string;
  socialAccountId: string;
  workspaceId: string;
  idempotencyKey: string;
}

// ── Enqueue a publishing job ──────────────────────────────────────────────────

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
  } catch (err: any) {
    console.error("[Queue] Failed to enqueue to Redis, will rely on DB scheduler:", err?.message);
  }
}

// ── Core Processor Function (Deterministic & Idempotent) ──────────────────────

export async function processPublishJob(jobData: PublishJobData): Promise<void> {
  const { publishingJobId, postId, socialAccountId, idempotencyKey } = jobData;
  const startedAt = new Date();

  // 1. Idempotency Check — if already completed, exit safely
  const existingJob = await prisma.publishingJob.findUnique({
    where: { id: publishingJobId },
  });
  if (existingJob?.status === "COMPLETED") {
    console.log(`[Queue] Job ${publishingJobId} already completed (idempotency skipped)`);
    return;
  }

  // 2. Mark job as RUNNING & post as PROCESSING
  await prisma.$transaction([
    prisma.publishingJob.update({
      where: { id: publishingJobId },
      data: {
        status: "RUNNING",
        startedAt,
        attempts: { increment: 1 },
      },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { status: "PROCESSING" },
    }),
  ]);

  const attemptStart = Date.now();

  try {
    // 3. Fetch Post, Attachments, Channel-specific Variant, and Account
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
      throw new Error(`Social account @${socialAccount.handle} is disconnected. Please reconnect.`);
    }

    // 4. Resolve Channel-Specific Customization (Variants)
    const publishBody = variant?.customBody?.trim() ? variant.customBody : post.body;
    const publishHashtags = variant?.customHashtags?.length ? variant.customHashtags : post.hashtags;
    const mediaUrls = post.mediaAttachments.map((m) => m.asset.url);

    // 5. Execute Provider Adapter
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

    // 6. Record successful execution
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
          lastError: null,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      }),
    ]);

    console.log(`[Queue] Successfully published job ${publishingJobId} to ${socialAccount.platform} (@${socialAccount.handle})`);
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const duration = Date.now() - attemptStart;

    const currentAttempts = (existingJob?.attempts ?? 0) + 1;
    const isLastAttempt = currentAttempts >= (existingJob?.maxAttempts ?? 3);

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
          lastError: errorMessage,
          nextRetryAt: isLastAttempt
            ? null
            : new Date(Date.now() + 5000 * Math.pow(2, currentAttempts - 1)),
        },
      }),
      ...(isLastAttempt
        ? [
            prisma.post.update({
              where: { id: postId },
              data: { status: "FAILED" },
            }),
          ]
        : []),
    ]);

    throw err;
  }
}

// ── Overdue Recovery Sweeper (Database Polling Fallback) ───────────────────────

export async function sweepOverdueScheduledJobs(): Promise<number> {
  const now = new Date();
  const overdueJobs = await prisma.publishingJob.findMany({
    where: {
      status: { in: ["PENDING", "RETRYING"] },
      scheduledAt: { lte: now },
    },
    take: 10,
    include: {
      post: true,
      socialAccount: true,
    },
  });

  if (overdueJobs.length === 0) return 0;

  console.log(`[Sweeper] Found ${overdueJobs.length} overdue publishing jobs to process`);

  for (const job of overdueJobs) {
    try {
      await processPublishJob({
        publishingJobId: job.id,
        postId: job.postId,
        socialAccountId: job.socialAccountId,
        workspaceId: job.post.workspaceId,
        idempotencyKey: job.idempotencyKey,
      });
    } catch (e: any) {
      console.error(`[Sweeper] Job ${job.id} failed:`, e?.message);
    }
  }

  return overdueJobs.length;
}

// ── Worker Initialization ─────────────────────────────────────────────────────

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
      console.error(`[Queue] BullMQ job failed: ${job?.id}`, err?.message);
    });

    globalWorker.on("completed", (job) => {
      console.log(`[Queue] BullMQ job completed: ${job?.id}`);
    });

    // Start background sweeper every 30 seconds for maximum reliability
    if (!sweeperInterval) {
      sweeperInterval = setInterval(() => {
        sweepOverdueScheduledJobs().catch((err) => {
          console.error("[Sweeper] Error sweeping overdue jobs:", err?.message);
        });
      }, 30000);
      // Run once immediately on startup
      sweepOverdueScheduledJobs().catch(() => {});
    }

    console.log("[Queue] BullMQ Publish Worker and Overdue Sweeper started successfully");
    return globalWorker;
  } catch (err: any) {
    console.error("[Queue] Could not start BullMQ worker:", err?.message);
    return null;
  }
}
