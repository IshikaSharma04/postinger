import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api";
import { aiGenerateSchema } from "@/lib/validators/schemas";
import { executeAiAction } from "@/lib/ai/service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request payload");
  }

  const parsed = aiGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  try {
    const result = await executeAiAction({
      userId: session.user.id,
      ...parsed.data,
    });
    return apiSuccess(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process AI request";
    return apiError(msg);
  }
}
