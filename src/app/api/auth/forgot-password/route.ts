import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { checkRateLimitAsync, getClientIp } from "@/lib/utils/rate-limit";
import crypto from "crypto";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

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

  const rl = await checkRateLimitAsync({
    identifier: `forgot-pw:${ip}:${email}`,
    windowMs: 15 * 60 * 1000,
    max: 5,
  });
  if (!rl.allowed) {
    return apiError("Too many password reset requests. Please try again later.", 429, "RATE_LIMITED");
  }
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

    const { sendEmail } = await import("@/lib/email/send");
    const { passwordResetEmailTemplate } = await import("@/lib/email/templates");
    const template = passwordResetEmailTemplate({ resetUrl });

    await sendEmail({
      to: email,
      subject: template.subject,
      type: "PASSWORD_RESET",
      actionUrl: resetUrl,
      text: template.text,
      html: template.html,
    });
  }

  // Consistent message prevents email enumeration
  return apiSuccess({
    message: "If an account exists with this email, a password reset link has been dispatched.",
  });
}
