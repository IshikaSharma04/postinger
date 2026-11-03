"use client";

import React from "react";
import { X, Sparkles, Sprout, CheckCircle2, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

interface WhatsNewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_UPDATES = [
  {
    version: "v2.4.0",
    date: "November 2026",
    title: "Start Page Telemetry & Multi-Format Threads",
    items: [
      "Track live clicks, link CTR, and unique page views on your Start Page bio builder.",
      "Multi-post threads for X, Bluesky, and Threads now publish in chronological sequence.",
      "Added Mastodon and Substack Notes as active publishing channels.",
    ],
  },
  {
    version: "v2.3.0",
    date: "October 2026",
    title: "AI Repurposing & Community Comment Score",
    items: [
      "Turn incoming comments into published draft posts with one click.",
      "Comment Score dashboard tracking your team's response rate, speed, and consistency.",
      "10 structured post templates (Case Study, Tips, Story, Product Launch) ready in Compose.",
    ],
  },
  {
    version: "v2.2.0",
    date: "October 2026",
    title: "Timezone-Aware Queue Slots & Daylight Saving Time",
    items: [
      "Per-channel posting schedules with automatic DST calculation.",
      "Next Available and Prioritize scheduling modes in the composer.",
      "Weekly Takeaways cards on your analytics report.",
    ],
  },
];

export function WhatsNewDrawer({ isOpen, onClose }: WhatsNewDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-zinc-200 flex flex-col font-sans">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900">What's New in Postinger</h2>
              <p className="text-[11px] text-zinc-500">Continuous releases & product evolution</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Updates Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {RECENT_UPDATES.map((update, idx) => (
            <div key={update.version} className="space-y-3 pb-6 border-b border-zinc-100 last:border-b-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {update.version}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">{update.date}</span>
              </div>

              <h3 className="font-bold text-sm text-zinc-900">{update.title}</h3>

              <ul className="space-y-2">
                {update.items.map((item, i) => (
                  <li key={i} className="text-xs text-zinc-600 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <Link
            href="/changelog"
            onClick={onClose}
            className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            View full changelog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-[10px] text-zinc-400">Postinger Cloud</span>
        </div>
      </div>
    </div>
  );
}
