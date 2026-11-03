/**
 * Postly — Seed Script
 * Creates realistic demo data for local development.
 * Run: npx prisma db seed
 *
 * ⚠️  Demo data only — never use in production.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data...");

  // ── Users ────────────────────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash("Demo1234!", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@postly.app" },
    update: { emailVerified: new Date() },
    create: {
      name: "Alex Demo",
      email: "demo@postly.app",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  const postingerUser = await prisma.user.upsert({
    where: { email: "demo@postinger.app" },
    update: { emailVerified: new Date() },
    create: {
      name: "Alex Demo",
      email: "demo@postinger.app",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  const aliceUser = await prisma.user.upsert({
    where: { email: "alice@postly.app" },
    update: { emailVerified: new Date() },
    create: {
      name: "Alice Smith",
      email: "alice@postly.app",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  console.log("✓ Created demo users");

  // ── Workspace ─────────────────────────────────────────────────────────────────

  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
    },
  });

  // Workspace members
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: demoUser.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: demoUser.id, role: "OWNER" },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: postingerUser.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: postingerUser.id, role: "OWNER" },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: aliceUser.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: aliceUser.id, role: "ADMIN" },
  });

  // Seed onboarding state for demo users
  await prisma.onboardingState.upsert({
    where: { userId: postingerUser.id },
    update: {},
    create: {
      userId: postingerUser.id,
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

  console.log("✓ Created workspace and members");

  // ── Social Accounts ───────────────────────────────────────────────────────────

  const twitter = await prisma.socialAccount.upsert({
    where: { workspaceId_platform_handle: { workspaceId: workspace.id, platform: "TWITTER", handle: "demobrand" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      platform: "TWITTER",
      handle: "demobrand",
      displayName: "Demo Brand",
      credentials: { mock: true },
    },
  });

  const instagram = await prisma.socialAccount.upsert({
    where: { workspaceId_platform_handle: { workspaceId: workspace.id, platform: "INSTAGRAM", handle: "demobrand.ig" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      platform: "INSTAGRAM",
      handle: "demobrand.ig",
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

  console.log("✓ Created mock social accounts");

  // ── Posts ─────────────────────────────────────────────────────────────────────

  const now = new Date();

  const postData = [
    {
      body: "Excited to share our latest product update! We've added new scheduling features that make it easier than ever to plan your social content.",
      hashtags: ["productupdate", "socialmedia", "scheduling"],
      status: "PUBLISHED" as const,
      scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 1000),
      accounts: [twitter.id, instagram.id],
    },
    {
      body: "🎉 We just hit 1,000 users! Thank you to everyone who has supported us on this journey. Here's to the next milestone!",
      hashtags: ["milestone", "community", "gratitude"],
      status: "PUBLISHED" as const,
      scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 2000),
      accounts: [twitter.id],
    },
    {
      body: "Our team is attending Social Media Week next month! Come find us at booth #42 and let's chat about the future of content scheduling.",
      hashtags: ["SMWLondon", "socialmedia", "networking"],
      status: "SCHEDULED" as const,
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      accounts: [twitter.id, linkedin.id],
    },
    {
      body: "Behind the scenes: here's how our small team manages social content for 50+ clients using Postly. Thread 🧵",
      hashtags: ["behindthescenes", "contentmarketing", "workflow"],
      status: "SCHEDULED" as const,
      scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      accounts: [twitter.id, instagram.id, linkedin.id],
    },
    {
      body: "Draft post: Ideas for Q4 campaign — need to finalize messaging before scheduling. Consider incorporating new brand colors and updated tone of voice guidelines.",
      hashtags: ["Q4", "campaign", "planning"],
      status: "DRAFT" as const,
      accounts: [twitter.id],
    },
    {
      body: "Partnership announcement coming soon. Collaborating with an amazing creator to bring you exclusive content over the next quarter.",
      hashtags: ["partnership", "collaboration", "exclusive"],
      status: "FAILED" as const,
      scheduledAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      accounts: [twitter.id, instagram.id],
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

    // Create publishing jobs for non-draft posts
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
            status: pd.status === "PUBLISHED" ? "COMPLETED" : pd.status === "FAILED" ? "FAILED" : "PENDING",
            attempts: pd.status === "PUBLISHED" ? 1 : pd.status === "FAILED" ? 3 : 0,
            completedAt: pd.status === "PUBLISHED" ? (pd as Record<string, unknown>).publishedAt as Date : undefined,
            lastError: pd.status === "FAILED" ? "[MOCK] Simulated publishing failure for demo" : undefined,
          },
        });

        // Add attempt records for completed/failed jobs
        if (pd.status === "PUBLISHED") {
          await prisma.jobAttempt.create({
            data: {
              jobId: job.id,
              status: "COMPLETED",
              duration: Math.floor(800 + Math.random() * 400),
            },
          });
        } else if (pd.status === "FAILED") {
          for (let i = 0; i < 3; i++) {
            await prisma.jobAttempt.create({
              data: {
                jobId: job.id,
                status: "FAILED",
                error: "[MOCK] Simulated provider error — connection timeout",
                duration: Math.floor(1000 + Math.random() * 2000),
                attemptedAt: new Date(now.getTime() - (24 - i * 8) * 60 * 60 * 1000),
              },
            });
          }
        }
      }
    }
  }

  console.log("✓ Created demo posts and publishing jobs");

  // ── Audit Logs ────────────────────────────────────────────────────────────────

  await prisma.auditLog.createMany({
    data: [
      { workspaceId: workspace.id, userId: demoUser.id, action: "USER_REGISTERED", entity: "user", entityId: demoUser.id },
      { workspaceId: workspace.id, userId: demoUser.id, action: "ACCOUNT_CONNECTED", entity: "socialAccount", entityId: twitter.id, metadata: { platform: "TWITTER", handle: "demobrand" } },
      { workspaceId: workspace.id, userId: demoUser.id, action: "ACCOUNT_CONNECTED", entity: "socialAccount", entityId: instagram.id, metadata: { platform: "INSTAGRAM", handle: "demobrand.ig" } },
      { workspaceId: workspace.id, userId: aliceUser.id, action: "POST_CREATED", entity: "post", metadata: { status: "PUBLISHED" } },
    ],
  });

  console.log("✓ Created audit logs");
  console.log("");
  console.log("🎉 Seed complete!");
  console.log("   Demo login: demo@postly.app / Demo1234!");
  console.log("   Alice login: alice@postly.app / Demo1234!");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
