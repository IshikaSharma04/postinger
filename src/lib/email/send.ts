import { logger } from "@/lib/utils/logger";
import { sendOrCaptureEmail, CapturedEmail } from "./mailbox";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  actionUrl?: string;
  type: CapturedEmail["type"];
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "Postinger <notifications@postinger.app>";

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        logger.error(`Resend API delivery error (${res.status}): ${errorText}`);
      } else {
        const data = (await res.json()) as { id: string };
        logger.info(`Dispatched email via Resend to ${options.to} (id: ${data.id})`);
        return { success: true, id: data.id };
      }
    } catch (err) {
      logger.error("Failed to deliver email through Resend API", err);
    }
  }

  // Fallback to local dev mailbox in development/test
  const captured = await sendOrCaptureEmail(options);
  return { success: true, id: captured.id };
}
