import { prisma } from "@/lib/db/client";

/**
 * Seeds a workspace with rich, realistic, vibrant creator data so the platform
 * feels alive, bustling, and actively used by a professional team.
 */
export async function seedWorkspaceWithRichDemoData(workspaceId: string, userId: string) {
  // Check if already seeded with posts
  const postCount = await prisma.post.count({ where: { workspaceId } });
  if (postCount > 3) {
    return; // Already populated
  }

  console.log(`🌱 Populating workspace ${workspaceId} with rich demo data...`);

  // 1. Social Accounts
  const twitter = await prisma.socialAccount.upsert({
    where: { workspaceId_platform_handle: { workspaceId, platform: "TWITTER", handle: "ishikasharma" } },
    update: {},
    create: {
      workspaceId,
      platform: "TWITTER",
      handle: "ishikasharma",
      displayName: "Ishika Sharma ✨",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      credentials: { mock: true, followers: 18420, verified: true },
    },
  });

  const instagram = await prisma.socialAccount.upsert({
    where: { workspaceId_platform_handle: { workspaceId, platform: "INSTAGRAM", handle: "ishika.designs" } },
    update: {},
    create: {
      workspaceId,
      platform: "INSTAGRAM",
      handle: "ishika.designs",
      displayName: "Ishika Studio 🎨",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      credentials: { mock: true, followers: 34200 },
    },
  });

  const linkedin = await prisma.socialAccount.upsert({
    where: { workspaceId_platform_handle: { workspaceId, platform: "LINKEDIN", handle: "ishika-sharma" } },
    update: {},
    create: {
      workspaceId,
      platform: "LINKEDIN",
      handle: "ishika-sharma",
      displayName: "Ishika Sharma · Creative Director",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      credentials: { mock: true, followers: 12850 },
    },
  });

  const tiktok = await prisma.socialAccount.upsert({
    where: { workspaceId_platform_handle: { workspaceId, platform: "TIKTOK", handle: "ishikacreates" } },
    update: {},
    create: {
      workspaceId,
      platform: "TIKTOK",
      handle: "ishikacreates",
      displayName: "Ishika Creative",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
      credentials: { mock: true, followers: 62500 },
    },
  });

  const youtube = await prisma.socialAccount.upsert({
    where: { workspaceId_platform_handle: { workspaceId, platform: "YOUTUBE", handle: "IshikaStudio" } },
    update: {},
    create: {
      workspaceId,
      platform: "YOUTUBE",
      handle: "IshikaStudio",
      displayName: "Ishika Studio Channel",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      credentials: { mock: true, followers: 24100 },
    },
  });

  // 2. Add Team Members to workspace
  const sarah = await prisma.user.upsert({
    where: { email: "sarah.lin@creators.co" },
    update: {},
    create: {
      name: "Sarah Lin",
      email: "sarah.lin@creators.co",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      passwordHash: "$2a$12$eX.dummyHashToPreventLoginDirectlyWithoutInvite123",
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId, userId: sarah.id } },
    update: {},
    create: { workspaceId, userId: sarah.id, role: "ADMIN" },
  });

  const marcus = await prisma.user.upsert({
    where: { email: "marcus.v@creators.co" },
    update: {},
    create: {
      name: "Marcus Vance",
      email: "marcus.v@creators.co",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      passwordHash: "$2a$12$eX.dummyHashToPreventLoginDirectlyWithoutInvite456",
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId, userId: marcus.id } },
    update: {},
    create: { workspaceId, userId: marcus.id, role: "MEMBER" },
  });

  // 3. Media Assets
  const asset1 = await prisma.mediaAsset.create({
    data: {
      workspaceId,
      uploadedBy: userId,
      filename: "design-system-kit.jpg",
      originalName: "Creator Design System Kit.jpg",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      mimeType: "image/jpeg",
      size: 245000,
      width: 1200,
      height: 800,
    },
  });

  const asset2 = await prisma.mediaAsset.create({
    data: {
      workspaceId,
      uploadedBy: sarah.id,
      filename: "content-strategy.jpg",
      originalName: "Content Strategy Blueprint.jpg",
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
      mimeType: "image/jpeg",
      size: 310000,
      width: 1200,
      height: 800,
    },
  });

  const asset3 = await prisma.mediaAsset.create({
    data: {
      workspaceId,
      uploadedBy: userId,
      filename: "studio-moodboard.jpg",
      originalName: "Studio Moodboard 2026.jpg",
      url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
      mimeType: "image/jpeg",
      size: 420000,
      width: 1200,
      height: 800,
    },
  });

  const asset4 = await prisma.mediaAsset.create({
    data: {
      workspaceId,
      uploadedBy: userId,
      filename: "milestone-10k.jpg",
      originalName: "10k Celebration.jpg",
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
      mimeType: "image/jpeg",
      size: 512000,
      width: 1200,
      height: 800,
    },
  });

  // 4. Scheduled Posts (Future)
  const now = Date.now();
  const inHours = (h: number) => new Date(now + h * 3600 * 1000);
  const inDays = (d: number, h: number = 14) => {
    const date = new Date(now + d * 86400 * 1000);
    date.setHours(h, 30, 0, 0);
    return date;
  };

  // Post 1: Scheduled today in 3 hours
  const p1 = await prisma.post.create({
    data: {
      workspaceId,
      authorId: userId,
      title: "Design System & UI Kit Launch",
      body: "🚀 Big milestone! Our new open-source Creator Design System is live today. Over 140+ accessible UI components, rich token sets, and dark-mode native. What do you think of this vibrant color palette? 👇 Drop your feedback below!",
      status: "SCHEDULED",
      scheduledAt: inHours(3),
      hashtags: ["designsystem", "uiux", "buildinpublic", "creative"],
      postAccounts: {
        create: [
          { socialAccountId: twitter.id },
          { socialAccountId: instagram.id },
          { socialAccountId: linkedin.id },
        ],
      },
      variants: {
        create: [
          {
            socialAccountId: twitter.id,
            customBody: "🚀 Our Creator Design System is live! 140+ accessible UI components, dark-mode native, Figma tokens. Check it out & let us know your thoughts 👇 #buildinpublic #design",
          },
          {
            socialAccountId: linkedin.id,
            customBody: "Excited to officially launch our open-source Creator Design System. Building high-performance social tools requires cohesive design tokens and tight accessibility. Here is our architectural breakdown and component library.",
          },
        ],
      },
      mediaAttachments: {
        create: [{ assetId: asset1.id, order: 0 }],
      },
    },
  });

  // Create publishing jobs for p1
  await prisma.publishingJob.createMany({
    data: [
      { postId: p1.id, socialAccountId: twitter.id, status: "PENDING", scheduledAt: inHours(3), idempotencyKey: `seed_${p1.id}_${twitter.id}` },
      { postId: p1.id, socialAccountId: instagram.id, status: "PENDING", scheduledAt: inHours(3), idempotencyKey: `seed_${p1.id}_${instagram.id}` },
      { postId: p1.id, socialAccountId: linkedin.id, status: "PENDING", scheduledAt: inHours(3), idempotencyKey: `seed_${p1.id}_${linkedin.id}` },
    ],
  });

  // Post 2: Scheduled tomorrow
  const p2 = await prisma.post.create({
    data: {
      workspaceId,
      authorId: sarah.id,
      title: "Top 4 Content Strategy Lessons",
      body: "The 4 biggest mistakes we made when scaling our content pipeline from 1 channel to 5 (and how we fixed them): 1. Writing copy natively in each app 2. Scheduling without queue time slots 3. Ignoring first comments 4. Disconnected analytics. Here is how Postinger streamlined our entire workflow. 💡",
      status: "SCHEDULED",
      scheduledAt: inDays(1, 10),
      hashtags: ["contentstrategy", "growth", "creatorlife"],
      postAccounts: {
        create: [
          { socialAccountId: twitter.id },
          { socialAccountId: linkedin.id },
        ],
      },
      mediaAttachments: {
        create: [{ assetId: asset2.id, order: 0 }],
      },
    },
  });

  await prisma.publishingJob.createMany({
    data: [
      { postId: p2.id, socialAccountId: twitter.id, status: "PENDING", scheduledAt: inDays(1, 10), idempotencyKey: `seed_${p2.id}_${twitter.id}` },
      { postId: p2.id, socialAccountId: linkedin.id, status: "PENDING", scheduledAt: inDays(1, 10), idempotencyKey: `seed_${p2.id}_${linkedin.id}` },
    ],
  });

  // Post 3: Scheduled in 2 days
  const p3 = await prisma.post.create({
    data: {
      workspaceId,
      authorId: userId,
      title: "Friday Studio Moodboard",
      body: "Friday studio vibes! Exploring organic shapes, warm neutrals, and dynamic typography for our spring brand refresh. Swipe through for the full creative moodboard 🎨✨",
      status: "SCHEDULED",
      scheduledAt: inDays(2, 16),
      hashtags: ["studiolife", "moodboard", "branddesign"],
      postAccounts: {
        create: [
          { socialAccountId: instagram.id },
          { socialAccountId: tiktok.id },
        ],
      },
      mediaAttachments: {
        create: [{ assetId: asset3.id, order: 0 }],
      },
    },
  });

  await prisma.publishingJob.createMany({
    data: [
      { postId: p3.id, socialAccountId: instagram.id, status: "PENDING", scheduledAt: inDays(2, 16), idempotencyKey: `seed_${p3.id}_${instagram.id}` },
      { postId: p3.id, socialAccountId: tiktok.id, status: "PENDING", scheduledAt: inDays(2, 16), idempotencyKey: `seed_${p3.id}_${tiktok.id}` },
    ],
  });

  // 5. Published Posts (Past with real metrics)
  const pastDays = (d: number) => new Date(now - d * 86400 * 1000);

  await prisma.post.create({
    data: {
      workspaceId,
      authorId: userId,
      title: "10,000 Community Milestone",
      body: "We just crossed 10,000 active creators in our Discord & newsletter community! 🎉 To celebrate, we're giving away 3 annual Postinger Pro passes. RT & reply with your favorite social media tip to enter! 🚀",
      status: "PUBLISHED",
      publishedAt: pastDays(1),
      scheduledAt: pastDays(1),
      hashtags: ["milestone", "giveaway", "creatorcommunity"],
      postAccounts: {
        create: [
          { socialAccountId: twitter.id },
          { socialAccountId: linkedin.id },
        ],
      },
      mediaAttachments: {
        create: [{ assetId: asset4.id, order: 0 }],
      },
    },
  });

  await prisma.post.create({
    data: {
      workspaceId,
      authorId: sarah.id,
      title: "Dark Mode Contrast Rules",
      body: "Pro tip: True #000000 black causes eye strain when juxtaposed with pure #FFFFFF text. Instead, use soft charcoals like #121212 or #18181B with 85% opacity text for luxurious readability 🌙✨",
      status: "PUBLISHED",
      publishedAt: pastDays(3),
      scheduledAt: pastDays(3),
      hashtags: ["designtips", "darkmode", "frontend"],
      postAccounts: {
        create: [
          { socialAccountId: twitter.id },
          { socialAccountId: instagram.id },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      workspaceId,
      authorId: userId,
      title: "Start Page Link-in-Bio Launch",
      body: "Updated our link-in-bio page! You can now check out our latest YouTube breakdown, free design tokens, and weekly podcast right from our Start Page. Link is in the bio! 🔗",
      status: "PUBLISHED",
      publishedAt: pastDays(5),
      scheduledAt: pastDays(5),
      hashtags: ["linkinbio", "portfolio", "creator"],
      postAccounts: {
        create: [
          { socialAccountId: instagram.id },
          { socialAccountId: tiktok.id },
        ],
      },
    },
  });

  // 6. Draft Posts
  await prisma.post.create({
    data: {
      workspaceId,
      authorId: userId,
      title: "Q4 Social Strategy & Content Calendar [Draft]",
      body: "Drafting our Q4 content calendar focusing on 3 pillars: 1. Practical design tutorials 2. Founder behind-the-scenes 3. Community spotlights. Need feedback on posting cadence.",
      status: "DRAFT",
      postAccounts: {
        create: [{ socialAccountId: twitter.id }, { socialAccountId: linkedin.id }],
      },
    },
  });

  await prisma.post.create({
    data: {
      workspaceId,
      authorId: sarah.id,
      title: "Video Teaser: Automating multi-channel scheduling",
      body: "Short 30s teaser showing how we schedule 2 weeks of cross-platform content in under 45 minutes using Postinger's queue slots and AI rewriter.",
      status: "DRAFT",
      postAccounts: {
        create: [{ socialAccountId: tiktok.id }, { socialAccountId: youtube.id }],
      },
    },
  });

  // 7. Content Ideas (Kanban)
  await prisma.idea.createMany({
    data: [
      {
        workspaceId,
        authorId: userId,
        title: "10 micro-SaaS marketing tips for bootstrap founders",
        content: "Actionable thread on how to get first 100 paying customers without paid ads.",
        status: "UNASSIGNED",
        tags: ["marketing", "bootstrap", "twitter"],
      },
      {
        workspaceId,
        authorId: sarah.id,
        title: "How to repurpose 1 long-form YouTube video into 8 short posts",
        content: "Breakdown step-by-step: 1 video -> 3 TikToks, 2 LinkedIn carousels, 1 X thread, 2 quotes.",
        status: "REVIEW",
        tags: ["repurposing", "video", "workflow"],
      },
      {
        workspaceId,
        authorId: marcus.id,
        title: "Case study: Scaling organic reach by 340% with recurring queue slots",
        content: "Deep dive analyzing 6 months of data comparing random posting vs fixed queue times.",
        status: "DONE",
        tags: ["analytics", "casestudy"],
      },
      {
        workspaceId,
        authorId: userId,
        title: "Creator finance: How to price brand sponsorships fairly in 2026",
        content: "Formula for CPM + production time + exclusivity rights.",
        status: "UNASSIGNED",
        tags: ["creator", "finance"],
      },
    ],
  });

  // 8. Community Comments
  await prisma.socialComment.createMany({
    data: [
      {
        workspaceId,
        platform: "INSTAGRAM",
        authorHandle: "sarah_ux",
        authorName: "Sarah UX Studio",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        content: "This color palette is stunning! Are you releasing the Figma tokens and component library soon?",
        sentiment: "QUESTION",
        status: "UNREAD",
        createdAt: new Date(now - 15 * 60 * 1000), // 15 mins ago
      },
      {
        workspaceId,
        platform: "TWITTER",
        authorHandle: "alex_growth",
        authorName: "Alex Vance",
        authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
        content: "Which camera setup did you use for the 3D studio shots in slide 3? The lighting looks amazing!",
        sentiment: "QUESTION",
        status: "UNREAD",
        createdAt: new Date(now - 45 * 60 * 1000), // 45 mins ago
      },
      {
        workspaceId,
        platform: "LINKEDIN",
        authorHandle: "marcus_design",
        authorName: "Marcus Vance",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        content: "Completely agree on the charcoal dark mode point. Pure black causes intense halogen glare on OLED screens.",
        sentiment: "FEEDBACK",
        status: "REPLIED",
        replyText: "Thanks Marcus! Soft charcoals are so much gentler on the eyes.",
        repliedAt: new Date(now - 2 * 3600 * 1000),
        createdAt: new Date(now - 3 * 3600 * 1000),
      },
      {
        workspaceId,
        platform: "TIKTOK",
        authorHandle: "emma_creates",
        authorName: "Emma Davis",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        content: "Such clean transitions in your latest clip! What frame rate did you export in?",
        sentiment: "PRAISE",
        status: "ARCHIVED",
        createdAt: new Date(now - 6 * 3600 * 1000),
      },
    ],
  });

  // 9. Start Page
  const startPage = await prisma.startPage.upsert({
    where: { workspaceId },
    update: {},
    create: {
      workspaceId,
      handle: "ishika-studio",
      title: "Ishika Sharma · Creative Studio",
      bio: "Visual designer, creative director, and creator. Exploring branding, 3D interfaces, and modern web apps.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      theme: "warm-stone",
      isPublished: true,
    },
  });

  await prisma.startPageBlock.createMany({
    data: [
      {
        startPageId: startPage.id,
        type: "link",
        title: "🚀 Download Creator Design System (Free Figma Kit)",
        url: "https://figma.com/@ishika_studio",
        order: 0,
        isActive: true,
      },
      {
        startPageId: startPage.id,
        type: "link",
        title: "📺 Watch Latest Studio Tour & Desk Setup (YouTube)",
        url: "https://youtube.com/@IshikaStudio",
        order: 1,
        isActive: true,
      },
      {
        startPageId: startPage.id,
        type: "link",
        title: "✨ Read My Weekly Creative Dispatch Newsletter",
        url: "https://postinger.app/newsletter",
        order: 2,
        isActive: true,
      },
      {
        startPageId: startPage.id,
        type: "socials",
        title: "Follow my socials",
        url: "https://twitter.com/ishikasharma",
        order: 3,
        isActive: true,
      },
    ],
  });

  // 10. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        workspaceId,
        userId,
        action: "POST_SCHEDULED",
        entity: "Post",
        entityId: p1.id,
        metadata: { title: "Design System & UI Kit Launch", platforms: ["TWITTER", "INSTAGRAM", "LINKEDIN"] },
        createdAt: new Date(now - 12 * 60 * 1000),
      },
      {
        workspaceId,
        userId: sarah.id,
        action: "POST_SCHEDULED",
        entity: "Post",
        entityId: p2.id,
        metadata: { title: "Top 4 Content Strategy Lessons", platforms: ["TWITTER", "LINKEDIN"] },
        createdAt: new Date(now - 45 * 60 * 1000),
      },
      {
        workspaceId,
        userId,
        action: "POST_PUBLISHED",
        entity: "Post",
        metadata: { title: "10,000 Community Milestone", externalId: "tw_1793291823" },
        createdAt: new Date(now - 24 * 3600 * 1000),
      },
      {
        workspaceId,
        userId: sarah.id,
        action: "MEMBER_JOINED",
        entity: "WorkspaceMember",
        entityId: sarah.id,
        metadata: { role: "ADMIN", name: "Sarah Lin" },
        createdAt: new Date(now - 36 * 3600 * 1000),
      },
      {
        workspaceId,
        userId,
        action: "START_PAGE_PUBLISHED",
        entity: "StartPage",
        entityId: startPage.id,
        metadata: { handle: "ishika-studio" },
        createdAt: new Date(now - 48 * 3600 * 1000),
      },
    ],
  });

  console.log(`✅ Rich demo data seeded successfully for workspace: ${workspaceId}`);
}
