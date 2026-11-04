"use client";

import React, { useState } from "react";
import { Flame, Clock, Users, ArrowUpRight } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  "6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM",
];

// Activity matrix from 10 to 98%
const HEATMAP_DATA: number[][] = [
  [18, 42, 65, 82, 74, 69, 88, 96, 72], // Mon
  [22, 51, 71, 79, 68, 73, 91, 94, 68], // Tue
  [25, 48, 78, 85, 80, 77, 95, 98, 75], // Wed (Peak!)
  [20, 45, 68, 76, 70, 72, 89, 92, 70], // Thu
  [15, 38, 62, 70, 65, 81, 86, 85, 60], // Fri
  [12, 28, 45, 58, 62, 68, 74, 79, 55], // Sat
  [14, 30, 52, 65, 71, 75, 83, 90, 66], // Sun
];

function getIntensityClass(val: number): string {
  if (val >= 92) return "bg-blue-600 text-white font-bold ring-2 ring-blue-400/50 shadow-sm";
  if (val >= 80) return "bg-blue-500 text-white";
  if (val >= 65) return "bg-blue-300 text-blue-950";
  if (val >= 40) return "bg-blue-100 text-blue-900";
  return "bg-zinc-100 text-zinc-400";
}

export function PostingerBestTimeHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    hour: string;
    score: number;
  } | null>({ day: "Wed", hour: "8 PM", score: 98 });

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white border border-zinc-200/90 shadow-xl shadow-zinc-900/5 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
            <Flame className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
            Posting Activity Heatmap
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Weekly Publishing Distribution
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            Illustrative activity heatmap showing slot frequency and publishing distribution by day and time.
          </p>
        </div>

        {/* Live Hover Status Card */}
        {hoveredCell && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {hoveredCell.score}%
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">
                {hoveredCell.day} at {hoveredCell.hour}
              </div>
              <div className="text-[11px] text-blue-700">
                {hoveredCell.score >= 90 ? "🔥 Highest Engagement Window" : "Moderate Activity"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          {/* Hour headers */}
          <div className="grid grid-cols-10 gap-1.5 mb-2 text-center text-xs font-medium text-zinc-400">
            <div className="text-left pl-1">Day</div>
            {HOURS.map((h, i) => (
              <div key={i} className="truncate">{h}</div>
            ))}
          </div>

          {/* Days & Data rows */}
          {DAYS.map((day, dIdx) => (
            <div key={day} className="grid grid-cols-10 gap-1.5 mb-1.5 items-center">
              <div className="text-xs font-semibold text-zinc-600 pl-1">{day}</div>
              {HEATMAP_DATA[dIdx].map((score, hIdx) => {
                const hour = HOURS[hIdx];
                return (
                  <button
                    key={hIdx}
                    onMouseEnter={() => setHoveredCell({ day, hour, score })}
                    className={`h-9 rounded-xl flex items-center justify-center text-xs transition-all duration-200 hover:scale-105 cursor-pointer ${getIntensityClass(
                      score
                    )}`}
                  >
                    {score}%
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Stat note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 mt-4 border-t border-zinc-100 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span>Less active</span>
          <div className="flex gap-1 items-center">
            <span className="w-4 h-4 rounded-md bg-zinc-100" />
            <span className="w-4 h-4 rounded-md bg-blue-100" />
            <span className="w-4 h-4 rounded-md bg-blue-300" />
            <span className="w-4 h-4 rounded-md bg-blue-500" />
            <span className="w-4 h-4 rounded-md bg-blue-600" />
          </div>
          <span>Peak activity</span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          Posts scheduled during peak hours receive <strong>2.8x more replies & shares</strong>
        </div>
      </div>
    </div>
  );
}
