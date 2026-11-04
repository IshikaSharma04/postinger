"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Flame,
  TrendingUp,
  Users,
} from "lucide-react";
import { PostingerPublicNavbar } from "@/components/layout/PostingerPublicNavbar";
import { PostingerBestTimeHeatmap } from "@/components/home/PostingerBestTimeHeatmap";

export default function PostingerInsightsPage() {
  return (
    <div className="min-h-screen bg-[#F4F0EB] text-[#121212] font-sans antialiased selection:bg-[#C4F279] selection:text-black">
      <PostingerPublicNavbar />

      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-emerald-700">
              INSIGHTS & ANALYTICS
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#121212] leading-[1.08]">
              Know what works, <br />
              grow faster
            </h1>

            <p className="text-lg sm:text-xl text-[#525252] leading-relaxed max-w-md">
              Track engagement, discover your best times to post, and get clear answers on what content drives real audience growth.
            </p>

            <div className="pt-2">
              <Link
                href="/register"
                className="btn-buffer-dark inline-flex items-center gap-3 px-8 py-4 text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Get started for free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#D1F2D9] p-5 sm:p-7 rounded-[36px] sm:rounded-[44px] shadow-xl shadow-emerald-950/5">
              <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                  <span className="font-extrabold text-sm text-zinc-900">Audience Telemetry</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +42.8% Growth
                  </span>
                </div>
                <PostingerBestTimeHeatmap />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-white border-t border-[#E6E1D8]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-zinc-900">Best Time Heatmap</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Analyze when your followers actually engage, spanning 24 hours a day across every day of the week.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-zinc-900">Post-Level Velocity</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              See which hooks, media types, and hashtag clusters generate the highest shares, clicks, and bookmarks.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-zinc-900">Cross-Platform Reports</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Consolidated reports for Twitter, LinkedIn, Instagram, TikTok, and YouTube in a single exportable dashboard.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E6E1D8] py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Postinger Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
