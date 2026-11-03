import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { auth } from "@/lib/auth/config";
import { createPostingSlotSchema } from "@/lib/validators/schemas";

// GET /api/queue/slots?workspaceId=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const { searchParams } = req.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return apiError("workspaceId is required");

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const slots = await prisma.postingScheduleSlot.findMany({
    where: { workspaceId },
    include: { socialAccount: { select: { id: true, platform: true, handle: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
  });

  return apiSuccess({ slots });
}

// POST /api/queue/slots
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = createPostingSlotSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const data = parsed.data;

  // Verify workspace membership (Tenant Isolation)
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: data.workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const slot = await prisma.postingScheduleSlot.create({
    data: {
      workspaceId: data.workspaceId,
      socialAccountId: data.socialAccountId,
      dayOfWeek: data.dayOfWeek,
      time: data.time,
      timezone: data.timezone,
      isActive: data.isActive,
    },
    include: {
      socialAccount: { select: { id: true, platform: true, handle: true } },
    },
  });

  return apiSuccess(slot, 201);
}

// PATCH /api/queue/slots?id=...&workspaceId=...
export async function PATCH(req: NextRequest) {
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

  let body: { isActive?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  const updated = await prisma.postingScheduleSlot.update({
    where: { id },
    data: {
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
  });

  return apiSuccess(updated);
}

// DELETE /api/queue/slots?id=...&workspaceId=...
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

  await prisma.postingScheduleSlot.delete({
    where: { id },
  });

  return apiSuccess({ deleted: true });
}

