"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lightbulb, Flame, Calendar, TrendingUp } from "lucide-react";
import { truncate } from "@/lib/utils/helpers";
import { HistoryPostItem } from "./types";

interface WeeklyTakeawaysProps {
  bestPost?: HistoryPostItem;
  scheduledCount: number;
}

export function WeeklyTakeaways({ bestPost, scheduledCount }: WeeklyTakeawaysProps) {
  const router = useRouter();

  return (
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
            You currently have {scheduledCount} posts queued. Keep a queue of 5+ scheduled posts to ensure consistent reach across timezones.
          </p>
          <Link href="/compose" className="text-xs font-bold text-purple-800 hover:text-purple-950 underline flex items-center gap-1">
            Compose next post →
          </Link>
        </div>
      </div>
    </div>
  );
}
