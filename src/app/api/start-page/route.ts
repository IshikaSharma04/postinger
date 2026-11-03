import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { updateStartPageSchema } from "@/lib/validators/schemas";
import { createAuditLog } from "@/lib/utils/audit";

// GET /api/start-page?workspaceId=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const { searchParams } = req.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return apiError("workspaceId is required");

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    include: { workspace: true },
  });
  if (!member) return apiForbidden();

  let startPage = await prisma.startPage.findUnique({
    where: { workspaceId },
    include: { blocks: { orderBy: { order: "asc" } } },
  });

  if (!startPage) {
    // Generate initial Start Page
    const initialHandle = `${member.workspace.slug.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    startPage = await prisma.startPage.create({
      data: {
        workspaceId,
        handle: initialHandle,
        title: member.workspace.name,
        bio: "Creator & Social Media Strategist. Explore our latest launches, templates, and weekly updates.",
        avatarUrl: session.user.image ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        theme: "warm-stone",
        blocks: {
          create: [
            {
              type: "link",
              title: "🚀 Latest Product Launch & Roadmap",
              url: "https://example.com/launch",
              order: 0,
            },
            {
              type: "link",
              title: "🎙️ Listen to the Weekly Podcast",
              url: "https://example.com/podcast",
              order: 1,
            },
            {
              type: "link",
              title: "💌 Join the 45,000+ Creator Newsletter",
              url: "https://example.com/newsletter",
              order: 2,
            },
          ],
        },
      },
      include: { blocks: { orderBy: { order: "asc" } } },
    });
  }

  return apiSuccess({ startPage });
}

// PUT /api/start-page
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = updateStartPageSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const data = parsed.data;

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: data.workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  // Check if handle is taken by another workspace
  const existingWithHandle = await prisma.startPage.findUnique({
    where: { handle: data.handle },
  });
  if (existingWithHandle && existingWithHandle.workspaceId !== data.workspaceId) {
    return apiError("This handle is already taken. Please choose another.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    // 1. Update or create startPage
    const page = await tx.startPage.upsert({
      where: { workspaceId: data.workspaceId },
      create: {
        workspaceId: data.workspaceId,
        handle: data.handle,
        title: data.title,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        theme: data.theme,
        layout: data.layout ?? "stack",
        font: data.font ?? "inter",
        isPublished: data.isPublished,
      },
      update: {
        handle: data.handle,
        title: data.title,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        theme: data.theme,
        layout: data.layout ?? "stack",
        font: data.font ?? "inter",
        isPublished: data.isPublished,
      },
    });

    // 2. Refresh blocks
    await tx.startPageBlock.deleteMany({
      where: { startPageId: page.id },
    });

    if (data.blocks && data.blocks.length > 0) {
      await tx.startPageBlock.createMany({
        data: data.blocks.map((b, idx) => ({
          startPageId: page.id,
          type: b.type,
          title: b.title,
          url: b.url,
          icon: b.icon,
          order: idx,
          isActive: b.isActive,
        })),
      });
    }

    return tx.startPage.findUnique({
      where: { id: page.id },
      include: { blocks: { orderBy: { order: "asc" } } },
    });
  });

  await createAuditLog({
    workspaceId: data.workspaceId,
    userId: session.user.id,
    action: "START_PAGE_UPDATED",
    entity: "start_page",
    entityId: updated?.id,
    metadata: { handle: data.handle },
  });

  return apiSuccess({ startPage: updated });
}
