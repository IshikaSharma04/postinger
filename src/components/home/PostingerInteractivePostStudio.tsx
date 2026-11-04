"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Clock,
  Send,
  Check,
  Heart,
  MessageCircle,
  Repeat,
  Bookmark,
  Share2,
} from "lucide-react";
import { TwitterXIcon, LinkedInIcon, InstagramIcon } from "@/components/icons/SocialBrandIcons";

const PRESETS = [
  {
    title: "🚀 Product Launch",
    text: "We just launched Postinger v2! 🚀 Engineered with Next.js 16, Three.js 3D multi-channel hub, and idempotent Redis queues for bulletproof social scheduling. What features matter most to you?",
    tags: ["buildinpublic", "nextjs", "tech"],
  },
  {
    title: "💡 Architecture Tip",
    text: "Rule of thumb for distributed background queues: never use sequential auto-incrementing IDs for external API calls. Deterministic idempotency keys prevent duplicate tweets when retries fire.",
    tags: ["systemdesign", "redis", "softwareengineering"],
  },
  {
    title: "✨ Creator Mindset",
    text: "Consistency doesn't mean burning out every day. It means having a reliable scheduling system so your ideas publish while you focus on deep creative work.",
    tags: ["creatoreconomy", "productivity"],
  },
];

type PlatformKey = "TWITTER" | "LINKEDIN" | "INSTAGRAM";

export function PostingerInteractivePostStudio() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>("TWITTER");
  const [content, setContent] = useState(PRESETS[0].text);
  const [tags, setTags] = useState(PRESETS[0].tags);
  const [queued, setQueued] = useState(false);

  const charLimits: Record<PlatformKey, number> = {
    TWITTER: 280,
    LINKEDIN: 3000,
    INSTAGRAM: 2200,
  };

  const limit = charLimits[selectedPlatform];
  const charCount = content.length;
  const isOver = charCount > limit;

  const handleQueueSimulation = () => {
    setQueued(true);
    setTimeout(() => setQueued(false), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white border border-zinc-200/90 shadow-xl shadow-zinc-900/5 p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Interactive Composer Demo
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Write once, tailor for every channel
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            Test how Postinger adapts your tone, character limits, and previews across networks.
          </p>
        </div>

        {/* Quick prompt presets */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setContent(p.text);
                setTags(p.tags);
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editor controls */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Post Caption
              </label>
              <span
                className={`text-xs font-mono font-medium ${
                  isOver ? "text-red-600 font-bold" : "text-zinc-400"
                }`}
              >
                {charCount} / {limit}
              </span>
            </div>

            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none shadow-inner"
              placeholder="What do you want to share with your audience?"
            />

            {/* Hashtag pills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Next queue slot: <strong>Today, 8:15 PM</strong></span>
            </div>

            <button
              onClick={handleQueueSimulation}
              disabled={isOver}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md ${
                queued
                  ? "bg-emerald-600 text-white"
                  : isOver
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
              }`}
            >
              {queued ? (
                <>
                  <Check className="w-4 h-4" /> Added to Queue!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Add to Queue
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Platform Preview Tabs & Live Card */}
        <div className="lg:col-span-6 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5">
          {/* Network Selector Tabs */}
          <div className="flex items-center gap-2 mb-4 bg-zinc-200/70 p-1 rounded-xl">
            <button
              onClick={() => setSelectedPlatform("TWITTER")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                selectedPlatform === "TWITTER"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <TwitterXIcon className="w-3.5 h-3.5 text-[#1D9BF0]" />
              Twitter / X
            </button>

            <button
              onClick={() => setSelectedPlatform("LINKEDIN")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                selectedPlatform === "LINKEDIN"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <LinkedInIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
              LinkedIn
            </button>

            <button
              onClick={() => setSelectedPlatform("INSTAGRAM")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                selectedPlatform === "INSTAGRAM"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
              Instagram
            </button>
          </div>

          {/* Social Card Simulation */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
            {/* Header info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                P
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  Postinger Studio
                  {selectedPlatform === "TWITTER" && (
                    <span className="text-blue-500 text-xs">✓</span>
                  )}
                </div>
                <div className="text-xs text-zinc-400">
                  {selectedPlatform === "TWITTER" && "@postinger_hq · 1m"}
                  {selectedPlatform === "LINKEDIN" && "Creator & Product Team · 1st"}
                  {selectedPlatform === "INSTAGRAM" && "postinger.hq · Original Audio"}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <p className="text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed mb-3">
              {content || "Start typing to preview your post..."}
            </p>

            {/* Hashtag row */}
            {tags.length > 0 && (
              <p className="text-xs font-medium text-blue-600 space-x-1.5 mb-3">
                {tags.map((t, idx) => (
                  <span key={idx}>#{t}</span>
                ))}
              </p>
            )}

            {/* Footer metrics bar tailored per platform */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-zinc-400 text-xs">
              {selectedPlatform === "TWITTER" && (
                <>
                  <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                    <MessageCircle className="w-4 h-4" /> 24
                  </span>
                  <span className="flex items-center gap-1 hover:text-emerald-500 cursor-pointer">
                    <Repeat className="w-4 h-4" /> 48
                  </span>
                  <span className="flex items-center gap-1 hover:text-pink-500 cursor-pointer">
                    <Heart className="w-4 h-4" /> 312
                  </span>
                  <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                    <Share2 className="w-4 h-4" />
                  </span>
                </>
              )}

              {selectedPlatform === "LINKEDIN" && (
                <>
                  <span className="flex items-center gap-1 text-zinc-600">
                    👍 👏 ❤️ 482 reactions
                  </span>
                  <span className="text-zinc-500">38 comments · 12 reposts</span>
                </>
              )}

              {selectedPlatform === "INSTAGRAM" && (
                <>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <MessageCircle className="w-5 h-5 text-zinc-700" />
                    <Send className="w-5 h-5 text-zinc-700" />
                  </div>
                  <Bookmark className="w-5 h-5 text-zinc-700" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
