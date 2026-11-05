"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Card";
import { Spinner, EmptyState } from "@/components/ui/States";
import { cn } from "@/lib/utils/helpers";
import { QueueJobRow } from "@/components/queue/QueueJobRow";
import { QueueScheduleView } from "@/components/queue/QueueScheduleView";
import { QueueJobItem } from "@/components/queue/types";

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

const STATUSES = ["", "PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED", "RETRYING"];

export default function QueuePage() {
  const { data: workspaceId } = useWorkspaceId();
  const [activeTab, setActiveTab] = useState<"JOBS" | "SCHEDULE">("JOBS");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, refetch } = useQuery<{ jobs: QueueJobItem[]; total: number }>({
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

  const jobs = data?.jobs ?? [];

  return (
    <div className="animate-fade-in max-w-5xl">
      <PageHeader
        title="Publishing Queue"
        description="Monitor automated dispatches, inspect job attempts, and configure regular schedule slots"
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
          {jobs.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {jobs.length}
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
          Posting Schedule Slots (Slots)
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-1">
            New
          </span>
        </button>
      </div>

      {activeTab === "SCHEDULE" ? (
        <QueueScheduleView workspaceId={workspaceId ?? null} />
      ) : (
        <>
          {/* Status filter */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {STATUSES.map((s) => (
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
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-6 h-6" />}
              title="No publishing jobs"
              description={statusFilter ? `No ${statusFilter.toLowerCase()} jobs found.` : "Schedule some posts to see jobs here."}
            />
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <QueueJobRow key={job.id} job={job} workspaceId={workspaceId ?? ""} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
