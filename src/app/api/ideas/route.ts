import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { createIdeaSchema } from "@/lib/validators/schemas";
import { createAuditLog } from "@/lib/utils/audit";

// GET /api/ideas?workspaceId=...&status=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const { searchParams } = req.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  const status = searchParams.get("status");

  if (!workspaceId) return apiError("workspaceId is required");

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const ideas = await prisma.idea.findMany({
    where: {
      workspaceId,
      ...(status ? { status: status as import("@prisma/client").IdeaStatus } : {}),
    },
    include: {
      author: { select: { id: true, name: true, image: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return apiSuccess({ ideas });
}

// POST /api/ideas
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = createIdeaSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const data = parsed.data;

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: data.workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const idea = await prisma.idea.create({
    data: {
      workspaceId: data.workspaceId,
      authorId: session.user.id,
      title: data.title,
      content: data.content,
      tags: data.tags,
      status: data.status,
      mediaUrl: data.mediaUrl,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  await createAuditLog({
    workspaceId: data.workspaceId,
    userId: session.user.id,
    action: "IDEA_CREATED",
    entity: "idea",
    entityId: idea.id,
  });

  return apiSuccess(idea, 201);
}
