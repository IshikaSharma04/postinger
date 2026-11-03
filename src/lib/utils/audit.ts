import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";

export async function createAuditLog(params: {
  workspaceId: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        workspaceId: params.workspaceId,
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        // Safe: never log passwords, tokens, or secrets
        metadata: (params.metadata
          ? sanitizeMetadata(params.metadata)
          : undefined) as Prisma.InputJsonValue,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (err) {
    // Audit logging failures should never crash the app
    console.error("[AuditLog] Failed to write audit log:", err instanceof Error ? err.message : "unknown");
  }
}

function sanitizeMetadata(
  metadata: Record<string, unknown>
): Record<string, unknown> {
  const BLOCKED_KEYS = new Set([
    "password",
    "passwordHash",
    "token",
    "secret",
    "apiKey",
    "credentials",
    "access_token",
    "refresh_token",
  ]);

  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !BLOCKED_KEYS.has(key))
  );
}

export async function getWorkspaceAuditLogs(
  workspaceId: string,
  limit = 50
) {
  return prisma.auditLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
