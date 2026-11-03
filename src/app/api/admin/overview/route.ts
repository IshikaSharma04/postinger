import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { apiForbidden, apiSuccess, apiUnauthorized } from "@/lib/utils/api";
import { prisma } from "@/lib/db/client";

// System admin emails allowed to access platform admin tools
const SYSTEM_ADMIN_EMAILS = (process.env.SYSTEM_ADMIN_EMAILS ?? "admin@postinger.app,admin@postly.app")
  .split(",")
  .map((e) => e.trim().toLowerCase());

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const userEmail = session.user.email?.toLowerCase();
  const isSystemAdmin = userEmail && SYSTEM_ADMIN_EMAILS.includes(userEmail);

  if (!isSystemAdmin) {
    return apiForbidden("System administration privileges required.");
  }

  // System-level metrics
  const [totalUsers, totalWorkspaces, totalPosts, totalJobs] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.post.count(),
    prisma.publishingJob.count(),
  ]);

  return apiSuccess({
    system: {
      totalUsers,
      totalWorkspaces,
      totalPosts,
      totalJobs,
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: process.uptime(),
    },
  });
}
