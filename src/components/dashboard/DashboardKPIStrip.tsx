"use client";

import { Flame, Target, Smile, HelpCircle } from "lucide-react";

interface DashboardKPIStripProps {
  hasChannels: boolean;
  weekStreak: number;
  postingGoal: number;
  commentScore: number;
  onAdjustGoal: () => void;
}

export function DashboardKPIStrip({
  hasChannels,
  weekStreak,
  postingGoal,
  commentScore,
  onAdjustGoal,
}: DashboardKPIStripProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Week Streak */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Week Streak</span>
            <span title="Consecutive weeks you have met your posting goal" className="cursor-help">
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-zinc-900 flex items-center gap-1.5">
            <span>{weekStreak}</span>
            <span className="text-xs font-semibold text-zinc-400">weeks</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            {weekStreak > 0 ? "🔥 Publishing cadence active" : "0 until channels are connected"}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
          <Flame className="w-6 h-6" />
        </div>
      </div>

      {/* Posting Goal */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Posting Goal</span>
            <span title="Configured target posts per week" className="cursor-help">
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-zinc-900 flex items-center gap-1.5">
            <span>{postingGoal}</span>
            <span className="text-xs font-semibold text-zinc-400">posts / week</span>
          </div>
          <button
            onClick={onAdjustGoal}
            className="text-[11px] font-bold text-blue-600 hover:underline block"
          >
            Adjust weekly goal →
          </button>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Target className="w-6 h-6" />
        </div>
      </div>

      {/* Comment Score */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Comment Score</span>
            <span title="Audience engagement response rate" className="cursor-help">
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-zinc-900 flex items-center gap-1.5">
            <span>{commentScore}</span>
            <span className="text-xs font-semibold text-zinc-400">/ 100</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            {hasChannels ? "Healthy response rate" : "0 until channels are connected"}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Smile className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
