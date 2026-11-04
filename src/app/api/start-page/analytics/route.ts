import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { checkRateLimitAsync, getClientIp } from "@/lib/utils/rate-limit";
import { z } from "zod";

const recordAnalyticsSchema = z.object({
  startPageId: z.string().min(1),
  eventType: z.enum(["VIEW", "CLICK"]),
  blockId: z.string().optional().nullable(),
  referrer: z.string().max(300).optional().nullable(),
});

// POST /api/start-page/analytics
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimitAsync({
    identifier: `startpage-analytics:${ip}`,
    max: 60,
    windowMs: 60000,
  });
  if (!rl.allowed) {
    return apiError("Too many telemetry requests", 429, "RATE_LIMITED");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = recordAnalyticsSchema.safeParse(body);
  if (!parsed.success) return apiError("Validation error");

  const { startPageId, eventType, blockId, referrer } = parsed.data;

  // Validate startPageId exists
  const startPage = await prisma.startPage.findUnique({
    where: { id: startPageId },
    select: { id: true },
  });
  if (!startPage) {
    return apiError("Start page not found", 404);
  }

  // Record event telemetry
  const record = await prisma.startPageAnalytics.create({
    data: {
      startPageId,
      event: eventType,
      targetId: blockId ?? null,
      metadata: referrer ? { referrer } : undefined,
    },
  });

  return apiSuccess({ recorded: true, id: record.id });
}

// GET /api/start-page/analytics?startPageId=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const startPageId = req.nextUrl.searchParams.get("startPageId");
  if (!startPageId) return apiError("startPageId is required");

  const startPage = await prisma.startPage.findUnique({
    where: { id: startPageId },
    select: { workspaceId: true },
  });
  if (!startPage) return apiError("Start page not found", 404);

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: startPage.workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const [totalViews, totalClicks, clicksByBlock] = await Promise.all([
    prisma.startPageAnalytics.count({
      where: { startPageId, event: "VIEW" },
    }),
    prisma.startPageAnalytics.count({
      where: { startPageId, event: "CLICK" },
    }),
    prisma.startPageAnalytics.groupBy({
      by: ["targetId"],
      where: { startPageId, event: "CLICK", targetId: { not: null } },
      _count: { id: true },
    }),
  ]);

  return apiSuccess({
    totalViews,
    totalClicks,
    clickThroughRate: totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0,
    clicksByBlock,
  });
}
