import { prisma } from "@/lib/db/client";

export interface CapturedEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  timestamp: string;
  actionUrl?: string;
  type: "VERIFICATION" | "PASSWORD_RESET" | "INVITATION" | "NOTIFICATION";
}

// In-memory ring queue of recently dispatched emails for instant developer access
const emailInbox: CapturedEmail[] = [];
const MAX_EMAILS = 50;

export async function sendOrCaptureEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  actionUrl?: string;
  type: CapturedEmail["type"];
}): Promise<CapturedEmail> {
  const emailItem: CapturedEmail = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    timestamp: new Date().toISOString(),
    actionUrl: params.actionUrl,
    type: params.type,
  };

  emailInbox.unshift(emailItem);
  if (emailInbox.length > MAX_EMAILS) {
    emailInbox.pop();
  }

  // Also log to console for dev awareness
  console.log(`[MAILBOX] ✉️  Dispatched "${params.subject}" to <${params.to}>`);
  if (params.actionUrl) {
    console.log(`[MAILBOX] 🔗 Action Link: ${params.actionUrl}`);
  }

  return emailItem;
}

export function getCapturedEmails(): CapturedEmail[] {
  return [...emailInbox];
}

export function clearCapturedEmails(): void {
  emailInbox.length = 0;
}
