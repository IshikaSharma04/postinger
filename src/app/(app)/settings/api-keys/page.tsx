"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Code,
  ShieldCheck,
  ExternalLink,
  Radio,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function ApiKeysSettingsPage() {
  const [workspace, setWorkspace] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Key Modal
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["posts:read", "posts:write"]);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Webhooks
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [addingWebhook, setAddingWebhook] = useState(false);

  const fetchData = async () => {
    try {
      const wsRes = await fetch("/api/workspaces");
      const wsJson = await wsRes.json();
      if (wsJson.success && wsJson.data?.[0]) {
        const ws = wsJson.data[0];
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim() || !workspace) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          name: keyName.trim(),
          scopes: selectedScopes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate key");

      setGeneratedSecret(data.data.key);
      toast.success("API key generated! Make sure to copy it now.");
      await fetchData();
    } catch (e: any) {
      toast.error(e.message || "Could not generate key");
    } finally {
      setGenerating(false);
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

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || !workspace) return;
    setAddingWebhook(true);

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          url: webhookUrl.trim(),
          events: ["post.published", "post.failed", "comment.received"],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register webhook");

      toast.success("Webhook endpoint registered successfully!");
      setWebhookUrl("");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create webhook");
    } finally {
      setAddingWebhook(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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
            onClick={() => {
              setGeneratedSecret(null);
              setKeyName("");
              setShowNewKeyModal(true);
            }}
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
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-zinc-900">Signed Webhooks (HMAC-SHA256)</h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">X-Postinger-Signature</span>
        </div>

        <form onSubmit={handleAddWebhook} className="flex gap-2">
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

      {/* ── Generate Modal ── */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-3">
              Generate New API Key
            </h3>

            {!generatedSecret ? (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">Key Name / Description</label>
                  <input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g. Production CI/CD or MCP Server"
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-2">Permissions & Scopes</label>
                  <div className="space-y-2 text-xs">
                    {[
                      { id: "posts:read", label: "posts:read (View published and scheduled posts)" },
                      { id: "posts:write", label: "posts:write (Create drafts and queue posts)" },
                      { id: "analytics:read", label: "analytics:read (Access engagement telemetry)" },
                    ].map((scope) => {
                      const checked = selectedScopes.includes(scope.id);
                      return (
                        <label key={scope.id} className="flex items-center gap-2 cursor-pointer text-zinc-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedScopes((prev) =>
                                checked ? prev.filter((s) => s !== scope.id) : [...prev, scope.id]
                              );
                            }}
                            className="rounded accent-blue-600"
                          />
                          <span>{scope.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewKeyModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating || !keyName.trim()}
                    className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {generating ? "Generating..." : "Generate Key"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Save this key now!
                  </div>
                  <p className="text-[11px] text-amber-800">
                    For your security, this secret token is hashed and cannot be shown again.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl text-white font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto">
                  <span className="truncate">{generatedSecret}</span>
                  <button
                    onClick={() => copyToClipboard(generatedSecret)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => setShowNewKeyModal(false)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
