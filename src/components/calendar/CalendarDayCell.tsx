"use client";

import { format, isToday } from "date-fns";
import { cn, truncate } from "@/lib/utils/helpers";

const STATUS_CELL_CLASSES: Record<string, string> = {
  PUBLISHED:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  SCHEDULED:     "bg-blue-50 text-blue-700 border-blue-200",
  FAILED:        "bg-red-50 text-red-700 border-red-200",
  DRAFT:         "bg-zinc-100 text-zinc-600 border-zinc-200",
  NEEDS_APPROVAL:"bg-purple-50 text-purple-700 border-purple-200",
  PROCESSING:    "bg-amber-50 text-amber-700 border-amber-200",
};

export interface CalendarPost {
  id: string;
  body: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  postFormat?: string;
  tags?: string[];
  hashtags?: string[];
  postAccounts: Array<{ socialAccount: { id: string; handle: string; platform: string } }>;
}

interface CalendarDayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  posts: CalendarPost[];
  onClick: () => void;
  isSelected: boolean;
}

export function CalendarDayCell({
  date,
  isCurrentMonth,
  posts,
  onClick,
  isSelected,
}: CalendarDayCellProps) {
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
        {posts.slice(0, 3).map((post) => (
          <div
            key={post.id}
            className={cn(
              "text-[10px] rounded-md px-1.5 py-0.5 truncate font-medium border transition-colors",
              STATUS_CELL_CLASSES[post.status] ?? "bg-zinc-100 text-zinc-600 border-zinc-200"
            )}
          >
            {truncate(post.body, 28)}
          </div>
        ))}
        {posts.length > 3 && (
          <p className="text-[10px] text-tertiary pl-1 font-semibold">+{posts.length - 3} more</p>
        )}
      </div>
    </div>
  );
}
