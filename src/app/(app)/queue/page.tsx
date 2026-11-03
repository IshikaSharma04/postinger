"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader, Card } from "@/components/ui/Card";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Spinner, EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toaster";
import { formatDate, cn } from "@/lib/utils/helpers";

function useWorkspaceId() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      const json = await res.json();
      return (json.data ?? [])[0]?.id ?? null;
    },
  });
}

const JOB_STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-3.5 h-3.5 text-gray-400" />,
  RUNNING: <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />,
  COMPLETED: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  FAILED: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  CANCELLED: <XCircle className="w-3.5 h-3.5 text-gray-400" />,
  RETRYING: <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />,
};

function JobRow({ job, workspaceId }: { job: Record<string, unknown>; workspaceId: string }) {
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

  const attempts = (job.attempts as Array<Record<string, unknown>>) ?? [];
  const post = job.post as Record<string, unknown> | undefined;
  const account = job.socialAccount as Record<string, unknown> | undefined;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all shadow-xs hover:border-gray-300">
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0">{JOB_STATUS_ICONS[job.status as string]}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-charcoal">
                {account?.platform as string} · @{account?.handle as string}
              </span>
              <StatusBadge status={job.status as any} />
              <span className="text-xs text-gray-400 font-mono">
                attempt {job.attemptCount as number}/{job.maxAttempts as number}
              </span>
            </div>
            {Boolean(post?.body) && (
              <p className="text-xs text-gray-500 truncate mt-0.5 max-w-md">
                {String(post?.body)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500">
              {job.scheduledFor ? formatDate(job.scheduledFor as string) : "Immediate"}
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
                {job.id as string}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">BullMQ Job ID</span>
              <span className="font-mono text-gray-600">
                {(job.bullJobId as string) || "—"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Idempotency Key</span>
              <span className="font-mono text-gray-600 truncate block">
                {(job.idempotencyKey as string) || "—"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">External Post ID</span>
              <span className="font-mono text-gray-600">
                {(job.externalPostId as string) || "—"}
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
                {String(job.lastError)}
              </p>
            </div>
          )}

          {attempts.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600 block mb-2">
                Attempt History ({attempts.length})
              </span>
              <div className="space-y-1.5">
                {attempts.map((att: Record<string, unknown>, i: number) => (
                  <div
                    key={(att.id as string) ?? i}
                    className="flex items-center justify-between text-xs bg-white border border-gray-200 rounded-md px-3 py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal">Attempt #{att.attemptNumber as number}</span>
                      <StatusBadge status={att.status as any} />
                      {Boolean(att.error) && (
                        <span className="text-red-500 font-mono truncate max-w-xs">
                          {String(att.error)}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400">
                      {att.startedAt ? formatDate(att.startedAt as string) : "—"}
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

// ── Buffer Posting Schedule Component ─────────────────────────────────────────

interface ScheduleSlot {
  id: string;
  dayOfWeek: number;
  time: string;
  isActive: boolean;
}

const WEEKDAYS = [
  { name: "Sunday", dayOfWeek: 0 },
  { name: "Monday", dayOfWeek: 1 },
  { name: "Tuesday", dayOfWeek: 2 },
  { name: "Wednesday", dayOfWeek: 3 },
  { name: "Thursday", dayOfWeek: 4 },
  { name: "Friday", dayOfWeek: 5 },
  { name: "Saturday", dayOfWeek: 6 },
];

function formatSlotTime(timeStr: string) {
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${mStr} ${ampm}`;
}

function BufferPostingScheduleView({ workspaceId }: { workspaceId: string | null }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [newDayOfWeek, setNewDayOfWeek] = useState<number>(1);
  const [newTime, setNewTime] = useState("09:00");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["queue-slots", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/queue/slots?workspaceId=${workspaceId}`);
      const json = await res.json();
      return (json.data?.slots ?? []) as ScheduleSlot[];
    },
    enabled: !!workspaceId,
  });

  const addSlotMutation = useMutation({
    mutationFn: async (payload: { dayOfWeek: number; time: string }) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await fetch("/api/queue/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          dayOfWeek: payload.dayOfWeek,
          time: payload.time,
          timezone: "UTC",
          isActive: true,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to add slot");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue-slots"] });
      setShowAddModal(false);
      toast.success("New posting slot added to schedule!");
    },
    onError: (err: Error) => {
      toast.error("Could not add slot", err.message);
    },
  });

  const toggleSlotMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (!workspaceId) return;
      const res = await fetch(`/api/queue/slots?id=${id}&workspaceId=${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to toggle slot");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue-slots"] });
    },
    onError: (err: Error) => {
      toast.error("Toggle failed", err.message);
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!workspaceId) return;
      const res = await fetch(`/api/queue/slots?id=${id}&workspaceId=${workspaceId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete slot");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue-slots"] });
      toast.success("Schedule slot removed");
    },
    onError: (err: Error) => {
      toast.error("Delete failed", err.message);
    },
  });

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    addSlotMutation.mutate({ dayOfWeek: Number(newDayOfWeek), time: newTime });
  };

  return (
    <div className="space-y-6">
      {/* Banner / Info Card */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Postinger Automated Posting Schedule
            </span>
          </div>
          <h3 className="text-base font-bold text-zinc-900 mt-1">
            Automate your queue dispatch times
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Posts added to your queue without a specific date will automatically occupy the next available slot.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Posting Time
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-zinc-400">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        /* Weekday Grid */
        <div className="space-y-4">
          {WEEKDAYS.map((w) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === w.dayOfWeek);
            return (
              <div
                key={w.dayOfWeek}
                className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900">{w.name}</span>
                    <span className="text-xs text-zinc-400">
                      ({daySlots.length} {daySlots.length === 1 ? "slot" : "slots"})
                    </span>
                  </div>
                  {w.name === "Wednesday" && (
                    <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      🔥 Peak Engagement Day
                    </span>
                  )}
                </div>

                {daySlots.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic py-2">
                    No posting times set for {w.name}.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          slot.isActive
                            ? "bg-blue-50/60 border-blue-200 text-blue-800"
                            : "bg-zinc-50 border-zinc-200 text-zinc-400 line-through"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{formatSlotTime(slot.time)}</span>
                        <button
                          type="button"
                          onClick={() => toggleSlotMutation.mutate({ id: slot.id, isActive: !slot.isActive })}
                          className="text-[10px] text-zinc-400 hover:text-blue-600 ml-1"
                          title={slot.isActive ? "Pause slot" : "Activate slot"}
                        >
                          {slot.isActive ? "Pause" : "Resume"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSlotMutation.mutate(slot.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity ml-1"
                          title="Delete slot"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-base text-zinc-900 mb-1">
              Add New Posting Time Slot
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Select the day and time when you want queued posts to automatically publish.
            </p>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                  Weekday
                </label>
                <select
                  value={newDayOfWeek}
                  onChange={(e) => setNewDayOfWeek(Number(e.target.value))}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {WEEKDAYS.map((w) => (
                    <option key={w.dayOfWeek} value={w.dayOfWeek}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                  Publish Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Main Queue Page ───────────────────────────────────────────────────────────

export default function QueuePage() {
  const { data: workspaceId } = useWorkspaceId();
  const [activeTab, setActiveTab] = useState<"JOBS" | "SCHEDULE">("JOBS");
  const [statusFilter, setStatusFilter] = useState("");
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["queue", workspaceId, statusFilter],
    queryFn: async () => {
      if (!workspaceId) return { jobs: [], total: 0 };
      const params = new URLSearchParams({ workspaceId });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/queue?${params}`);
      const json = await res.json();
      return json.data ?? { jobs: [], total: 0 };
    },
    enabled: !!workspaceId,
    refetchInterval: 10000, // Poll every 10s for live updates
  });

  const statuses = ["", "PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED", "RETRYING"];

  return (
    <div className="animate-fade-in max-w-5xl">
      <PageHeader
        title="Publishing Queue"
        description="Monitor automated dispatches, inspect job attempts, and configure Buffer-style schedule slots"
        action={
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        }
      />

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-3">
        <button
          onClick={() => setActiveTab("JOBS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "JOBS"
              ? "bg-zinc-900 text-white shadow-xs"
              : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Live Publishing Jobs
          {(data?.jobs ?? []).length > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {(data?.jobs ?? []).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("SCHEDULE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "SCHEDULE"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Posting Schedule Slots (Buffer Style)
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-1">
            New
          </span>
        </button>
      </div>

      {activeTab === "SCHEDULE" ? (
        <BufferPostingScheduleView workspaceId={workspaceId} />
      ) : (
        <>
          {/* Status filter */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                  statusFilter === s
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {s || "All Jobs"}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : (data?.jobs ?? []).length === 0 ? (
            <EmptyState
              icon={<Clock className="w-6 h-6" />}
              title="No publishing jobs"
              description={statusFilter ? `No ${statusFilter.toLowerCase()} jobs found.` : "Schedule some posts to see jobs here."}
            />
          ) : (
            <div className="space-y-3">
              {(data?.jobs ?? []).map((job: Record<string, unknown>) => (
                <JobRow key={job.id as string} job={job} workspaceId={workspaceId ?? ""} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
