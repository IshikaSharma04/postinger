import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { createRssFeedSchema } from "@/lib/validators/schemas";
import { syncRssFeedToIdeas } from "@/lib/rss/reader";

// GET /api/rss?workspaceId=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return apiError("workspaceId is required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const feeds = await prisma.rssFeed.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(feeds);
}

// POST /api/rss
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = createRssFeedSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const { workspaceId, url, title } = parsed.data;

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  try {
    const feed = await prisma.rssFeed.create({
      data: {
        workspaceId,
        url: url.trim(),
        title: title.trim(),
      },
    });

    // Automatically sync initial items into Ideas
    const newItemsCount = await syncRssFeedToIdeas(feed.id, session.user.id).catch((err) => {
      console.warn("[RSS initial sync warning]:", err.message);
      return 0;
    });

    return apiSuccess({ feed, newItemsCount }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to subscribe to RSS feed";
    return apiError(msg);
  }
}

// DELETE /api/rss?id=...&workspaceId=...
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const id = req.nextUrl.searchParams.get("id");
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!id || !workspaceId) return apiError("id and workspaceId are required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  await prisma.rssFeed.deleteMany({
    where: { id, workspaceId },
  });

  return apiSuccess({ deleted: true });
}
