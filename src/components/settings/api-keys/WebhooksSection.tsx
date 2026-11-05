"use client";

import React, { useState } from "react";
import { Radio } from "lucide-react";
import { WebhookItem } from "./types";

interface WebhooksSectionProps {
  webhooks: WebhookItem[];
  onAddWebhook: (url: string) => Promise<void>;
  addingWebhook: boolean;
}

export function WebhooksSection({
  webhooks,
  onAddWebhook,
  addingWebhook,
}: WebhooksSectionProps) {
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    await onAddWebhook(webhookUrl.trim());
    setWebhookUrl("");
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-zinc-900">Signed Webhooks (HMAC-SHA256)</h3>
        </div>
        <span className="text-xs text-zinc-400 font-mono">X-Postinger-Signature</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://api.yourdomain.com/webhooks/postinger"
          className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
        />
        <button
          type="submit"
          disabled={addingWebhook || !webhookUrl.trim()}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-colors disabled:opacity-50"
        >
          {addingWebhook ? "Registering..." : "+ Add Webhook"}
        </button>
      </form>

      <div className="divide-y divide-zinc-100 pt-2">
        {webhooks.length === 0 ? (
          <p className="text-xs text-zinc-400 py-4 text-center">No webhook endpoints registered.</p>
        ) : (
          webhooks.map((wh) => (
            <div key={wh.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
              <div className="min-w-0 pr-4">
                <span className="font-mono text-zinc-800 font-semibold truncate block">{wh.url}</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Secret: {wh.secret ? `${wh.secret.slice(0, 10)}...` : "••••••••"}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Active
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
