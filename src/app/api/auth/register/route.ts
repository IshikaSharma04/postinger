import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { registerSchema } from "@/lib/validators/schemas";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { checkRateLimitAsync, getClientIp } from "@/lib/utils/rate-limit";
import { slugify } from "@/lib/utils/helpers";
import { createAuditLog } from "@/lib/utils/audit";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error", 400);
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Rate limiting keyed on IP and email
  const rl = await checkRateLimitAsync({
    identifier: `register:${ip}:${normalizedEmail}`,
    windowMs: 15 * 60 * 1000,
    max: 5,
  });
  if (!rl.allowed) {
    return apiError("Too many registration attempts. Please try again later.", 429, "RATE_LIMITED");
  }

  // Check for existing user
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return apiError("An account with this email already exists", 409);
  }

  // Hash password with bcrypt (12 rounds)
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user and first workspace in a transaction
  const workspaceName = `${name.split(" ")[0]}'s Workspace`;
  const workspaceSlug = slugify(`${name.split(" ")[0]}-workspace-${Date.now()}`);

  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: workspaceName,
        slug: workspaceSlug,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: newUser.id,
        role: "OWNER",
      },
    });

    await createAuditLog({
      workspaceId: workspace.id,
      userId: newUser.id,
      action: "USER_REGISTERED",
      entity: "user",
      entityId: newUser.id,
      ipAddress: ip,
    });

    return { user: newUser, workspace };
  });

  // Generate email verification token and send to mailbox
  try {
    const crypto = await import("crypto");
    const { sendEmail } = await import("@/lib/email/send");
    const { verificationEmailTemplate } = await import("@/lib/email/templates");
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerification.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify-email?token=${token}`;
    const template = verificationEmailTemplate({ name, verifyUrl: verificationUrl });

    await sendEmail({
      to: normalizedEmail,
      subject: template.subject,
      type: "VERIFICATION",
      actionUrl: verificationUrl,
      text: template.text,
      html: template.html,
    });
  } catch (err) {
    console.error("Failed to dispatch verification email:", err);
  }

  return apiSuccess(
    { id: result.user.id, email: result.user.email, name: result.user.name },
    201
  );
}
