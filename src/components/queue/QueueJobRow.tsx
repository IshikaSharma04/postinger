"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toaster";
import { formatDate } from "@/lib/utils/helpers";
import { QueueJobItem } from "./types";

const JOB_STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-3.5 h-3.5 text-gray-400" />,
  RUNNING: <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />,
  COMPLETED: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  FAILED: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  CANCELLED: <XCircle className="w-3.5 h-3.5 text-gray-400" />,
  RETRYING: <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />,
};

export function QueueJobRow({
  job,
  workspaceId,
}: {
  job: QueueJobItem;
  workspaceId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const toast = useToast();
  const qc = useQueryClient();

  const retryMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, workspaceId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Retry failed");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue"] });
      toast.success("Job re-queued for publishing");
    },
    onError: (err: Error) => {
      toast.error("Retry failed", err.message);
    },
  });

  const attempts = job.attempts ?? [];
  const post = job.post;
  const account = job.socialAccount;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all shadow-xs hover:border-gray-300">
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0">{JOB_STATUS_ICONS[job.status]}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-charcoal">
                {account?.platform ?? "Channel"} · @{account?.handle ?? "account"}
              </span>
              <StatusBadge status={job.status} />
              <span className="text-xs text-gray-400 font-mono">
                attempt {job.attemptCount}/{job.maxAttempts}
              </span>
            </div>
            {Boolean(post?.body) && (
              <p className="text-xs text-gray-500 truncate mt-0.5 max-w-md">
                {post?.body}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500">
              {job.scheduledFor ? formatDate(job.scheduledFor) : "Immediate"}
            </div>
          </div>
          {job.status === "FAILED" && (
            <Button
              size="sm"
              variant="secondary"
              loading={retryMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                retryMutation.mutate();
              }}
            >
              Retry
            </Button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block">Job ID</span>
              <span className="font-mono text-gray-600 truncate block">
                {job.id}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">BullMQ Job ID</span>
              <span className="font-mono text-gray-600">
                {job.bullJobId || "—"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Idempotency Key</span>
              <span className="font-mono text-gray-600 truncate block">
                {job.idempotencyKey || "—"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">External Post ID</span>
              <span className="font-mono text-gray-600">
                {job.externalPostId || "—"}
              </span>
            </div>
          </div>

          {Boolean(job.lastError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Error Diagnostics
              </div>
              <p className="text-xs font-mono text-red-600 whitespace-pre-wrap">
                {job.lastError}
              </p>
            </div>
          )}

          {attempts.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600 block mb-2">
                Attempt History ({attempts.length})
              </span>
              <div className="space-y-1.5">
                {attempts.map((att, i) => (
                  <div
                    key={att.id ?? i}
                    className="flex items-center justify-between text-xs bg-white border border-gray-200 rounded-md px-3 py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal">Attempt #{att.attemptNumber}</span>
                      <StatusBadge status={att.status} />
                      {Boolean(att.error) && (
                        <span className="text-red-500 font-mono truncate max-w-xs">
                          {att.error}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400">
                      {att.startedAt ? formatDate(att.startedAt) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
