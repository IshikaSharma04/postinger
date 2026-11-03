"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Link2,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner, EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toaster";
import { connectAccountSchema, type ConnectAccountInput } from "@/lib/validators/schemas";
import { cn } from "@/lib/utils/helpers";

const PLATFORMS = [
  { value: "TWITTER", label: "Twitter / X", color: "#1DA1F2", icon: "𝕏" },
  { value: "INSTAGRAM", label: "Instagram", color: "#E1306C", icon: "IG" },
  { value: "LINKEDIN", label: "LinkedIn", color: "#0077B5", icon: "in" },
  { value: "FACEBOOK", label: "Facebook", color: "#4267B2", icon: "f" },
  { value: "TIKTOK", label: "TikTok", color: "#010101", icon: "TT" },
  { value: "YOUTUBE", label: "YouTube", color: "#FF0000", icon: "YT" },
  { value: "PINTEREST", label: "Pinterest", color: "#BD081C", icon: "P" },
  { value: "THREADS", label: "Threads", color: "#000000", icon: "@" },
  { value: "BLUESKY", label: "Bluesky", color: "#0085FF", icon: "🦋" },
  { value: "MASTODON", label: "Mastodon", color: "#6364FF", icon: "M" },
] as const;

function useWorkspace() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      const json = await res.json();
      return (json.data ?? [])[0] ?? null;
    },
  });
}

export default function AccountsPage() {
  const { data: workspace } = useWorkspace();
  const [showForm, setShowForm] = useState(false);
  const toast = useToast();
  const qc = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts", workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const res = await fetch(`/api/accounts?workspaceId=${workspace.id}`);
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!workspace?.id,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConnectAccountInput>({
    resolver: zodResolver(connectAccountSchema),
    defaultValues: { platform: "TWITTER" },
  });

  const selectedPlatform = watch("platform");

  const connectMutation = useMutation({
    mutationFn: async (data: ConnectAccountInput) => {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, workspaceId: workspace?.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to connect account");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account connected!", "Your social account is ready for publishing.");
      reset();
      setShowForm(false);
    },
    onError: (err: any) => {
      toast.error("Failed to connect account", err.message);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!workspace?.id) return;
      const res = await fetch(`/api/accounts?id=${id}&workspaceId=${workspace.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to disconnect");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account disconnected", "The channel has been removed from your workspace.");
    },
    onError: (err: any) => {
      toast.error("Disconnect failed", err.message);
    },
  });

  function onSubmit(data: ConnectAccountInput) {
    connectMutation.mutate(data);
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      <PageHeader
        title="Connected Accounts"
        description="Connect and manage your social channels for automated publishing"
        action={
          <Button onClick={() => setShowForm(!showForm)} size="md">
            <Plus className="w-4 h-4" />
            Connect Account
          </Button>
        }
      />

      {/* Integration Notice */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-900">Sandbox &amp; Development Publishing Active</p>
          <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
            Connected channels are running in sandbox verification mode. You can connect handles across all 10 supported platforms, schedule posts to them, test independent channel captions, and observe real background worker execution. For live OAuth production publishing, configure your platform client secrets in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code>.
          </p>
        </div>
      </div>

      {/* Connect Form */}
      {showForm && (
        <Card className="animate-fade-in border-blue-200 shadow-md">
          <h3 className="text-sm font-bold text-charcoal mb-3">Connect Social Channel</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Select Platform</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PLATFORMS.map((p) => (
                  <label key={p.value} className="cursor-pointer">
                    <input
                      type="radio"
                      value={p.value}
                      className="sr-only"
                      {...register("platform")}
                    />
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                        selectedPlatform === p.value
                          ? "border-blue-600 bg-blue-50 text-blue-800 shadow-xs ring-1 ring-blue-500/20"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      )}
                    >
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.icon}
                      </span>
                      <span className="truncate">{p.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="handle"
                label="Handle / Account Username"
                placeholder="@username (e.g. acme_design)"
                error={errors.handle?.message}
                {...register("handle")}
              />
              <Input
                id="displayName"
                label="Display Name (optional)"
                placeholder="e.g. Acme Studio"
                error={errors.displayName?.message}
                {...register("displayName")}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={isSubmitting} size="sm">
                Connect Account
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setShowForm(false); reset(); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Accounts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={<Link2 className="w-6 h-6" />}
          title="No accounts connected"
          description="Connect social media channels to start scheduling and queuing posts."
          action={
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="w-3.5 h-3.5" />
              Connect your first account
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc: any) => {
            const platform = PLATFORMS.find((p) => p.value === acc.platform);
            return (
              <div
                key={acc.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-xs"
                        style={{ backgroundColor: platform?.color ?? "#121212" }}
                      >
                        {platform?.icon ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">@{acc.handle}</p>
                        <p className="text-xs text-zinc-400 font-medium">{platform?.label ?? acc.platform}</p>
                      </div>
                    </div>
                    <Badge variant={acc.isConnected ? "success" : "error"} dot>
                      {acc.isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default" size="sm">
                      SANDBOX
                    </Badge>
                    <span className="text-[11px] text-zinc-400 truncate">
                      {acc.providerInfo?.description ?? "Ready for automated publishing"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 font-mono">
                    ID: {acc.id.slice(0, 8)}…
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to disconnect @${acc.handle}?`)) {
                        disconnectMutation.mutate(acc.id);
                      }
                    }}
                    disabled={disconnectMutation.isPending}
                    className="text-xs font-semibold text-zinc-400 hover:text-red-600 transition-colors flex items-center gap-1 p-1"
                    title="Disconnect account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
