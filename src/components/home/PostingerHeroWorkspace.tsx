"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  TwitterXIcon,
  LinkedInIcon,
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  PinterestIcon,
} from "@/components/icons/SocialBrandIcons";

export function PostingerHeroWorkspace() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      window.location.href = `/register?email=${encodeURIComponent(email)}`;
    } else {
      window.location.href = "/register";
    }
  };

  return (
    <div className="relative min-h-[640px] flex flex-col items-center justify-center pt-8 pb-16 px-4 overflow-hidden bg-[#FAFAF8]">
      {/* ── Subtle background grid ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* ── Floating App & Channel Badges ──── */}
      {/* X / Twitter (top-left) */}
      <div
        title="X (Twitter)"
        className="flex absolute left-[4%] sm:left-[10%] md:left-[16%] top-[10%] sm:top-[12%] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-bounce-slow hover:scale-125 hover:shadow-xl transition-all duration-300 cursor-pointer z-10"
      >
        <TwitterXIcon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
      </div>

      {/* Canva (far left top) */}
      <div
        title="Canva Integration"
        className="hidden md:flex absolute left-[4%] top-[24%] w-11 h-11 rounded-2xl bg-white shadow-md border border-black/5 items-center justify-center animate-float hover:scale-125 hover:shadow-xl transition-all duration-300 cursor-pointer z-10"
      >
        <span className="w-6 h-6 rounded-full bg-[#00C4CC] text-white flex items-center justify-center text-xs font-black shadow-xs">
          C
        </span>
      </div>

      {/* YouTube (mid-left) */}
      <div
        title="YouTube Shorts & Video"
        className="flex absolute left-[3%] sm:left-[6%] top-[45%] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-float-delayed hover:scale-125 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 cursor-pointer z-10"
      >
        <span className="w-5 h-3.5 sm:w-6 sm:h-4.5 rounded-sm bg-[#FF0000] text-white flex items-center justify-center text-[10px] font-bold">
          ▶
        </span>
      </div>

      {/* LinkedIn (lower-left) */}
      <div
        title="LinkedIn Profile & Pages"
        className="flex absolute left-[6%] sm:left-[11%] top-[70%] sm:top-[66%] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-float-slow hover:scale-125 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer z-10"
      >
        <LinkedInIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A66C2]" />
      </div>

      {/* Google Drive (bottom-left) */}
      <div
        title="Google Drive Storage"
        className="hidden lg:flex absolute left-[22%] bottom-[12%] w-10 h-10 rounded-2xl bg-white shadow-md border border-black/5 items-center justify-center animate-float hover:scale-125 hover:shadow-xl transition-all duration-300 cursor-pointer z-10"
      >
        <span className="w-4 h-4 rounded-sm bg-[#34A853] text-white flex items-center justify-center text-[9px] font-bold">
          ▲
        </span>
      </div>

      {/* Instagram (bottom-left inner) */}
      <div
        title="Instagram Feed, Stories & Reels"
        className="flex absolute left-[26%] sm:left-[30%] bottom-[4%] sm:bottom-[6%] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-float-delayed hover:scale-125 hover:shadow-xl hover:shadow-pink-500/15 transition-all duration-300 cursor-pointer z-10"
      >
        <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#E4405F]" />
      </div>

      {/* TikTok (bottom-center) */}
      <div
        title="TikTok Creator Videos"
        className="flex absolute left-[44%] sm:left-[45%] -bottom-1 sm:bottom-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-bounce-slow hover:scale-125 hover:shadow-xl transition-all duration-300 cursor-pointer z-10"
      >
        <TikTokIcon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
      </div>

      {/* Dropbox (bottom-center right) */}
      <div
        title="Dropbox Cloud Assets"
        className="hidden sm:flex absolute right-[28%] sm:right-[38%] -bottom-1 sm:bottom-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-float hover:scale-125 hover:shadow-xl transition-all duration-300 cursor-pointer z-10"
      >
        <span className="w-5 h-5 sm:w-6 sm:h-6 text-[#0061FF] font-black flex items-center justify-center text-xs">
          ❖
        </span>
      </div>

      {/* Bluesky (top-right) */}
      <div
        title="Bluesky Social"
        className="flex absolute right-[4%] sm:right-[10%] md:right-[16%] top-[8%] sm:top-[12%] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-float-reverse hover:scale-125 hover:shadow-xl transition-all duration-300 cursor-pointer z-10"
      >
        <span className="text-lg sm:text-xl">🦋</span>
      </div>

      {/* Pinterest (mid-right top) */}
      <div
        title="Pinterest Visual Pins"
        className="flex absolute right-[3%] sm:right-[7%] top-[34%] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-float hover:scale-125 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 cursor-pointer z-10"
      >
        <PinterestIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#BD081C]" />
      </div>

      {/* Threads (mid-right) */}
      <div
        title="Meta Threads"
        className="flex absolute right-[6%] sm:right-[13%] top-[56%] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-float-delayed hover:scale-125 hover:shadow-xl transition-all duration-300 cursor-pointer z-10"
      >
        <span className="w-4 h-4 sm:w-5 sm:h-5 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center">
          @
        </span>
      </div>

      {/* Facebook (lower-right) */}
      <div
        title="Facebook Pages & Groups"
        className="flex absolute right-[4%] sm:right-[8%] bottom-[18%] sm:bottom-[20%] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-bounce-slow hover:scale-125 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer z-10"
      >
        <FacebookIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1877F2]" />
      </div>

      {/* Zapier (far bottom-right) */}
      <div
        title="Zapier Workflows"
        className="hidden md:flex absolute right-[18%] sm:right-[22%] bottom-[4%] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-lg border border-black/5 items-center justify-center animate-float hover:scale-125 hover:shadow-xl transition-all duration-300 cursor-pointer z-10"
      >
        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#FF4A00] text-white flex items-center justify-center text-[9px] sm:text-[10px] font-black">
          _zap
        </span>
      </div>

      {/* ── Main Hero Content ───────────────────────────────────────── */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        {/* Main Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-extrabold text-[#121212] tracking-tight leading-[1.05] mb-6">
          Your social media<br />
          workspace
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#525252] max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          Works with every platform you post to,<br className="hidden sm:inline" />
          and plugs into your favorite tools
        </p>

        {/* Hero Pill Input with Green Button */}
        <form
          onSubmit={handleSubmit}
          className="max-w-[540px] mx-auto bg-white rounded-full p-2 pl-6 shadow-md border border-[#D5D3CB] flex items-center justify-between gap-2 transition-all focus-within:border-black focus-within:shadow-lg mb-4"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email..."
            className="flex-1 bg-transparent text-sm text-[#121212] placeholder-[#8E8D88] focus:outline-none"
            required
          />
          <button
            type="submit"
            className="h-12 px-6 rounded-full bg-[#98E376] hover:bg-[#85DC61] text-[#121212] text-sm font-bold flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap shadow-xs"
          >
            <span>Get started for free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Caption below */}
        <p className="text-xs text-[#8E8D88]">
          By entering your email, you agree to receive emails from Postinger.
        </p>
      </div>
    </div>
  );
}
