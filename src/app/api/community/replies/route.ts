import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { createSavedReplySchema } from "@/lib/validators/schemas";

// GET /api/community/replies?workspaceId=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return apiError("workspaceId is required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  // If no replies exist, seed initial presets
  const count = await prisma.savedReply.count({ where: { workspaceId } });
  if (count === 0) {
    await prisma.savedReply.createMany({
      data: [
        {
          workspaceId,
          shortcut: ":thanks",
          content: "Thank you so much for the kind words! Really appreciate your support 🙏",
        },
        {
          workspaceId,
          shortcut: ":link",
          content: "You can find all the details and links at our start page: https://postinger.app/p/demo",
        },
        {
          workspaceId,
          shortcut: ":roadmap",
          content: "Great suggestion! We've added this to our product roadmap. Stay tuned for the next update 🚀",
        },
      ],
    });
  }

  const replies = await prisma.savedReply.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(replies);
}

// POST /api/community/replies
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = createSavedReplySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  const { workspaceId, shortcut, content } = parsed.data;

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const cleanShortcut = shortcut.startsWith(":") ? shortcut.trim() : `:${shortcut.trim()}`;

  const savedReply = await prisma.savedReply.create({
    data: {
      workspaceId,
      shortcut: cleanShortcut,
      content: content.trim(),
    },
  });

  return apiSuccess(savedReply, 201);
}

// DELETE /api/community/replies?id=...&workspaceId=...
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const id = req.nextUrl.searchParams.get("id");
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!id || !workspaceId) return apiError("id and workspaceId are required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  await prisma.savedReply.deleteMany({
    where: { id, workspaceId },
  });

  return apiSuccess({ deleted: true });
}
