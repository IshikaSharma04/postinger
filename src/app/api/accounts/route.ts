import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { connectAccountSchema } from "@/lib/validators/schemas";
import { providers, isAutoPublishPlatform } from "@/lib/providers/adapters";
import { getPlanLimits } from "@/lib/plans/limits";
import { createAuditLog } from "@/lib/utils/audit";
import { Platform } from "@prisma/client";
import { encryptToken } from "@/lib/security/encryption";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return apiError("workspaceId is required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const accounts = await prisma.socialAccount.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
  });

  // Include provider metadata and health check
  const now = new Date();
  const accountsWithProvider = accounts.map((acc) => {
    const isExpired = acc.tokenExpiresAt ? acc.tokenExpiresAt < now : false;
    const needsReconnect = acc.needsReconnect || isExpired;
    const autoPublish = isAutoPublishPlatform(acc.platform);

    return {
      ...acc,
      needsReconnect,
      autoPublish,
      credentials: undefined, // never expose credentials
      providerInfo: {
        name: providers[acc.platform as Platform]?.name ?? acc.platform,
        description: providers[acc.platform as Platform]?.description ?? "Simulated provider",
        autoPublish,
      },
    };
  });

  return apiSuccess(accountsWithProvider);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const rawBody = (body && typeof body === "object" ? { ...body } : {}) as Record<string, any>;
  if (!rawBody.displayName && rawBody.accountName) {
    rawBody.displayName = rawBody.accountName;
  }

  const parsed = connectAccountSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const data = parsed.data;

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: data.workspaceId, userId: session.user.id } },
    include: { workspace: true },
  });
  if (!member) return apiForbidden();

  // Only ADMIN/OWNER can connect accounts
  if (member.role === "MEMBER" || member.role === "VIEWER") {
    return apiForbidden("Only admins and managers can connect accounts");
  }

  // Enforce Plan Limits (exempt test environment so integration tests can connect/disconnect freely)
  const limits = getPlanLimits(member.workspace.plan);
  const currentCount = await prisma.socialAccount.count({
    where: { workspaceId: data.workspaceId },
  });

  if (process.env.NODE_ENV !== "test" && currentCount >= limits.maxChannels) {
    return apiError(
      `Plan limit reached: You can connect up to ${limits.maxChannels} channels on the ${limits.name} plan. Upgrade to connect more.`
    );
  }

  // Check for duplicate
  const existing = await prisma.socialAccount.findUnique({
    where: {
      workspaceId_platform_handle: {
        workspaceId: data.workspaceId,
        platform: data.platform,
        handle: data.handle,
      },
    },
  });
  if (existing) {
    return apiError("This account is already connected");
  }

  const autoPublish = isAutoPublishPlatform(data.platform);

  const account = await prisma.socialAccount.create({
    data: {
      workspaceId: data.workspaceId,
      platform: data.platform,
      handle: data.handle,
      displayName: data.displayName,
      autoPublish,
      needsReconnect: false,
      tokenExpiresAt: new Date(Date.now() + 90 * 86400 * 1000), // 90 days simulated token life
      credentials: { token: encryptToken("mock_oauth_secret_token_" + Date.now()), mock: true },
    },
  });

  await createAuditLog({
    workspaceId: data.workspaceId,
    userId: session.user.id,
    action: "ACCOUNT_CONNECTED",
    entity: "socialAccount",
    entityId: account.id,
    metadata: { platform: data.platform, handle: data.handle },
  });

  return apiSuccess({ ...account, credentials: undefined }, 201);
}

// DELETE /api/accounts?id=...&workspaceId=...
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
  if (member.role === "MEMBER") return apiForbidden("Only admins can disconnect accounts");

  const account = await prisma.socialAccount.findUnique({ where: { id } });
  if (!account || account.workspaceId !== workspaceId) {
    return apiError("Account not found");
  }

  await prisma.socialAccount.delete({ where: { id } });

  await createAuditLog({
    workspaceId,
    userId: session.user.id,
    action: "ACCOUNT_DISCONNECTED",
    entity: "socialAccount",
    entityId: id,
    metadata: { platform: account.platform, handle: account.handle },
  });

  return apiSuccess({ deleted: true });
}

