import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";

// Seed realistic incoming comments if none exist yet for the workspace
async function seedCommunityCommentsIfEmpty(workspaceId: string) {
  const count = await prisma.socialComment.count({ where: { workspaceId } });
  if (count === 0) {
    await prisma.socialComment.createMany({
      data: [
        {
          workspaceId,
          platform: "INSTAGRAM",
          authorHandle: "@sarah_designs",
          authorName: "Sarah Miller",
          authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
          content: "Does the scheduler support recurring weekly slots or just single date picking?",
          sentiment: "QUESTION",
          status: "UNREAD",
        },
        {
          workspaceId,
          platform: "LINKEDIN",
          authorHandle: "alexander-vance",
          authorName: "Alex Vance",
          authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          content: "Loved your breakdown on content repurposing! We just applied the carousel workflow to our company page.",
          sentiment: "PRAISE",
          status: "UNREAD",
        },
        {
          workspaceId,
          platform: "TWITTER",
          authorHandle: "@dev_milo",
          authorName: "Milo Kim",
          authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
          content: "Would be amazing to get Bluesky cross-posting in the next sprint!",
          sentiment: "FEEDBACK",
          status: "UNREAD",
        },
      ],
    });
  }
}

// GET /api/community/comments?workspaceId=...&status=...&sentiment=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const { searchParams } = req.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  const status = searchParams.get("status");
  const sentiment = searchParams.get("sentiment");

  if (!workspaceId) return apiError("workspaceId is required");

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  await seedCommunityCommentsIfEmpty(workspaceId);

  const comments = await prisma.socialComment.findMany({
    where: {
      workspaceId,
      ...(status ? { status: status as never } : {}),
      ...(sentiment ? { sentiment: sentiment as never } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess({ comments });
}
