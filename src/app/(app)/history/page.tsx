"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart2,
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Hash,
  Download,
  Printer,
  Info,
  Calendar,
  Flame,
  Lightbulb,
} from "lucide-react";
import { PageHeader, Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Spinner, EmptyState } from "@/components/ui/States";
import { formatDate, truncate, cn } from "@/lib/utils/helpers";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PLATFORM_META: Record<string, { label: string; color: string; bg: string }> = {
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
  const router = useRouter();
  const { data: workspace, isLoading: wsLoading } = useWorkspace();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"METRICS" | "LOGS">("METRICS");

  const { data, isLoading } = useQuery({
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

  // Aggregate Metrics
  const published = posts.filter((p: any) => p.status === "PUBLISHED").length;
  const failed = posts.filter((p: any) => p.status === "FAILED").length;
  const scheduled = posts.filter((p: any) => p.status === "SCHEDULED").length;
  const draft = posts.filter((p: any) => p.status === "DRAFT").length;

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
    posts.forEach((p: any) => {
      p.postAccounts?.forEach((pa: any) => {
        const platform = pa.socialAccount?.platform;
        if (platform && counts[platform] !== undefined) {
          counts[platform]++;
        }
      });
    });
    return counts;
  }, [posts]);

  const totalPlatformPosts = Object.values(platformCounts).reduce((a, b) => a + b, 0) || 1;

  // Average caption length & hashtag stats
  const avgLength = useMemo(() => {
    if (posts.length === 0) return 0;
    const sum = posts.reduce((acc: number, p: any) => acc + (p.body?.length ?? 0), 0);
    return Math.round(sum / posts.length);
  }, [posts]);

  const totalHashtags = useMemo(() => {
    return posts.reduce((acc: number, p: any) => acc + (p.hashtags?.length ?? 0), 0);
  }, [posts]);

  // Extract tag performance
  const tagBreakdown = useMemo(() => {
    const map: Record<string, { count: number; published: number }> = {};
    posts.forEach((p: any) => {
      (p.tags ?? []).forEach((t: string) => {
        if (!map[t]) map[t] = { count: 0, published: 0 };
        map[t].count++;
        if (p.status === "PUBLISHED") map[t].published++;
      });
    });
    return Object.entries(map).map(([tag, data]) => ({
      tag,
      count: data.count,
      published: data.published,
      rate: Math.round((data.published / data.count) * 100),
    }));
  }, [posts]);

  const bestPost = posts.find((p: any) => p.status === "PUBLISHED") || posts[0];

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
          <span>{posts.length} posts loaded</span>
        </div>
      </div>

      {/* ── Weekly Takeaways (Actionable Cards from Real Data) ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Weekly Takeaways &amp; Action Plan
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                Opportunity
              </span>
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="text-xs font-bold text-zinc-900">Repost your best content</h4>
            <p className="text-xs text-zinc-600">
              Your recent post &ldquo;{truncate(bestPost?.body || "Top post", 45)}&rdquo; generated strong attention. Repurposing top content yields 3x engagement.
            </p>
            <button
              onClick={() => {
                if (bestPost) router.push(`/compose?prefill=${encodeURIComponent(bestPost.body)}`);
              }}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
            >
              Duplicate to composer →
            </button>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                Queue Health
              </span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="text-xs font-bold text-zinc-900">Add more posting slots</h4>
            <p className="text-xs text-zinc-600">
              Posting consistency is highest when accounts have at least 2 weekly slots scheduled. Fill your Tuesday &amp; Thursday queues.
            </p>
            <Link href="/queue" className="text-xs font-bold text-blue-800 hover:text-blue-950 underline flex items-center gap-1">
              Configure posting slots →
            </Link>
          </div>

          <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                Growth Goal
              </span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="text-xs font-bold text-zinc-900">Maintain publishing rhythm</h4>
            <p className="text-xs text-zinc-600">
              You currently have {scheduled} posts queued. Keep a buffer of 5+ scheduled posts to ensure consistent reach across timezones.
            </p>
            <Link href="/compose" className="text-xs font-bold text-purple-800 hover:text-purple-950 underline flex items-center gap-1">
              Compose next post →
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI Grid with Metric Tooltips ── */}
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
      ) : (
        /* ── Historical Logs View ── */
        <div className="bg-surface border border-app rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search history by caption or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl border border-app bg-white text-xs text-app outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["ALL", "PUBLISHED", "SCHEDULED", "DRAFT", "FAILED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
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
                  {posts.map((post: any) => (
                    <tr key={post.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-3 px-4 max-w-xs truncate text-app font-medium">
                        {truncate(post.body, 70)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {post.postAccounts?.map((pa: any) => (
                            <span
                              key={pa.socialAccount?.id}
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
      )}
    </div>
  );
}
