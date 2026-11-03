import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { POST_TEMPLATES } from "@/lib/templates/post-templates";
import { seedWorkspaceWithRichDemoData } from "@/lib/db/seed-workspace";

export const metadata = {
  title: "Home | Postinger",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { joinedAt: "asc" },
  });

  if (!membership) {
    redirect("/onboarding");
  }

  const workspaceId = membership.workspace.id;

  // Auto-seed if workspace is fresh so the user has immediate data to explore
  const initialPostCount = await prisma.post.count({ where: { workspaceId } });
  const initialAccountCount = await prisma.socialAccount.count({ where: { workspaceId } });
  if (initialPostCount === 0 && initialAccountCount === 0) {
    await seedWorkspaceWithRichDemoData(workspaceId, session.user.id);
  }

  const [
    workspace,
    accounts,
    upcomingPosts,
    recentComments,
    totalPosts,
  ] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true, plan: true, postingGoal: true },
    }),
    prisma.socialAccount.findMany({
      where: { workspaceId },
      select: { id: true, platform: true, handle: true, displayName: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.post.findMany({
      where: { workspaceId, status: "SCHEDULED" },
      take: 5,
      orderBy: { scheduledAt: "asc" },
      include: {
        postAccounts: {
          include: { socialAccount: { select: { platform: true, handle: true } } },
        },
      },
    }),
    prisma.socialComment.findMany({
      where: { workspaceId },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        authorHandle: true,
        content: true,
        platform: true,
        createdAt: true,
        repliedAt: true,
      },
    }),
    prisma.post.count({ where: { workspaceId } }),
  ]);

  const recommendedTemplates = POST_TEMPLATES.slice(0, 4).map((t) => ({
    id: t.id,
    name: t.title,
    category: t.category,
    description: t.description,
    body: t.body,
  }));

  const upcomingFormatted = upcomingPosts.map((p) => ({
    id: p.id,
    body: p.body,
    scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : null,
    postAccounts: p.postAccounts,
  }));

  const commentsFormatted = recentComments.map((c) => ({
    id: c.id,
    authorName: c.authorName ?? "Community Member",
    authorHandle: c.authorHandle,
    body: c.content,
    platform: c.platform,
    createdAt: c.createdAt.toISOString(),
    replied: Boolean(c.repliedAt),
  }));

  return (
    <DashboardClient
      user={{ name: session.user.name, email: session.user.email }}
      workspace={{
        id: workspace?.id ?? workspaceId,
        name: workspace?.name ?? membership.workspace.name,
        plan: workspace?.plan ?? "FREE",
        postingGoal: (workspace as any)?.postingGoal ?? 5,
      }}
      accounts={accounts}
      upcomingPosts={upcomingFormatted}
      recentComments={commentsFormatted}
      templates={recommendedTemplates}
      totalPosts={totalPosts}
    />
  );
}
