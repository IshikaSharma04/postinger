import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api";
import { createWorkspaceSchema } from "@/lib/validators/schemas";
import { createAuditLog } from "@/lib/utils/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true, posts: true, socialAccounts: true } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return apiSuccess(memberships.map((m) => ({ ...m.workspace, role: m.role })));
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

  const parsed = createWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const { name, slug } = parsed.data;
  const userId = session.user.id;
  if (!userId) return apiUnauthorized();

  const existing = await prisma.workspace.findUnique({ where: { slug } });
  if (existing) return apiError("A workspace with this slug already exists", 409);

  const workspace = await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({ data: { name, slug } });
    await tx.workspaceMember.create({
      data: { workspaceId: ws.id, userId, role: "OWNER" },
    });
    return ws;
  });

  await createAuditLog({
    workspaceId: workspace.id,
    userId: session.user.id,
    action: "WORKSPACE_CREATED",
    entity: "workspace",
    entityId: workspace.id,
    metadata: { name, slug },
  });

  return apiSuccess(workspace, 201);
}
