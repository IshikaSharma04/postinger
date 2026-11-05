"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/States";
import { cn, formatDate } from "@/lib/utils/helpers";
import Link from "next/link";
import { CalendarDayCell, type CalendarPost } from "@/components/calendar/CalendarDayCell";
import { CalendarDayDetail } from "@/components/calendar/CalendarDayDetail";

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

function useCalendarPosts(workspaceId: string | null) {
  return useQuery<CalendarPost[]>({
    queryKey: ["posts", workspaceId, "calendar"],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/posts?workspaceId=${workspaceId}&limit=200`);
      const json = await res.json();
      return json.data?.posts ?? [];
    },
    enabled: !!workspaceId,
  });
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"MONTH" | "WEEK" | "LIST">("MONTH");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [tagFilter, setTagFilter] = useState("ALL");
  const [formatFilter, setFormatFilter] = useState("ALL");

  const { data: workspaceId } = useWorkspaceId();
  const { data: posts = [], isLoading } = useCalendarPosts(workspaceId ?? null);

  const monthStart = startOfMonth(currentDate);
  const monthDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }),
  });
  const weekCalStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekCalEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekCalStart, end: weekCalEnd });
  const activeDays = viewMode === "WEEK" ? weekDays : monthDays;

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      (p.tags ?? []).forEach((t) => set.add(t));
      (p.hashtags ?? []).forEach((h) => set.add(h));
    });
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() =>
    posts.filter((p) => {
      if (platformFilter !== "ALL" && !p.postAccounts.some((pa) => pa.socialAccount.platform === platformFilter)) return false;
      if (tagFilter !== "ALL" && !(p.tags ?? []).includes(tagFilter) && !(p.hashtags ?? []).includes(tagFilter)) return false;
      if (formatFilter !== "ALL" && (p.postFormat ?? "POST") !== formatFilter) return false;
      return true;
    }),
    [posts, platformFilter, tagFilter, formatFilter]
  );

  const postsByDate = useMemo(() => {
    const map: Record<string, CalendarPost[]> = {};
    for (const post of filteredPosts) {
      const key = format(new Date(post.scheduledAt ?? post.createdAt), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(post);
    }
    return map;
  }, [filteredPosts]);

  function handleNavigate(dir: "prev" | "next") {
    if (viewMode === "WEEK") {
      setCurrentDate((d) => new Date(d.getTime() + (dir === "prev" ? -1 : 1) * 7 * 86400000));
    } else {
      setCurrentDate((d) => dir === "prev" ? subMonths(d, 1) : addMonths(d, 1));
    }
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <PageHeader
        title="Content Calendar"
        description="Schedule, reschedule, and manage your publishing pipeline across all channels"
        action={
          <Link href="/compose" className="btn-brand-dark text-xs px-4 py-2 font-bold inline-flex items-center gap-1.5 shadow-md">
            <Plus className="w-3.5 h-3.5" /> New Post
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-bold">
            {(["MONTH", "WEEK", "LIST"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={cn("px-3 py-1.5 rounded-lg transition-all capitalize", viewMode === m ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800")}
              >
                {m.charAt(0) + m.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-zinc-200 mx-1 hidden sm:block" />
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg">
            <button onClick={() => handleNavigate("prev")} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-white transition-all" aria-label="Previous period">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-2.5 h-7 rounded-md text-xs font-bold text-gray-600 hover:bg-white transition-all">Today</button>
            <button onClick={() => handleNavigate("next")} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-white transition-all" aria-label="Next period">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-bold text-charcoal ml-2">
            {viewMode === "WEEK"
              ? `${format(weekCalStart, "MMM d")} – ${format(weekCalEnd, "MMM d, yyyy")}`
              : format(currentDate, "MMMM yyyy")}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          {[
            { value: platformFilter, onChange: setPlatformFilter, options: [["ALL","All Channels"],["TWITTER","Twitter / X"],["INSTAGRAM","Instagram"],["LINKEDIN","LinkedIn"],["TIKTOK","TikTok"],["FACEBOOK","Facebook"],["BLUESKY","Bluesky"]] },
            { value: formatFilter, onChange: setFormatFilter, options: [["ALL","All Formats"],["POST","Post"],["REEL","Reel"],["STORY","Story"],["CAROUSEL","Carousel"],["THREAD","Thread"]] },
          ].map((sel, i) => (
            <select key={i} value={sel.value} onChange={(e) => sel.onChange(e.target.value)} className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-blue-600">
              {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          {allTags.length > 0 && (
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-blue-600">
              <option value="ALL">All Tags</option>
              {allTags.map((t) => <option key={t} value={t}>#{t}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "LIST" ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 mb-3">All Scheduled &amp; Queued Posts ({filteredPosts.length})</h3>
          {filteredPosts.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">No posts match the current filters.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPosts.map((post) => (
                <div key={post.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={post.status} />
                      <span className="text-xs text-zinc-400 font-mono">{post.scheduledAt ? formatDate(post.scheduledAt) : "Draft"}</span>
                    </div>
                    <p className="text-xs text-zinc-800">{post.body}</p>
                  </div>
                  <Link href={`/compose?edit=${post.id}`} className="text-xs font-bold text-blue-600 hover:underline flex-shrink-0">Edit</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
          <div className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-7 border-b border-app bg-surface-subtle/50 text-center">
              {DAY_NAMES.map((d) => (
                <div key={d} className="py-2 text-[11px] font-bold text-secondary uppercase tracking-wider">{d}</div>
              ))}
            </div>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center"><Spinner /></div>
            ) : (
              <div className="grid grid-cols-7">
                {activeDays.map((date) => {
                  const key = format(date, "yyyy-MM-dd");
                  return (
                    <CalendarDayCell
                      key={date.toISOString()}
                      date={date}
                      isCurrentMonth={viewMode === "WEEK" ? true : isSameMonth(date, currentDate)}
                      posts={postsByDate[key] ?? []}
                      onClick={() => setSelectedDate(date)}
                      isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="xl:col-span-1">
            {selectedDate ? (
              <CalendarDayDetail
                date={selectedDate}
                posts={postsByDate[format(selectedDate, "yyyy-MM-dd")] ?? []}
                onClose={() => setSelectedDate(null)}
              />
            ) : (
              <div className="p-6 bg-white border border-app rounded-2xl text-center text-xs text-secondary shadow-xs">
                Select any day on the calendar to inspect scheduled posts, reschedule, or add new content.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
