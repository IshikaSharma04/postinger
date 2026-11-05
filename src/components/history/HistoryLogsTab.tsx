"use client";

import { Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/States";
import { formatDate, truncate, cn } from "@/lib/utils/helpers";
import { HistoryPostItem } from "./types";

interface HistoryLogsTabProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  isLoading: boolean;
  posts: HistoryPostItem[];
}

const STATUS_FILTERS = ["ALL", "PUBLISHED", "SCHEDULED", "DRAFT", "FAILED"];

export function HistoryLogsTab({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isLoading,
  posts,
}: HistoryLogsTabProps) {
  return (
    <div className="bg-surface border border-app rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search history by caption or keywords..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-app bg-white text-xs text-app outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => onStatusFilterChange(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                statusFilter === s
                  ? "bg-[#0d0d0e] text-white shadow-xs"
                  : "border border-app bg-white text-secondary hover:text-app"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <Spinner className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-secondary">Loading history...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xs text-secondary">No matching posts found in historical logs.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfcfb] border-b border-app text-[11px] font-semibold text-secondary uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Post Excerpt</th>
                <th className="py-3 px-4">Destinations</th>
                <th className="py-3 px-4">Scheduled / Published</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="py-3 px-4 max-w-xs truncate text-app font-medium">
                    {truncate(post.body, 70)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {post.postAccounts?.map((pa) => (
                        <span
                          key={pa.socialAccount?.id ?? pa.id}
                          className="px-2 py-0.5 rounded text-[10px] bg-surface-subtle border border-app font-medium text-secondary"
                        >
                          @{pa.socialAccount?.handle}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-secondary">
                    {post.publishedAt
                      ? formatDate(post.publishedAt, "MMM d, h:mm a")
                      : post.scheduledAt
                      ? formatDate(post.scheduledAt, "MMM d, h:mm a")
                      : "Draft"}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={post.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
