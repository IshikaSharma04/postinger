"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Edit2,
  Trash2,
  Filter,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/States";
import { cn, truncate, formatDate } from "@/lib/utils/helpers";
import { useToast } from "@/components/ui/Toaster";
import Link from "next/link";

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

function usePosts(workspaceId: string | null) {
  return useQuery({
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

// ── Day Cell ─────────────────────────────────────────────────────────────────

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  posts: Record<string, unknown>[];
  onClick: () => void;
  isSelected: boolean;
}

function DayCell({ date, isCurrentMonth, posts, onClick, isSelected }: DayCellProps) {
  const today = isToday(date);
  return (
    <div
      className={cn(
        "min-h-[105px] p-2 border-b border-r border-app cursor-pointer hover:bg-surface-subtle/80 transition-colors",
        !isCurrentMonth && "opacity-35 bg-surface-subtle/30",
        isSelected && "bg-blue-50/50 ring-inset ring-2 ring-blue-500/40"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={cn(
            "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors",
            today ? "bg-blue-600 text-white shadow-xs" : "text-secondary"
          )}
        >
          {format(date, "d")}
        </span>
        {posts.length > 0 && (
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
            {posts.length}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {posts.slice(0, 3).map((post: Record<string, unknown>) => (
          <div
            key={post.id as string}
            className={cn(
              "text-[10px] rounded-md px-1.5 py-0.5 truncate font-medium border transition-colors",
              (post.status as string) === "PUBLISHED" && "bg-emerald-50 text-emerald-700 border-emerald-200",
              (post.status as string) === "SCHEDULED" && "bg-blue-50 text-blue-700 border-blue-200",
              (post.status as string) === "FAILED" && "bg-red-50 text-red-700 border-red-200",
              (post.status as string) === "DRAFT" && "bg-zinc-100 text-zinc-600 border-zinc-200",
              (post.status as string) === "NEEDS_APPROVAL" && "bg-purple-50 text-purple-700 border-purple-200",
              (post.status as string) === "PROCESSING" && "bg-amber-50 text-amber-700 border-amber-200"
            )}
          >
            {truncate(post.body as string, 28)}
          </div>
        ))}
        {posts.length > 3 && (
          <p className="text-[10px] text-tertiary pl-1 font-semibold">+{posts.length - 3} more</p>
        )}
      </div>
    </div>
  );
}

// ── Day Detail Panel ──────────────────────────────────────────────────────────

function DayDetail({
  date,
  posts,
  onClose,
}: {
  date: Date;
  posts: Record<string, unknown>[];
  onClose: () => void;
}) {
  const toast = useToast();
  const qc = useQueryClient();
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, scheduledAt }: { id: string; scheduledAt: string }) => {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SCHEDULE",
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Reschedule failed");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post rescheduled successfully!");
      setReschedulingId(null);
    },
    onError: (err: any) => {
      toast.error("Reschedule failed", err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Delete failed");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post removed from calendar");
    },
    onError: (err: any) => {
      toast.error("Delete failed", err.message);
    },
  });

  return (
    <div className="bg-surface border border-app rounded-2xl p-5 shadow-sm animate-fade-in space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-app">
        <div>
          <h3 className="text-sm font-bold text-app">
            {format(date, "MMMM d, yyyy")}
          </h3>
          <span className="text-[11px] text-secondary">
            {posts.length} item{posts.length === 1 ? "" : "s"} scheduled
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-secondary hover:text-app text-xs font-semibold px-2 py-1 rounded-lg hover:bg-surface-subtle transition-colors"
        >
          Close
        </button>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/compose?date=${format(date, "yyyy-MM-dd")}`}
          className="w-full text-center py-2 px-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Schedule post on this day
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-secondary">No posts scheduled for this day yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <div
              key={post.id}
              className="border border-gray-200 rounded-xl p-3 bg-white hover:border-gray-300 transition-all shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <StatusBadge status={post.status} />
                <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.scheduledAt
                    ? format(new Date(post.scheduledAt), "h:mm a")
                    : "Draft"}
                </span>
              </div>

              <p className="text-xs text-charcoal leading-relaxed line-clamp-3 font-normal">
                {post.body}
              </p>

              {/* Connected accounts */}
              {post.postAccounts?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.postAccounts.map((pa: any) => (
                    <span
                      key={pa.socialAccount?.id ?? Math.random()}
                      className="text-[10px] text-zinc-600 bg-zinc-100 rounded-md px-1.5 py-0.5 font-medium"
                    >
                      @{pa.socialAccount?.handle}
                    </span>
                  ))}
                </div>
              )}

              {/* Reschedule inline date picker */}
              {reschedulingId === post.id && (
                <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2 mt-2">
                  <label className="text-[10px] font-bold text-blue-900 block">
                    Choose new date &amp; time:
                  </label>
                  <input
                    type="datetime-local"
                    value={newTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-lg border border-blue-200 bg-white"
                  />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => setReschedulingId(null)}
                      className="text-[11px] text-zinc-500 hover:text-zinc-800 font-medium px-2 py-0.5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newTime) return;
                        rescheduleMutation.mutate({ id: post.id, scheduledAt: newTime });
                      }}
                      className="text-[11px] bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                <Link
                  href={`/compose?edit=${post.id}`}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </Link>

                <div className="flex items-center gap-2">
                  {post.status !== "PUBLISHED" && (
                    <button
                      onClick={() => {
                        setReschedulingId(post.id);
                        setNewTime(
                          post.scheduledAt
                            ? new Date(post.scheduledAt).toISOString().slice(0, 16)
                            : new Date(date).toISOString().slice(0, 16)
                        );
                      }}
                      className="text-zinc-500 hover:text-zinc-800 font-medium text-[11px]"
                    >
                      Reschedule
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this post?")) {
                        deleteMutation.mutate(post.id);
                      }
                    }}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                    title="Delete post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Calendar Page ─────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"MONTH" | "WEEK" | "LIST">("MONTH");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [tagFilter, setTagFilter] = useState<string>("ALL");
  const [formatFilter, setFormatFilter] = useState<string>("ALL");
  const { data: workspaceId } = useWorkspaceId();
  const { data: posts = [], isLoading } = usePosts(workspaceId);

  // Month interval
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthCalStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const monthCalEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: monthCalStart, end: monthCalEnd });

  // Week interval
  const weekCalStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekCalEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekCalStart, end: weekCalEnd });

  const activeDays = viewMode === "WEEK" ? weekDays : monthDays;

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p: any) => {
      (p.tags ?? []).forEach((t: string) => set.add(t));
      (p.hashtags ?? []).forEach((h: string) => set.add(h));
    });
    return Array.from(set);
  }, [posts]);

  // Filter posts by platform, tag, format
  const filteredPosts = useMemo(() => {
    return posts.filter((p: any) => {
      if (platformFilter !== "ALL") {
        const matchesPlatform = p.postAccounts?.some(
          (pa: any) => pa.socialAccount?.platform === platformFilter
        );
        if (!matchesPlatform) return false;
      }
      if (tagFilter !== "ALL") {
        const matchesTag =
          (p.tags ?? []).includes(tagFilter) || (p.hashtags ?? []).includes(tagFilter);
        if (!matchesTag) return false;
      }
      if (formatFilter !== "ALL") {
        if ((p.postFormat ?? "POST") !== formatFilter) return false;
      }
      return true;
    });
  }, [posts, platformFilter, tagFilter, formatFilter]);

  // Group posts by date
  const postsByDate = useMemo(() => {
    const map: Record<string, Record<string, unknown>[]> = {};
    for (const post of filteredPosts) {
      const dateKey = format(
        new Date((post as Record<string, unknown>).scheduledAt as string ?? (post as Record<string, unknown>).createdAt as string),
        "yyyy-MM-dd"
      );
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(post as Record<string, unknown>);
    }
    return map;
  }, [filteredPosts]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function handleNavigate(direction: "prev" | "next") {
    if (viewMode === "WEEK") {
      setCurrentDate((d) => (direction === "prev" ? new Date(d.getTime() - 7 * 86400000) : new Date(d.getTime() + 7 * 86400000)));
    } else {
      setCurrentDate((d) => (direction === "prev" ? subMonths(d, 1) : addMonths(d, 1)));
    }
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <PageHeader
        title="Content Calendar"
        description="Schedule, reschedule, and manage your publishing pipeline across all channels with week, month, and list views"
        action={
          <Link
            href="/compose"
            className="btn-buffer-dark text-xs px-4 py-2 font-bold inline-flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            New Post
          </Link>
        }
      />

      {/* Filter and View Mode Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode("MONTH")}
              className={cn("px-3 py-1.5 rounded-lg transition-all", viewMode === "MONTH" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800")}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("WEEK")}
              className={cn("px-3 py-1.5 rounded-lg transition-all", viewMode === "WEEK" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800")}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={cn("px-3 py-1.5 rounded-lg transition-all", viewMode === "LIST" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800")}
            >
              List
            </button>
          </div>

          <div className="h-5 w-px bg-zinc-200 mx-1 hidden sm:block" />

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg">
            <button
              onClick={() => handleNavigate("prev")}
              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-black hover:bg-white transition-all"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2.5 h-7 rounded-md text-xs font-bold text-gray-600 hover:text-black hover:bg-white transition-all"
            >
              Today
            </button>
            <button
              onClick={() => handleNavigate("next")}
              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-black hover:bg-white transition-all"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-bold text-charcoal ml-2">
            {viewMode === "WEEK"
              ? `${format(weekCalStart, "MMM d")} – ${format(weekCalEnd, "MMM d, yyyy")}`
              : format(currentDate, "MMMM yyyy")}
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Channels</option>
            <option value="TWITTER">Twitter / X</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="TIKTOK">TikTok</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="THREADS">Threads</option>
            <option value="BLUESKY">Bluesky</option>
            <option value="MASTODON">Mastodon</option>
            <option value="GOOGLE_BUSINESS">Google Business</option>
            <option value="SUBSTACK_NOTES">Substack Notes</option>
          </select>

          {/* Post Format Filter */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Formats</option>
            <option value="POST">Post</option>
            <option value="REEL">Reel</option>
            <option value="STORY">Story</option>
            <option value="CAROUSEL">Carousel</option>
            <option value="THREAD">Thread</option>
            <option value="SHORTS">Shorts</option>
            <option value="PIN">Pin</option>
          </select>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "LIST" ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 mb-3">All Scheduled &amp; Queued Posts ({filteredPosts.length})</h3>
          {filteredPosts.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">No posts match the current filters.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPosts.map((post: any) => (
                <div key={post.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={post.status} />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
                        {post.postFormat ?? "POST"}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        {post.scheduledAt ? formatDate(post.scheduledAt) : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-800">{post.body}</p>
                    {post.tags?.length > 0 && (
                      <div className="flex gap-1">
                        {post.tags.map((tg: string) => (
                          <span key={tg} className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded font-medium">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/compose?edit=${post.id}`}
                    className="text-xs font-bold text-blue-600 hover:underline flex-shrink-0"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
          {/* Calendar Grid View */}
          <div className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-app bg-surface-subtle/50 text-center">
              {dayNames.map((d) => (
                <div key={d} className="py-2 text-[11px] font-bold text-secondary uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Day Grid */}
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {activeDays.map((date) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  const dayPosts = postsByDate[dateKey] ?? [];
                  const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

                  return (
                    <DayCell
                      key={date.toISOString()}
                      date={date}
                      isCurrentMonth={viewMode === "WEEK" ? true : isSameMonth(date, currentDate)}
                      posts={dayPosts}
                      onClick={() => setSelectedDate(date)}
                      isSelected={isSelected}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Day Detail Sidebar */}
          <div className="xl:col-span-1">
            {selectedDate ? (
              <DayDetail
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
