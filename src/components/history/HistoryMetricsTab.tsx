"use client";

import Link from "next/link";
import { Sparkles, Hash, ShieldCheck, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { TagMetric } from "./types";

export const PLATFORM_META: Record<string, { label: string; color: string; bg: string }> = {
  TWITTER: { label: "Twitter / X", color: "#1da1f2", bg: "bg-[#1da1f2]" },
  LINKEDIN: { label: "LinkedIn", color: "#0077b5", bg: "bg-[#0077b5]" },
  INSTAGRAM: { label: "Instagram", color: "#e1306c", bg: "bg-[#e1306c]" },
  FACEBOOK: { label: "Facebook", color: "#1877f2", bg: "bg-[#1877f2]" },
  TIKTOK: { label: "TikTok", color: "#111111", bg: "bg-[#111111]" },
  THREADS: { label: "Threads", color: "#000000", bg: "bg-[#000000]" },
  BLUESKY: { label: "Bluesky", color: "#0085ff", bg: "bg-[#0085ff]" },
  MASTODON: { label: "Mastodon", color: "#6364ff", bg: "bg-[#6364ff]" },
  GOOGLE_BUSINESS: { label: "Google Business", color: "#4285f4", bg: "bg-[#4285f4]" },
};

interface HistoryMetricsTabProps {
  platformCounts: Record<string, number>;
  totalPlatformPosts: number;
  tagBreakdown: TagMetric[];
  avgLength: number;
  totalHashtags: number;
}

export function HistoryMetricsTab({
  platformCounts,
  totalPlatformPosts,
  tagBreakdown,
  avgLength,
  totalHashtags,
}: HistoryMetricsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: Platform Distribution Breakdown */}
      <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Channel Distribution</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Posts published and queued by destination network</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
            {totalPlatformPosts} Dispatches
          </span>
        </div>

        <div className="space-y-4">
          {Object.entries(PLATFORM_META).map(([key, meta]) => {
            const count = platformCounts[key] ?? 0;
            const percentage = Math.round((count / totalPlatformPosts) * 100);
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800">{meta.label}</span>
                  <span className="text-zinc-500 font-mono">
                    {count} posts ({percentage}%)
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", meta.bg)}
                    style={{ width: `${Math.max(percentage, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tag Performance Breakdown Table */}
        {tagBreakdown.length > 0 && (
          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tag Performance</h4>
            <div className="divide-y divide-zinc-100">
              {tagBreakdown.map((tb) => (
                <div key={tb.tag} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-600">#{tb.tag}</span>
                  <div className="flex items-center gap-3 text-zinc-500">
                    <span>{tb.count} posts</span>
                    <span className="font-bold text-zinc-800">{tb.rate}% published</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Copywriting Telemetry */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 pb-3 border-b border-zinc-100">
            Copywriting Telemetry
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-zinc-700">Avg. Caption Length</span>
              </div>
              <span className="text-xs font-bold text-zinc-900 font-mono">{avgLength} chars</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-zinc-700">Total Hashtags Tagged</span>
              </div>
              <span className="text-xs font-bold text-zinc-900 font-mono">{totalHashtags} tags</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-zinc-700">Idempotency Status</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 font-mono">Active (BullMQ)</span>
            </div>
          </div>
        </div>

        {/* Quick action card */}
        <div className="bg-gradient-to-br from-[#10121a] to-[#0c0d12] border border-blue-500/20 rounded-2xl p-5 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Content Hub</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-400" />
          </div>
          <h4 className="text-base font-bold">Manage Your Posts</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Filter, reschedule, or edit your complete content pipeline directly from the library.
          </p>
          <Link href="/posts">
            <button className="mt-1 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-xs">
              Open Content Library →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
