import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { createWebhookSchema } from "@/lib/validators/schemas";
import { assertSafeUrl } from "@/lib/security/ssrf";
import crypto from "crypto";

// GET /api/webhooks?workspaceId=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return apiError("workspaceId is required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return apiForbidden("Only owners and admins can configure webhooks");
  }

  const webhooks = await prisma.webhook.findMany({
    where: { workspaceId },
    select: {
      id: true,
      url: true,
      events: true,
      isActive: true,
      createdAt: true,
      // Never expose webhook secret
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(webhooks);
}

// POST /api/webhooks — Subscribe new webhook
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = createWebhookSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error");

  const { workspaceId, url, events, secret } = parsed.data;

  // SSRF check on target webhook URL
  try {
    await assertSafeUrl(url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unsafe URL";
    return apiError(msg, 400);
  }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return apiForbidden("Only owners and admins can register webhooks");
  }

  const webhookSecret = secret || crypto.randomBytes(24).toString("hex");

  const webhook = await prisma.webhook.create({
    data: {
      workspaceId,
      url,
      events,
      secret: webhookSecret,
      isActive: true,
    },
  });

  return apiSuccess(
    {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secret: webhookSecret, // Shown once on creation
      isActive: webhook.isActive,
      createdAt: webhook.createdAt,
    },
    201
  );
}

// DELETE /api/webhooks?id=...&workspaceId=...
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
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return apiForbidden();
  }

  const result = await prisma.webhook.deleteMany({
    where: { id, workspaceId },
  });

  if (result.count === 0) {
    return apiError("Webhook not found", 404);
  }

  return apiSuccess({ deleted: true });
}
