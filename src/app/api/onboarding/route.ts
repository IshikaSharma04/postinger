import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api";
import { z } from "zod";

const onboardingSchema = z.object({
  currentStep: z.number().min(1).max(7),
  useCase: z.string().optional().nullable(),
  persona: z.string().optional().nullable(),
  teamSize: z.string().optional().nullable(),
  targetChannels: z.array(z.string()).optional(),
  postingFrequency: z.string().optional().nullable(),
  mainGoal: z.string().optional().nullable(),
  referralSource: z.string().optional().nullable(),
  isCompleted: z.boolean().optional(),
});

// GET /api/onboarding — Retrieve current onboarding progress
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const state = await prisma.onboardingState.findUnique({
    where: { userId: session.user.id },
  });

  return apiSuccess({ onboarding: state });
}

// POST /api/onboarding — Save step answers and personalize workspace
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body");
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation failed", 400);
  }

  const data = parsed.data;

  const state = await prisma.onboardingState.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      currentStep: data.currentStep,
      useCase: data.useCase,
      persona: data.persona,
      teamSize: data.teamSize,
      targetChannels: data.targetChannels ?? [],
      postingFrequency: data.postingFrequency,
      mainGoal: data.mainGoal,
      referralSource: data.referralSource,
      isCompleted: data.isCompleted ?? false,
      completedAt: data.isCompleted ? new Date() : null,
    },
    update: {
      currentStep: data.currentStep,
      ...(data.useCase !== undefined ? { useCase: data.useCase } : {}),
      ...(data.persona !== undefined ? { persona: data.persona } : {}),
      ...(data.teamSize !== undefined ? { teamSize: data.teamSize } : {}),
      ...(data.targetChannels !== undefined ? { targetChannels: data.targetChannels } : {}),
      ...(data.postingFrequency !== undefined ? { postingFrequency: data.postingFrequency } : {}),
      ...(data.mainGoal !== undefined ? { mainGoal: data.mainGoal } : {}),
      ...(data.referralSource !== undefined ? { referralSource: data.referralSource } : {}),
      ...(data.isCompleted !== undefined ? { isCompleted: data.isCompleted } : {}),
      ...(data.isCompleted ? { completedAt: new Date() } : {}),
    },
  });

  // If completed, adjust user's primary workspace posting goal
  if (data.isCompleted && data.postingFrequency) {
    let goal = 5;
    if (data.postingFrequency.includes("1-3")) goal = 3;
    if (data.postingFrequency.includes("4-7")) goal = 7;
    if (data.postingFrequency.includes("Multiple")) goal = 14;

    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
    });
    if (member) {
      await prisma.workspace.update({
        where: { id: member.workspaceId },
        data: { postingGoal: goal },
      });
    }
  }

  return apiSuccess({ state });
}
