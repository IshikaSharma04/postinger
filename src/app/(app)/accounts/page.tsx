"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Link2,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Card";
import { Spinner, EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toaster";
import { type ConnectAccountInput } from "@/lib/validators/schemas";
import { SocialAccountCard } from "@/components/channels/SocialAccountCard";
import { ConnectAccountForm } from "@/components/channels/ConnectAccountForm";
import { SocialAccountItem } from "@/components/channels/types";

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

  const { data: accounts = [], isLoading } = useQuery<SocialAccountItem[]>({
    queryKey: ["accounts", workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const res = await fetch(`/api/accounts?workspaceId=${workspace.id}`);
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!workspace?.id,
  });

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
      setShowForm(false);
    },
    onError: (err: Error) => {
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
    onError: (err: Error) => {
      toast.error("Disconnect failed", err.message);
    },
  });

  const handleDisconnect = (id: string, handle: string) => {
    if (confirm(`Are you sure you want to disconnect @${handle}?`)) {
      disconnectMutation.mutate(id);
    }
  };

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
        <ConnectAccountForm
          onSubmit={(data) => connectMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isSubmitting={connectMutation.isPending}
        />
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
          {accounts.map((acc) => (
            <SocialAccountCard
              key={acc.id}
              acc={acc}
              onDisconnect={handleDisconnect}
              isDisconnecting={disconnectMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
