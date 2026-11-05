"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Layers,
  BarChart3,
  Sparkles,
  Clock,
  TrendingUp,
  CheckCircle2,
  Share2,
  ArrowUpRight,
  ChevronRight,
  Flame,
} from "lucide-react";

interface TabItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string | null;
  badgeText: string;
  accentColor: string;
}

const TABS: TabItem[] = [
  {
    id: "publish",
    title: "Plan & Publish",
    subtitle: "Visual calendar & queue slots",
    icon: Calendar,
    image: null,
    badgeText: "3 Posts Scheduled Today",
    accentColor: "from-blue-600 to-indigo-600",
  },
  {
    id: "compose",
    title: "Multi-Channel Studio",
    subtitle: "Customize per network side-by-side",
    icon: Layers,
    image: null,
    badgeText: "Twitter · LinkedIn · Instagram",
    accentColor: "from-sky-500 to-blue-600",
  },
  {
    id: "analytics",
    title: "Analytics & Best Time",
    subtitle: "Best time to post & audience spikes",
    icon: BarChart3,
    image: null,
    badgeText: "Best Time: 8:15 PM Peak 🔥",
    accentColor: "from-violet-600 to-purple-600",
  },
];

export function PostingerHeroMockup() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-cycle through tabs every 5 seconds unless paused
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = 50;
    const totalMs = 5500;
    const step = (intervalMs / totalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((cur) => (cur + 1) % TABS.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, activeTab]);

  const handleSelectTab = (idx: number) => {
    setActiveTab(idx);
    setProgress(0);
  };

  const currentTab = TABS[activeTab];

  return (
    <div
      className="relative w-full max-w-5xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Postinger-Style Tab Navigation Buttons ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = idx === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(idx)}
              className={`relative text-left p-4 rounded-2xl transition-all duration-300 border ${
                isActive
                  ? "bg-white text-zinc-900 border-zinc-300 shadow-xl shadow-zinc-900/5 ring-1 ring-zinc-200"
                  : "bg-white/60 hover:bg-white text-zinc-600 border-zinc-200/80 hover:border-zinc-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate flex items-center gap-1.5 text-zinc-900">
                    {tab.title}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-600 ml-auto" />}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{tab.subtitle}</div>
                </div>
              </div>

              {/* Active Tab Progress Bar */}
              {isActive && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-zinc-100 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-blue-600 transition-all duration-75 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Interactive Showcase Card with Floating Live Elements ── */}
      <div className="relative rounded-3xl p-3 sm:p-4 bg-white border border-zinc-200/90 shadow-2xl shadow-zinc-900/10 overflow-visible">
        {/* Browser / Window Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 mb-3 bg-zinc-50/50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400/90" />
            <span className="w-3 h-3 rounded-full bg-amber-400/90" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/90" />
            <span className="ml-3 text-xs font-mono text-zinc-400 hidden sm:inline">
              app.postinger.com/{currentTab.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Demo Mode
            </span>
          </div>
        </div>

        {/* Dynamic preview area */}
        <div className={`relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-inner bg-gradient-to-br ${currentTab.accentColor} group`}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/90">
            <currentTab.icon className="w-14 h-14 opacity-80" />
            <div className="text-center px-6">
              <p className="text-lg font-bold">{currentTab.title}</p>
              <p className="text-sm opacity-70 mt-1">{currentTab.subtitle}</p>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-semibold border border-white/30">
              {currentTab.badgeText}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* ── FLOATING MOVING ELEMENTS ── */}

        {/* Floating Badge 1: Top Left - Best Time Pill */}
        <div className="absolute -top-4 -left-3 sm:-left-6 z-20 animate-float-slow hidden xs:flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl shadow-zinc-900/10 border border-zinc-200/80">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600">
            <Flame className="w-4 h-4 fill-orange-500" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-900 flex items-center gap-1">
              Best Time to Post
              <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-1 rounded">🔥 Peak</span>
            </div>
            <div className="text-[10px] text-zinc-500">Today at 8:15 PM · 94% online</div>
          </div>
        </div>

        {/* Floating Badge 2: Top Right - Engagement Surge */}
        <div className="absolute -top-5 -right-3 sm:-right-6 z-20 animate-float-reverse flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl shadow-zinc-900/10 border border-zinc-200/80">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-900 flex items-center gap-1">
              Audience Reach
              <span className="text-[10px] text-emerald-600 font-bold">+42.8%</span>
            </div>
            <div className="text-[10px] text-zinc-500">Across 3 Connected Channels</div>
          </div>
        </div>

        {/* Floating Badge 3: Bottom Left - AI Multi-Repurpose */}
        <div className="absolute -bottom-4 -left-2 sm:-left-4 z-20 animate-float-reverse hidden sm:flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl shadow-zinc-900/10 border border-zinc-200/80">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-900">AI Assistant Ready</div>
            <div className="text-[10px] text-zinc-500">Auto-adapted for X, LinkedIn & IG</div>
          </div>
        </div>

        {/* Floating Badge 4: Bottom Right - Queue Status */}
        <div className="absolute -bottom-4 -right-2 sm:-right-4 z-20 animate-float-slow flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl shadow-zinc-900/10 border border-zinc-200/80">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-900 flex items-center gap-1.5">
              Next in Queue
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-zinc-500">Auto-dispatches in 18 mins</div>
          </div>
        </div>
      </div>
    </div>
  );
}
