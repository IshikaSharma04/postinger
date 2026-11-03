"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
} from "lucide-react";
import {
  InstagramIcon,
  TikTokIcon,
  LinkedInIcon,
} from "@/components/icons/SocialBrandIcons";

export function BufferShowcaseCards() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Card 1: PUBLISH (Pastel Lilac) ─────────────────────────── */}
        <div className="bg-[#F5EDFC] rounded-[36px] p-7 sm:p-10 flex flex-col justify-between border border-[#EADBFA]/70 shadow-sm overflow-hidden group">
          {/* Mockup Container */}
          <div className="w-full bg-white rounded-3xl p-5 shadow-xl border border-purple-100 mb-8 transform transition-transform group-hover:-translate-y-1">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <span className="text-xs font-bold text-zinc-800">Create Post</span>
              <span className="text-[11px] text-zinc-400 font-medium">🏷 Tags ⌄</span>
            </div>

            {/* Account Avatars */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-pink-100 border-2 border-pink-400 flex items-center justify-center text-xs font-bold text-pink-700 relative">
                IG
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E4405F] flex items-center justify-center text-[7px] text-white">
                  ●
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-xs font-bold text-white relative">
                TK
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-black flex items-center justify-center text-[7px] text-white">
                  ●
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-100 border-2 border-blue-400 flex items-center justify-center text-xs font-bold text-blue-700 relative">
                LI
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#0A66C2] flex items-center justify-center text-[7px] text-white">
                  ●
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-100 border-2 border-purple-400 flex items-center justify-center text-xs font-bold text-purple-700 relative">
                TH
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-black flex items-center justify-center text-[7px] text-white">
                  @
                </span>
              </div>
            </div>

            {/* Post Caption Area */}
            <div className="bg-[#FAF9F7] rounded-2xl p-4 border border-zinc-200/80 mb-4">
              <p className="text-sm font-medium text-zinc-900 leading-snug">
                Registration opens this Sunday! Don&apos;t miss the early access link in our bio. 🚀
              </p>
            </div>

            {/* Scheduling Mini Calendar Mock */}
            <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 mb-3">
                <span>January 2026</span>
                <div className="flex items-center gap-1 text-zinc-400">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-zinc-400 mb-2 font-semibold">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                <span className="text-zinc-300">29</span>
                <span className="text-zinc-300">30</span>
                <span className="text-zinc-300">31</span>
                <span>1</span><span>2</span><span>3</span><span>4</span>
                <span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span>
                <span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span>
                <span>19</span><span>20</span>
                <span className="bg-[#98E376] text-black font-bold rounded-lg py-1 shadow-xs">21</span>
                <span>22</span><span>23</span><span>24</span><span>25</span>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>3:00 PM Europe/London</span>
                </div>
                <Link
                  href="/compose"
                  className="px-4 py-2 rounded-xl bg-[#98E376] hover:bg-[#85DC61] text-[#121212] font-bold text-xs flex items-center gap-1"
                >
                  Schedule Post
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Card Title / Tag */}
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#7C3AED]">
              PUBLISH
            </span>
            <Link
              href="/publish"
              className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1"
            >
              Learn about publishing &rarr;
            </Link>
          </div>
        </div>

        {/* ── Card 2: CREATE (Pastel Mint Green) ──────────────────────── */}
        <div className="bg-[#E8F8EC] rounded-[36px] p-7 sm:p-10 flex flex-col justify-between border border-[#D1F2D8]/70 shadow-sm overflow-hidden group">
          {/* Mockup Container */}
          <div className="w-full relative min-h-[380px] bg-white rounded-3xl p-5 shadow-xl border border-emerald-100 mb-8 overflow-hidden transform transition-transform group-hover:-translate-y-1">
            {/* Background Kanban Boards Mock */}
            <div className="grid grid-cols-2 gap-3 opacity-60 pointer-events-none filter blur-[0.5px]">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                  <span>Todo</span>
                  <span className="text-[10px] bg-zinc-100 px-1.5 rounded-full font-bold">4</span>
                </div>
                <div className="bg-[#FAF9F7] rounded-xl p-3 border border-zinc-200">
                  <p className="text-xs font-bold text-zinc-800">Vid Ideas: Sourcing Edition</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Explaining a restoration process step by step...</p>
                </div>
                <div className="bg-[#FAF9F7] rounded-xl p-3 border border-zinc-200">
                  <p className="text-xs font-bold text-zinc-800">Product sneak peek</p>
                  <div className="w-full h-12 rounded-lg bg-emerald-100 mt-2 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                    Image Preview
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                  <span>Review</span>
                  <span className="text-[10px] bg-zinc-100 px-1.5 rounded-full font-bold">1</span>
                </div>
                <div className="bg-[#FAF9F7] rounded-xl p-3 border border-zinc-200">
                  <p className="text-xs font-bold text-zinc-800">The subtle art of styling</p>
                  <div className="w-full h-14 rounded-lg bg-orange-100 mt-2 flex items-center justify-center text-[10px] font-bold text-orange-700">
                    Carousel Slide
                  </div>
                </div>
              </div>
            </div>

            {/* Foreground Floating AI Question Card */}
            <div className="absolute inset-x-5 top-8 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-emerald-200 space-y-3 z-10">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                  ✨
                </span>
                <span className="text-xs font-bold text-zinc-800">
                  Let&apos;s begin with a few questions 🪄
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                  What is your business about?
                </label>
                <div className="bg-[#FAF9F7] rounded-xl px-3 py-2 text-xs font-medium text-zinc-800 border border-zinc-200">
                  A training and fitness brand for athletes
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                  What is your target audience?
                </label>
                <div className="bg-[#FAF9F7] rounded-xl px-3 py-2 text-xs font-medium text-zinc-800 border border-zinc-200">
                  Busy working professionals worldwide
                </div>
              </div>

              <Link
                href="/compose"
                className="w-full py-2.5 rounded-xl bg-[#98E376] hover:bg-[#85DC61] text-[#121212] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Ideas</span>
              </Link>
            </div>
          </div>

          {/* Bottom Card Title / Tag */}
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#059669]">
              CREATE
            </span>
            <Link
              href="/create"
              className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1"
            >
              Learn about scratchpad &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
