import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { registerSchema } from "@/lib/validators/schemas";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { slugify } from "@/lib/utils/helpers";
import { createAuditLog } from "@/lib/utils/audit";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const rl = checkRateLimit({
    identifier: `register:${ip}`,
    windowMs: 15 * 60 * 1000,
    max: 5,
  });
  if (!rl.allowed) {
    return apiError("Too many registration attempts. Please try again later.", 429, "RATE_LIMITED");
  }

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

  // Check for existing user
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    // Return same message to prevent email enumeration
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
    const { sendOrCaptureEmail } = await import("@/lib/email/mailbox");
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

    await sendOrCaptureEmail({
      to: normalizedEmail,
      subject: "Welcome to Postinger — Please verify your email address",
      type: "VERIFICATION",
      actionUrl: verificationUrl,
      text: `Welcome to Postinger, ${name}! Click here to verify your email and begin onboarding: ${verificationUrl}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #111;">Verify your Postinger account</h2>
          <p>Hi ${name},</p>
          <p>Welcome aboard! You're one step away from scheduling content across all your social channels with Postinger.</p>
          <div style="margin: 32px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Verify Email & Continue to Onboarding →
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">Or copy and paste this link in your browser:<br/><a href="${verificationUrl}">${verificationUrl}</a></p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to dispatch verification email:", err);
  }

  // Automatically seed new workspace with vibrant starter data
  try {
    const { seedWorkspaceWithRichDemoData } = await import("@/lib/db/seed-workspace");
    await seedWorkspaceWithRichDemoData(result.workspace.id, result.user.id);
  } catch (err) {
    console.warn("Could not seed workspace on register:", err);
  }

  return apiSuccess(
    { id: result.user.id, email: result.user.email, name: result.user.name },
    201
  );
}
