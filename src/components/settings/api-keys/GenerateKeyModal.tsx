"use client";

import React, { useState } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface GenerateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, scopes: string[]) => Promise<string | null>;
}

export function GenerateKeyModal({
  isOpen,
  onClose,
  onSubmit,
}: GenerateKeyModalProps) {
  const [keyName, setKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["posts:read", "posts:write"]);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setGenerating(true);
    try {
      const secret = await onSubmit(keyName.trim(), selectedScopes);
      if (secret) {
        setGeneratedSecret(secret);
      }
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-3">
          Generate New API Key
        </h3>

        {!generatedSecret ? (
          <form onSubmit={handleCreate} className="space-y-4">
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
                onClick={onClose}
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
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
