import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid profile data", 400);
  }

  const { name, email } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // If email changed, check uniqueness
  if (normalizedEmail !== session.user.email?.toLowerCase()) {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return apiError("This email is already in use by another account.", 409);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email: normalizedEmail,
    },
  });

  return apiSuccess({
    user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
    message: "Profile updated successfully!",
  });
}
