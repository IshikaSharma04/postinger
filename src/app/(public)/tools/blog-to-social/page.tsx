"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, FileText, Copy, Check, ArrowRight, Share2, RefreshCw } from "lucide-react";

interface SocialPostOutput {
  angle: string;
  channel: string;
  content: string;
}

export default function BlogToSocialTool() {
  const [blogText, setBlogText] = useState(
    "Organic social growth in 2026 isn't about posting 5 times a day. It's about building high-signal micro-narratives. When we shifted from generic news roundups to teardowns of specific customer experiments, our engagement jumped by 340% across LinkedIn and Threads. The lesson: audience trust follows depth, not volume."
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [results, setResults] = useState<SocialPostOutput[]>([
    {
      angle: "Key Takeaway (LinkedIn / X)",
      channel: "LinkedIn",
      content:
        "Stop posting 5x a day for the sake of an algorithm.\n\nHere is what happened when we switched to high-signal micro-narratives instead:\n\n→ 340% jump in engagement across LinkedIn & Threads\n→ Double the inbound conversation quality\n→ Less creator burnout\n\nLesson: Audience trust follows depth, not volume.\n\n#ContentStrategy #Growth #Marketing",
    },
    {
      angle: "Bold Contrarian Hook (X / Threads)",
      channel: "Threads",
      content:
        "Unpopular opinion: Posting 5x a day is actively hurting your organic reach.\n\nYour audience doesn't want more noise. They want high-signal depth.\n\nFocus on 2 deep teardowns a week instead of 10 generic listicles and watch what happens.",
    },
    {
      angle: "Story & Experiment Angle (Instagram Carousel / Reel)",
      channel: "Instagram",
      content:
        "We ran a simple experiment last month: cut posting volume in half, but doubled down on depth.\n\nThe result? A 340% spike in engagement.\n\nSwipe to see the exact breakdown of our new micro-narrative framework ➡️\n\n#socialmediamarketing #creatorlife #growthstrategy",
    },
  ]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setResults([
        {
          angle: "Actionable Summary (LinkedIn)",
          channel: "LinkedIn",
          content: `Here are 3 quick takeaways from our latest analysis:\n\n1. Depth > Frequency: High-signal content beats daily filler.\n2. Engagement increased by 340% when shifting to teardowns.\n3. The future of audience building is authentic trust.\n\nFull breakdown below 👇\n\n#SocialMediaStrategy #CreatorEconomy`,
        },
        {
          angle: "Hook & Discussion Prompt (X / Threads)",
          channel: "X / Twitter",
          content: `What is the #1 metric you optimize for on social right now?\n\nWe saw a 340% engagement surge by abandoning volume in favor of actionable case studies.\n\nCurious: are you still posting daily, or focusing on weekly deep-dives?`,
        },
        {
          angle: "Quote Snippet (Bluesky / Mastodon)",
          channel: "Bluesky",
          content: `"Audience trust follows depth, not volume."\n\nA reminder for anyone feeling exhausted by the daily content treadmill. Pick 1 great idea and unpack it completely.`,
        },
      ]);
    }, 600);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Free Creator Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Free Blog-to-Social Post Generator
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Paste your article text or blog snippet to instantly generate 3 high-converting post variations tailored for LinkedIn, X, Threads, and Instagram.
          </p>
        </div>

        {/* Input Card */}
        <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-6 mb-10 shadow-xl">
          <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>Paste your blog excerpt or article summary</span>
          </label>
          <textarea
            rows={5}
            value={blogText}
            onChange={(e) => setBlogText(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
            placeholder="Paste raw text, notes, or article excerpt here..."
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              {blogText.length} characters • Powered by Postinger Content Engine
            </span>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !blogText.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Posts...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Repurpose Content
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-400" />
            <span>Generated Social Posts</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-800/40 border border-slate-700/70 p-5 flex flex-col justify-between hover:border-slate-600 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.channel}
                    </span>
                    <span className="text-xs text-slate-400">{item.angle}</span>
                  </div>
                  <pre className="font-sans text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed mb-6">
                    {item.content}
                  </pre>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopy(item.content, idx)}
                    className="px-3 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Post</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/compose?text=${encodeURIComponent(item.content)}`}
                    className="px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Schedule</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
