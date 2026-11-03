import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import crypto from "crypto";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const rl = checkRateLimit({
    identifier: `forgot-pw:${ip}`,
    windowMs: 15 * 60 * 1000,
    max: 5,
  });
  if (!rl.allowed) {
    return apiError("Too many password reset requests. Please try again later.", 429, "RATE_LIMITED");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid email");
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Generate secure single-use token expiring in 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate prior unused tokens
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const { sendOrCaptureEmail } = await import("@/lib/email/mailbox");
    await sendOrCaptureEmail({
      to: email,
      subject: "Reset your Postinger password",
      type: "PASSWORD_RESET",
      actionUrl: resetUrl,
      text: `Click here to reset your Postinger password: ${resetUrl}. This link expires in 1 hour.`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #111;">Password Reset Request</h2>
          <p>We received a request to reset your password for your Postinger account.</p>
          <div style="margin: 32px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset Password →
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">This link will expire in 60 minutes. If you did not make this request, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  // Consistent message prevents email enumeration
  return apiSuccess({
    message: "If an account exists with this email, a password reset link has been dispatched.",
  });
}
