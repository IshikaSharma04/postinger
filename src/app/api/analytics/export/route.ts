import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";
import { apiUnauthorized, apiForbidden, apiError } from "@/lib/utils/api";

// GET /api/analytics/export?workspaceId=...&format=csv
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const { searchParams } = req.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  const format = searchParams.get("format") || "csv";

  if (!workspaceId) return apiError("workspaceId is required");

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const posts = await prisma.post.findMany({
    where: { workspaceId },
    include: {
      postAccounts: { include: { socialAccount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const headers = ["Post ID", "Status", "Format", "Created At", "Scheduled At", "Channels", "Tags", "Caption"];
    const rows = posts.map((p) => [
      p.id,
      p.status,
      p.postFormat,
      p.createdAt.toISOString(),
      p.scheduledAt?.toISOString() || "",
      p.postAccounts.map((pa) => `${pa.socialAccount.platform}:@${pa.socialAccount.handle}`).join("; "),
      p.tags.join("; "),
      `"${p.body.replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="postinger-analytics-${Date.now()}.csv"`,
      },
    });
  }

  // JSON summary
  return NextResponse.json({
    workspaceId,
    totalPosts: posts.length,
    published: posts.filter((p) => p.status === "PUBLISHED").length,
    scheduled: posts.filter((p) => p.status === "SCHEDULED").length,
    drafts: posts.filter((p) => p.status === "DRAFT").length,
    exportedAt: new Date().toISOString(),
  });
}
