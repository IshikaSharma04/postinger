"use client";

import { Award, TrendingUp, Zap, CheckCircle2 } from "lucide-react";

interface CommunityScoreStripProps {
  responseRate: number;
}

export function CommunityScoreStrip({ responseRate }: CommunityScoreStripProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Response Rate</div>
          <div className="text-xl font-extrabold text-zinc-900">{responseRate}%</div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> Excellent responsiveness
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Avg Response Speed</div>
          <div className="text-xl font-extrabold text-zinc-900">14 mins</div>
          <div className="text-[10px] text-blue-600 font-semibold">Under 1 hour target</div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Consistency Score</div>
          <div className="text-xl font-extrabold text-zinc-900">98 / 100</div>
          <div className="text-[10px] text-purple-600 font-semibold">All channels active</div>
        </div>
      </div>
    </div>
  );
}
