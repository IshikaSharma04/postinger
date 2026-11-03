import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { createApiKeySchema } from "@/lib/validators/schemas";
import { createAuditLog } from "@/lib/utils/audit";
import crypto from "crypto";

// GET /api/v1/keys?workspaceId=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return apiError("workspaceId is required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return apiForbidden("Only owners and admins can view API keys");
  }

  const keys = await prisma.apiKey.findMany({
    where: { workspaceId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      scopes: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(keys);
}

// POST /api/v1/keys — Create a new API key (shown once)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = createApiKeySchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error");

  const { workspaceId, name, scopes } = parsed.data;

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return apiForbidden("Only owners and admins can create API keys");
  }

  // Generate cryptographic token
  const rawSecret = crypto.randomBytes(24).toString("hex");
  const fullApiKey = `pst_${rawSecret}`;
  const keyPrefix = `pst_${rawSecret.slice(0, 4)}...`;
  const keyHash = crypto.createHash("sha256").update(fullApiKey).digest("hex");

  const apiKey = await prisma.apiKey.create({
    data: {
      workspaceId,
      name,
      keyPrefix,
      keyHash,
      scopes,
    },
  });

  await createAuditLog({
    workspaceId,
    userId: session.user.id,
    action: "API_KEY_CREATED",
    entity: "apiKey",
    entityId: apiKey.id,
    metadata: { name, scopes },
  });

  // Return the full key ONCE
  return apiSuccess(
    {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      apiKey: fullApiKey, // ONLY shown once!
      scopes: apiKey.scopes,
      createdAt: apiKey.createdAt,
    },
    201
  );
}

// DELETE /api/v1/keys?id=...&workspaceId=... — Revoke key
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
    return apiForbidden("Only owners and admins can revoke API keys");
  }

  await prisma.apiKey.delete({ where: { id } });

  await createAuditLog({
    workspaceId,
    userId: session.user.id,
    action: "API_KEY_REVOKED",
    entity: "apiKey",
    entityId: id,
  });

  return apiSuccess({ revoked: true });
}
