import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const recordAnalyticsSchema = z.object({
  startPageId: z.string().min(1),
  eventType: z.enum(["VIEW", "CLICK"]),
  blockId: z.string().optional().nullable(),
  referrer: z.string().max(300).optional().nullable(),
});

// POST /api/start-page/analytics
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = recordAnalyticsSchema.safeParse(body);
  if (!parsed.success) return apiError("Validation error");

  const { startPageId, eventType, blockId, referrer } = parsed.data;

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
  const startPageId = req.nextUrl.searchParams.get("startPageId");
  if (!startPageId) return apiError("startPageId is required");

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
