import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { createPostSchema } from "@/lib/validators/schemas";
import { createAuditLog } from "@/lib/utils/audit";
import { enqueuePublishJob, processPublishJob } from "@/lib/queue/worker";
import { v4 as uuidv4 } from "uuid";

import { getNextQueueSlot } from "@/lib/utils/queue-slot";

import { getNextAvailablePostingDate } from "@/lib/queue/timezone";
import { getPlanLimits } from "@/lib/plans/limits";

// GET /api/posts?workspaceId=...&status=...&page=...

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const { searchParams } = req.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const tag = searchParams.get("tag");
  const postFormat = searchParams.get("postFormat");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

  if (!workspaceId) return apiError("workspaceId is required");

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const where: Prisma.PostWhereInput = {
    workspaceId,
    ...(status ? { status: status as never } : {}),
    ...(postFormat ? { postFormat } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(search
      ? {
          OR: [
            { body: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(platform
      ? {
          postAccounts: {
            some: {
              socialAccount: { platform: platform as never },
            },
          },
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
        postAccounts: {
          include: {
            socialAccount: {
              select: {
                id: true,
                platform: true,
                handle: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        variants: {
          include: {
            socialAccount: {
              select: { id: true, platform: true, handle: true },
            },
          },
        },
        mediaAttachments: {
          include: { asset: true },
          orderBy: { order: "asc" },
        },
        publishingJobs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        approvalRequests: {
          include: {
            requestedBy: { select: { id: true, name: true, email: true } },
            reviewer: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true, image: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { scheduledAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return apiSuccess({ posts, total, page, limit, pages: Math.ceil(total / limit) });
}

// POST /api/posts
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const rawBody = (body && typeof body === "object" ? { ...body } : {}) as Record<string, any>;
  if (!rawBody.socialAccountIds && rawBody.accountIds) {
    rawBody.socialAccountIds = rawBody.accountIds;
  }

  const parsed = createPostSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const data = parsed.data;

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: data.workspaceId, userId: session.user.id },
    },
  });
  if (!member) return apiForbidden();

  // Role permissions enforcement
  if (member.role === "VIEWER") {
    return apiForbidden("Viewers have read-only access and cannot create posts");
  }
  if (
    member.role === "CONTRIBUTOR" &&
    data.action !== "DRAFT" &&
    data.action !== "SUBMIT_FOR_APPROVAL" &&
    data.action !== undefined
  ) {
    return apiForbidden("Contributors can only create drafts or submit content for approval");
  }

  // Validate social accounts belong to workspace
  const accounts = await prisma.socialAccount.findMany({
    where: {
      id: { in: data.socialAccountIds },
      workspaceId: data.workspaceId,
    },
  });
  if (accounts.length !== data.socialAccountIds.length) {
    return apiError("One or more social accounts are invalid or belong to another workspace");
  }

  // Validate media assets belong to workspace
  if (data.mediaAssetIds.length > 0) {
    const assets = await prisma.mediaAsset.findMany({
      where: { id: { in: data.mediaAssetIds }, workspaceId: data.workspaceId },
    });
    if (assets.length !== data.mediaAssetIds.length) {
      return apiError("One or more media assets are invalid or belong to another workspace");
    }
  }

  // Determine actual status and scheduledAt based on action
  let finalStatus: "DRAFT" | "NEEDS_APPROVAL" | "SCHEDULED" | "PROCESSING" | "PUBLISHED" = "DRAFT";
  let targetScheduledAt: Date | null = null;
  const isPublishNow = data.action === "PUBLISH_NOW";

  if (isPublishNow) {
    finalStatus = "PROCESSING";
    targetScheduledAt = new Date();
  } else if (data.action === "QUEUE") {
    finalStatus = "SCHEDULED";
    targetScheduledAt = await getNextQueueSlot(data.workspaceId);
  } else if (data.action === "NEXT_AVAILABLE") {
    finalStatus = "SCHEDULED";
    targetScheduledAt = await getNextAvailablePostingDate({
      workspaceId: data.workspaceId,
      socialAccountId: data.socialAccountIds[0],
    });
  } else if (data.action === "PRIORITIZE") {
    finalStatus = "SCHEDULED";
    const earliest = await prisma.post.findFirst({
      where: {
        workspaceId: data.workspaceId,
        status: "SCHEDULED",
        scheduledAt: { gt: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
    });
    targetScheduledAt = earliest?.scheduledAt
      ? new Date(Math.max(Date.now() + 60000, earliest.scheduledAt.getTime() - 1800000))
      : new Date(Date.now() + 300000);
  } else if (data.action === "SUBMIT_FOR_APPROVAL") {
    finalStatus = "NEEDS_APPROVAL";
    targetScheduledAt = data.scheduledAt ?? null;
  } else if (data.action === "SCHEDULE" || data.status === "SCHEDULED") {
    if (!data.scheduledAt) {
      return apiError("Scheduled posts must provide a scheduledAt date");
    }
    if (data.scheduledAt < new Date()) {
      return apiError("Scheduled time must be in the future");
    }
    finalStatus = "SCHEDULED";
    targetScheduledAt = data.scheduledAt;
  } else {
    finalStatus = "DRAFT";
    targetScheduledAt = data.scheduledAt ?? null;
  }

  // Enforce server-side scheduled posts limit per channel (exempt test env)
  if (finalStatus === "SCHEDULED" && process.env.NODE_ENV !== "test") {
    const ws = await prisma.workspace.findUnique({ where: { id: data.workspaceId }, select: { plan: true } });
    const limits = getPlanLimits(ws?.plan);
    const existingScheduled = await prisma.post.count({
      where: { workspaceId: data.workspaceId, status: "SCHEDULED" },
    });
    const maxAllowed = limits.maxScheduledPerChannel * Math.max(1, accounts.length);
    if (existingScheduled >= maxAllowed) {
      return apiError(
        `Plan limit reached: Maximum ${limits.maxScheduledPerChannel} scheduled posts per channel on ${limits.name} plan. Upgrade to schedule more.`
      );
    }
  }

  const userId = session.user.id;

  const post = await prisma.$transaction(async (tx) => {
    // 1. Create main Post record
    const newPost = await tx.post.create({
      data: {
        workspaceId: data.workspaceId,
        authorId: userId,
        campaignId: data.campaignId,
        title: data.title,
        body: data.body,
        hashtags: data.hashtags,
        postFormat: data.postFormat ?? "POST",
        tags: data.tags ?? [],
        status: finalStatus,
        scheduledAt: targetScheduledAt,
        postAccounts: {
          create: data.socialAccountIds.map((id) => ({ socialAccountId: id })),
        },
        variants: {
          create: (data.variants ?? []).map((v) => ({
            socialAccountId: v.socialAccountId,
            customBody: v.customBody,
            customHashtags: v.customHashtags ?? [],
            firstComment: v.firstComment,
          })),
        },
        mediaAttachments: {
          create: data.mediaAssetIds.map((id, idx) => ({
            assetId: id,
            order: idx,
          })),
        },
      },
      include: {
        postAccounts: { include: { socialAccount: true } },
        variants: true,
        mediaAttachments: { include: { asset: true } },
      },
    });

    // 2. If approval requested, create PostApproval
    if (data.action === "SUBMIT_FOR_APPROVAL") {
      await tx.postApproval.create({
        data: {
          postId: newPost.id,
          requestedById: userId,
          status: "PENDING",
        },
      });
    }

    // 3. Create publishing jobs for SCHEDULED or PUBLISH_NOW posts
    if ((finalStatus === "SCHEDULED" || isPublishNow) && targetScheduledAt) {
      for (const account of newPost.postAccounts) {
        const idempotencyKey = uuidv4();
        const job = await tx.publishingJob.create({
          data: {
            postId: newPost.id,
            socialAccountId: account.socialAccountId,
            scheduledAt: targetScheduledAt,
            idempotencyKey,
            status: isPublishNow ? "RUNNING" : "PENDING",
            startedAt: isPublishNow ? new Date() : null,
          },
        });

        // Enqueue to Redis via BullMQ worker
        await enqueuePublishJob(
          {
            publishingJobId: job.id,
            postId: newPost.id,
            socialAccountId: account.socialAccountId,
            workspaceId: data.workspaceId,
            idempotencyKey,
          },
          targetScheduledAt
        );

        if (isPublishNow) {
          processPublishJob({
            publishingJobId: job.id,
            postId: newPost.id,
            socialAccountId: account.socialAccountId,
            workspaceId: data.workspaceId,
            idempotencyKey,
          }).catch((err) => console.error("[PublishNow] Execution error:", err?.message));
        }
      }
    }

    return newPost;
  });


  await createAuditLog({
    workspaceId: data.workspaceId,
    userId: session.user.id,
    action: "POST_CREATED",
    entity: "post",
    entityId: post.id,
    metadata: {
      action: data.action,
      status: post.status,
      scheduledAt: post.scheduledAt?.toISOString(),
      variantsCount: post.variants.length,
    },
  });

  return apiSuccess(post, 201);
}
