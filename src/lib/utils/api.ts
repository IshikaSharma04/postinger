import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, { status });
}

export function apiError(
  message: string,
  status = 400,
  code?: string
): NextResponse {
  // Never expose stack traces or internal details
  return NextResponse.json(
    { success: false, error: message, code } satisfies ApiResponse,
    { status }
  );
}

export function apiUnauthorized(msg = "Unauthorized"): NextResponse {
  return apiError(msg, 401, "UNAUTHORIZED");
}

export function apiForbidden(msg = "Forbidden"): NextResponse {
  return apiError(msg, 403, "FORBIDDEN");
}

export function apiNotFound(msg = "Not found"): NextResponse {
  return apiError(msg, 404, "NOT_FOUND");
}

export function apiServerError(): NextResponse {
  return apiError("An internal error occurred", 500, "INTERNAL_ERROR");
}
