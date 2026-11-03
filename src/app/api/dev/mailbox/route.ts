import { NextRequest } from "next/server";
import { getCapturedEmails, clearCapturedEmails } from "@/lib/email/mailbox";
import { apiSuccess } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  const emails = getCapturedEmails();
  return apiSuccess({ emails, count: emails.length });
}

export async function DELETE(req: NextRequest) {
  clearCapturedEmails();
  return apiSuccess({ cleared: true });
}
