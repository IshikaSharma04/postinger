import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { isRateLimited } from "@/lib/utils/rate-limit";
import crypto from "crypto";
import { z } from "zod";

type AuthResult =
  | { error: string; status: number }
  | { apiKey: any; workspaceId: string };

async function authenticateApiKey(req: NextRequest, requiredScope: string): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header. Expected Bearer pst_...", status: 401 };
  }

  const rawKey = authHeader.slice(7).trim();
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { workspace: true },
  });

  if (!apiKey) {
    return { error: "Invalid API key", status: 401 };
  }

  if (apiKey.revokedAt) {
    return { error: "API key revoked", status: 401 };
  }

  if (!apiKey.scopes.includes(requiredScope) && !apiKey.scopes.includes("*")) {
    return { error: `Forbidden: API key lacks required scope '${requiredScope}'`, status: 403 };
  }

  // Rate limiting: 100 requests per minute per key
  const rateLimitKey = `api_key:${apiKey.id}`;
  if (isRateLimited(rateLimitKey, 100, 60000)) {
    return { error: "Rate limit exceeded. Maximum 100 requests per minute.", status: 429 };
  }

  // Update last used timestamp async
  prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  return { apiKey, workspaceId: apiKey.workspaceId };
}

// GET /api/v1/posts — List posts for workspace
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req, "posts:read");
  if ("error" in auth) {
    return apiError(auth.error, auth.status);
  }

  const posts = await prisma.post.findMany({
    where: { workspaceId: auth.workspaceId },
    select: {
      id: true,
      title: true,
      body: true,
      status: true,
      postFormat: true,
      tags: true,
      scheduledAt: true,
      publishedAt: true,
      createdAt: true,
      postAccounts: {
        select: {
          socialAccount: {
            select: { id: true, platform: true, handle: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return apiSuccess({ posts, count: posts.length });
}

// POST /api/v1/posts — Create a draft post via Public API
const publicCreatePostSchema = z.object({
  body: z.string().min(1).max(5000),
  tags: z.array(z.string()).default([]),
  hashtags: z.array(z.string()).default([]),
  action: z.enum(["DRAFT", "QUEUE", "SCHEDULE"]).default("DRAFT"),
  scheduledAt: z.coerce.date().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req, "posts:write");
  if ("error" in auth) {
    return apiError(auth.error, auth.status);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const parsed = publicCreatePostSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error");

  const data = parsed.data;

  // Retrieve an account for the workspace
  const defaultAccount = await prisma.socialAccount.findFirst({
    where: { workspaceId: auth.workspaceId },
  });

  if (!defaultAccount) {
    return apiError("Cannot create post: Workspace has no connected social accounts");
  }

  // Get workspace owner
  const owner = await prisma.workspaceMember.findFirst({
    where: { workspaceId: auth.workspaceId, role: "OWNER" },
  });

  const post = await prisma.post.create({
    data: {
      workspaceId: auth.workspaceId,
      authorId: owner?.userId || "system",
      body: data.body,
      hashtags: data.hashtags,
      tags: data.tags,
      status: data.action === "SCHEDULE" && data.scheduledAt ? "SCHEDULED" : "DRAFT",
      scheduledAt: data.scheduledAt ?? null,
      postAccounts: {
        create: [{ socialAccountId: defaultAccount.id }],
      },
    },
  });

  return apiSuccess(post, 201);
}
