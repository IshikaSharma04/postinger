"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Layers,
  Filter,
  Download,
  Printer,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { WeeklyTakeaways } from "@/components/history/WeeklyTakeaways";
import { HistoryMetricsTab, PLATFORM_META } from "@/components/history/HistoryMetricsTab";
import { HistoryLogsTab } from "@/components/history/HistoryLogsTab";
import { HistoryPostItem, TagMetric } from "@/components/history/types";

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

export default function AnalyticsHistoryPage() {
  const { data: workspace } = useWorkspace();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"METRICS" | "LOGS">("METRICS");

  const { data, isLoading } = useQuery<{ posts: HistoryPostItem[]; total: number }>({
    queryKey: ["posts", workspace?.id, "analytics", search, statusFilter],
    queryFn: async () => {
      if (!workspace?.id) return { posts: [], total: 0 };
      const params = new URLSearchParams({ workspaceId: workspace.id, limit: "100" });
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/posts?${params}`);
      const json = await res.json();
      return json.data ?? { posts: [], total: 0 };
    },
    enabled: !!workspace?.id,
  });

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;

  // Filter posts by selected channel if not ALL
  const filteredPosts = useMemo(() => {
    if (channelFilter === "ALL") return posts;
    return posts.filter((p) =>
      p.postAccounts?.some((pa) => pa.socialAccount?.platform === channelFilter)
    );
  }, [posts, channelFilter]);

  // Aggregate Metrics
  const published = filteredPosts.filter((p) => p.status === "PUBLISHED").length;
  const failed = filteredPosts.filter((p) => p.status === "FAILED").length;
  const scheduled = filteredPosts.filter((p) => p.status === "SCHEDULED").length;

  const successRate = published + failed > 0 ? Math.round((published / (published + failed)) * 100) : 100;

  // Platform Distribution
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {
      TWITTER: 0,
      LINKEDIN: 0,
      INSTAGRAM: 0,
      FACEBOOK: 0,
      TIKTOK: 0,
    };
    filteredPosts.forEach((p) => {
      p.postAccounts?.forEach((pa) => {
        const platform = pa.socialAccount?.platform;
        if (platform && counts[platform] !== undefined) {
          counts[platform]++;
        }
      });
    });
    return counts;
  }, [filteredPosts]);

  const totalPlatformPosts = Object.values(platformCounts).reduce((a, b) => a + b, 0) || 1;

  // Average caption length & hashtag stats
  const avgLength = useMemo(() => {
    if (filteredPosts.length === 0) return 0;
    const sum = filteredPosts.reduce((acc, p) => acc + (p.body?.length ?? 0), 0);
    return Math.round(sum / filteredPosts.length);
  }, [filteredPosts]);

  const totalHashtags = useMemo(() => {
    return filteredPosts.reduce((acc, p) => acc + (p.hashtags?.length ?? 0), 0);
  }, [filteredPosts]);

  // Extract tag performance
  const tagBreakdown: TagMetric[] = useMemo(() => {
    const map: Record<string, { count: number; published: number }> = {};
    filteredPosts.forEach((p) => {
      (p.tags ?? []).forEach((t: string) => {
        if (!map[t]) map[t] = { count: 0, published: 0 };
        map[t].count++;
        if (p.status === "PUBLISHED") map[t].published++;
      });
    });
    return Object.entries(map).map(([tag, stat]) => ({
      tag,
      count: stat.count,
      published: stat.published,
      rate: Math.round((stat.published / stat.count) * 100),
    }));
  }, [filteredPosts]);

  const bestPost = filteredPosts.find((p) => p.status === "PUBLISHED") || filteredPosts[0];

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Header with Export Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app">Analytics &amp; Intelligence</h1>
          <p className="text-sm text-secondary mt-0.5">
            Cross-platform publishing metrics, weekly takeaways, and performance benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export CSV */}
          <a
            href={`/api/analytics/export?workspaceId=${workspace?.id}&format=csv`}
            download
            className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            Export CSV
          </a>

          {/* Export PDF */}
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-500" />
            Export PDF
          </button>

          {/* Tab switch */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("METRICS")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === "METRICS" ? "bg-white text-zinc-900 shadow-xs font-bold" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("LOGS")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === "LOGS" ? "bg-white text-zinc-900 shadow-xs font-bold" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              Logs ({total})
            </button>
          </div>
        </div>
      </div>

      {/* ── Channel Filter Drill-Down ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white border border-zinc-200 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-700">Filter Destination:</span>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1 text-xs font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Connected Channels</option>
            {Object.entries(PLATFORM_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span>{filteredPosts.length} posts loaded</span>
        </div>
      </div>

      {/* ── Weekly Takeaways ── */}
      <WeeklyTakeaways bestPost={bestPost} scheduledCount={scheduled} />

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Published Content", value: published, def: "Total lifetime posts dispatched and verified across social networks", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Queue Success Rate", value: `${successRate}%`, def: "Ratio of successful publications without API delivery retry errors", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Queue", value: scheduled, def: "Posts awaiting future scheduled time in your weekly posting slots", icon: Clock, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Total Lifetime Posts", value: total, def: "All draft, scheduled, and published content items in workspace", icon: Layers, color: "text-zinc-700", bg: "bg-zinc-100" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1" title={stat.def}>
                  {stat.label}
                  <Info className="w-3 h-3 text-zinc-300 hover:text-zinc-600 cursor-help" />
                </span>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center border border-zinc-100", stat.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", stat.color)} />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight text-zinc-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {activeTab === "METRICS" ? (
        <HistoryMetricsTab
          platformCounts={platformCounts}
          totalPlatformPosts={totalPlatformPosts}
          tagBreakdown={tagBreakdown}
          avgLength={avgLength}
          totalHashtags={totalHashtags}
        />
      ) : (
        <HistoryLogsTab
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          isLoading={isLoading}
          posts={filteredPosts}
        />
      )}
    </div>
  );
}
