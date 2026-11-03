import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string().min(16),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const rl = checkRateLimit({
    identifier: `reset-pw:${ip}`,
    windowMs: 15 * 60 * 1000,
    max: 10,
  });
  if (!rl.allowed) {
    return apiError("Too many attempts. Please try again later.", 429, "RATE_LIMITED");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const { token, password } = parsed.data;

  // Find valid, non-expired, unused token
  const resetRecord = await prisma.passwordReset.findFirst({
    where: {
      token,
      used: false,
      expires: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!resetRecord) {
    return apiError("Invalid or expired password reset token", 400);
  }

  // Hash new password with bcrypt (12 rounds)
  const passwordHash = await bcrypt.hash(password, 12);

  // Update password and mark token as used in a transaction
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    }),
  ]);

  return apiSuccess({ message: "Password updated successfully. You can now log in." });
}
