import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const { token } = body;
  if (!token) {
    return apiError("Verification token is required", 400);
  }

  const record = await prisma.emailVerification.findFirst({
    where: {
      token,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return apiError("This verification link is invalid or has expired.", 400);
  }

  // Update user as verified and mark token used
  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.email },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerification.update({
      where: { id: record.id },
      data: { used: true },
    }),
  ]);

  return apiSuccess({
    verified: true,
    email: record.email,
    message: "Email verified successfully! Proceed to onboarding.",
  });
}
