import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const demoEmail = "demo@postinger.app";
  const demoPassword = process.env.DEMO_USER_PASSWORD || "Demo1234!";
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { passwordHash },
    create: {
      name: "Demo User",
      email: demoEmail,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: demoUser.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: demoUser.id, role: "OWNER" },
  });

  await prisma.onboardingState.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      currentStep: 7,
      isCompleted: true,
      completedAt: new Date(),
      useCase: "creator",
      persona: "creator",
      teamSize: "1",
      targetChannels: ["TWITTER", "LINKEDIN", "INSTAGRAM"],
      postingFrequency: "daily",
      mainGoal: "audience_growth",
      referralSource: "friend",
    },
  });

  const twitter = await prisma.socialAccount.upsert({
    where: { workspaceId_platform_handle: { workspaceId: workspace.id, platform: "TWITTER", handle: "demo_brand" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      platform: "TWITTER",
      handle: "demo_brand",
      displayName: "Demo Brand",
      credentials: { mock: true },
    },
  });

  const instagram = await prisma.socialAccount.upsert({
    where: { workspaceId_platform_handle: { workspaceId: workspace.id, platform: "INSTAGRAM", handle: "demo_brand.ig" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      platform: "INSTAGRAM",
      handle: "demo_brand.ig",
      displayName: "Demo Brand",
      credentials: { mock: true },
    },
  });

  const linkedin = await prisma.socialAccount.upsert({
    where: { workspaceId_platform_handle: { workspaceId: workspace.id, platform: "LINKEDIN", handle: "demo-brand-co" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      platform: "LINKEDIN",
      handle: "demo-brand-co",
      displayName: "Demo Brand Co.",
      credentials: { mock: true },
    },
  });

  const now = new Date();
  const postData = [
    {
      body: "Product update: we added new scheduling tools to help plan social content.",
      hashtags: ["productupdate", "socialmedia", "scheduling"],
      status: "PUBLISHED" as const,
      scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 1000),
      accounts: [twitter.id, instagram.id],
    },
    {
      body: "Milestone reached: thank you to everyone supporting our journey.",
      hashtags: ["milestone", "community"],
      status: "PUBLISHED" as const,
      scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 2000),
      accounts: [twitter.id],
    },
    {
      body: "Upcoming conference: find us next month to discuss the future of content scheduling.",
      hashtags: ["conference", "networking"],
      status: "SCHEDULED" as const,
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      accounts: [twitter.id, linkedin.id],
    },
    {
      body: "Behind the scenes: how our team organizes social workflows with Postinger.",
      hashtags: ["workflow", "planning"],
      status: "DRAFT" as const,
      accounts: [twitter.id],
    },
  ];

  for (const pd of postData) {
    const post = await prisma.post.create({
      data: {
        workspaceId: workspace.id,
        authorId: demoUser.id,
        body: pd.body,
        hashtags: pd.hashtags,
        status: pd.status,
        scheduledAt: pd.scheduledAt,
        publishedAt: (pd as Record<string, unknown>).publishedAt as Date | undefined,
        postAccounts: {
          create: pd.accounts.map((accId) => ({ socialAccountId: accId })),
        },
      },
    });

    if (pd.status !== "DRAFT" && pd.scheduledAt) {
      for (const accId of pd.accounts) {
        const idempotencyKey = `seed_${post.id}_${accId}`;
        const job = await prisma.publishingJob.upsert({
          where: { idempotencyKey },
          update: {},
          create: {
            postId: post.id,
            socialAccountId: accId,
            scheduledAt: pd.scheduledAt,
            idempotencyKey,
            status: pd.status === "PUBLISHED" ? "COMPLETED" : "PENDING",
            attempts: pd.status === "PUBLISHED" ? 1 : 0,
            completedAt: (pd as Record<string, unknown>).publishedAt as Date | undefined,
          },
        });

        if (pd.status === "PUBLISHED") {
          await prisma.jobAttempt.create({
            data: {
              jobId: job.id,
              status: "COMPLETED",
              duration: 950,
            },
          });
        }
      }
    }
  }

  await prisma.auditLog.createMany({
    data: [
      { workspaceId: workspace.id, userId: demoUser.id, action: "USER_REGISTERED", entity: "user", entityId: demoUser.id },
      { workspaceId: workspace.id, userId: demoUser.id, action: "ACCOUNT_CONNECTED", entity: "socialAccount", entityId: twitter.id, metadata: { platform: "TWITTER", handle: "demo_brand" } },
    ],
  });
}

main()
  .catch((err) => {
    console.error("Seed error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
