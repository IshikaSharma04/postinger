/**
 * Postinger Outgoing Webhook Dispatcher
 * Signs payloads with HMAC-SHA256 and delivers notifications to subscribers.
 */

import { prisma } from "../db/client";
import { assertSafeUrl } from "../security/ssrf";
import crypto from "crypto";

export type WebhookEvent = "post.published" | "post.failed" | "comment.received";

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
}

export async function dispatchWebhook(workspaceId: string, event: WebhookEvent, data: Record<string, any>) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      workspaceId,
      isActive: true,
      events: { has: event },
    },
  });

  if (webhooks.length === 0) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const payloadString = JSON.stringify(payload);

  for (const hook of webhooks) {
    try {
      // Guard against SSRF
      await assertSafeUrl(hook.url);

      // Compute HMAC-SHA256 signature
      const signature = crypto.createHmac("sha256", hook.secret).update(payloadString).digest("hex");

      // Deliver HTTP POST with 5s timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      await fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Postinger-Signature": signature,
          "X-Postinger-Event": event,
          "User-Agent": "Postinger-Webhook-Delivery/1.0",
        },
        body: payloadString,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
    } catch (err: any) {
      console.warn(`[Webhook Delivery Error] ${hook.url}:`, err?.message);
    }
  }
}
