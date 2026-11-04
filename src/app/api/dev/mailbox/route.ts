import { NextResponse } from "next/server";
import { getCapturedEmails, clearCapturedEmails } from "@/lib/email/mailbox";
import { apiSuccess } from "@/lib/utils/api";

export async function GET(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }
  const emails = getCapturedEmails();
  return apiSuccess({ emails, count: emails.length });
}

export async function DELETE(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }
  clearCapturedEmails();
  return apiSuccess({ cleared: true });
}
