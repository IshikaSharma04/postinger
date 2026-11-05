"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Key,
  Plus,
  Trash2,
  Code,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { GenerateKeyModal } from "@/components/settings/api-keys/GenerateKeyModal";
import { WebhooksSection } from "@/components/settings/api-keys/WebhooksSection";
import { ApiKeyItem, WebhookItem, WorkspaceItem } from "@/components/settings/api-keys/types";

export default function ApiKeysSettingsPage() {
  const [workspace, setWorkspace] = useState<WorkspaceItem | null>(null);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [addingWebhook, setAddingWebhook] = useState(false);

  const fetchData = async () => {
    try {
      const wsRes = await fetch("/api/workspaces");
      const wsJson = await wsRes.json();
      if (wsJson.success && wsJson.data?.[0]) {
        const ws: WorkspaceItem = wsJson.data[0];
        setWorkspace(ws);

        // Fetch API keys
        const keysRes = await fetch(`/api/v1/keys?workspaceId=${ws.id}`);
        const keysJson = await keysRes.json();
        if (keysJson.success && Array.isArray(keysJson.data)) {
          setKeys(keysJson.data);
        }

        // Fetch webhooks
        const whRes = await fetch(`/api/webhooks?workspaceId=${ws.id}`);
        const whJson = await whRes.json();
        if (whJson.success && Array.isArray(whJson.data)) {
          setWebhooks(whJson.data);
        }
      }
    } catch (err: unknown) {
      console.warn("Error loading developer settings", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateKey = async (name: string, scopes: string[]): Promise<string | null> => {
    if (!workspace) return null;
    try {
      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          name,
          scopes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate key");

      toast.success("API key generated! Make sure to copy it now.");
      await fetchData();
      return data.data.key;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not generate key");
      return null;
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will immediately fail.")) return;
    try {
      await fetch(`/api/v1/keys?id=${keyId}`, { method: "DELETE" });
      toast.success("API key revoked");
      await fetchData();
    } catch {
      toast.error("Failed to revoke key");
    }
  };

  const handleAddWebhook = async (url: string) => {
    if (!workspace) return;
    setAddingWebhook(true);

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          url,
          events: ["post.published", "post.failed", "comment.received"],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register webhook");

      toast.success("Webhook endpoint registered successfully!");
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create webhook");
    } finally {
      setAddingWebhook(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-6 text-xs font-bold text-zinc-500">
        <Link href="/settings/profile" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          Profile
        </Link>
        <Link href="/settings/billing" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          Plans & Billing
        </Link>
        <Link href="/team" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          Team Members
        </Link>
        <Link href="/settings/api-keys" className="py-3 text-blue-600 border-b-2 border-blue-600">
          API Keys & Webhooks
        </Link>
        <Link href="/settings/security" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          Security
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Developer Platform</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage REST API keys, MCP integration, and outgoing HMAC-signed webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/api/docs"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
          >
            <Code className="w-4 h-4 text-zinc-500" />
            <span>OpenAPI 3.0 Docs</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Generate New Key</span>
          </button>
        </div>
      </div>

      {/* ── API Keys Section ── */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-zinc-900">Active API Keys</h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Bearer pst_...</span>
        </div>

        <div className="divide-y divide-zinc-100">
          {keys.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 space-y-2">
              <Key className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs font-semibold">No API keys created yet</p>
              <p className="text-[11px] text-zinc-400">Generate a scoped key to interact via REST or Model Context Protocol.</p>
            </div>
          ) : (
            keys.map((k) => (
              <div key={k.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-900">{k.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-mono">
                      {k.keyPrefix}...
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {k.scopes?.map((s: string) => (
                      <span key={s} className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[9px] font-bold font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Created {new Date(k.createdAt).toLocaleDateString()}
                    {k.lastUsedAt && ` · Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`}
                  </div>
                </div>

                <button
                  onClick={() => handleRevokeKey(k.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors w-fit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Revoke
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Outgoing Webhooks Section ── */}
      <WebhooksSection
        webhooks={webhooks}
        onAddWebhook={handleAddWebhook}
        addingWebhook={addingWebhook}
      />

      {/* ── Generate Modal ── */}
      <GenerateKeyModal
        isOpen={showNewKeyModal}
        onClose={() => setShowNewKeyModal(false)}
        onSubmit={handleCreateKey}
      />
    </div>
  );
}
