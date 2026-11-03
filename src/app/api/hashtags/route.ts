import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { createHashtagGroupSchema } from "@/lib/validators/schemas";

// GET /api/hashtags?workspaceId=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return apiError("workspaceId is required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const groups = await prisma.hashtagGroup.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(groups);
}

// POST /api/hashtags
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = createHashtagGroupSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const { workspaceId, name, hashtags } = parsed.data;

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  // Normalize hashtags (ensure # prefix and clean whitespace)
  const cleanTags = hashtags.map((t) => (t.startsWith("#") ? t.trim() : `#${t.trim()}`));

  const group = await prisma.hashtagGroup.create({
    data: {
      workspaceId,
      name: name.trim(),
      hashtags: cleanTags,
    },
  });

  return apiSuccess(group, 201);
}

// DELETE /api/hashtags?id=...&workspaceId=...
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const workspaceId = searchParams.get("workspaceId");

  if (!id || !workspaceId) return apiError("id and workspaceId are required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  await prisma.hashtagGroup.deleteMany({
    where: { id, workspaceId },
  });

  return apiSuccess({ deleted: true });
}
