import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const feedbackSchema = z.object({
  message: z.string().min(3, "Please enter at least a brief feedback note").max(2000),
  rating: z.number().min(1).max(5).optional(),
  category: z.string().optional().default("general"),
});

export async function POST(req: NextRequest) {
  const session = await auth();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error", 400);
  }

  const { message, rating, category } = parsed.data;

  const feedback = await prisma.userFeedback.create({
    data: {
      userId: session?.user?.id ?? null,
      message,
      rating: rating ?? 5,
      category,
    },
  });

  return apiSuccess({
    feedback,
    message: "Thank you for helping make Postinger better! Your feedback has been recorded.",
  });
}
