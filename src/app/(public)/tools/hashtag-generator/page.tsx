"use client";

import { useState } from "react";
import Link from "next/link";
import { Hash, Copy, Check, ArrowRight } from "lucide-react";

export default function HashtagGeneratorPage() {
  const [keyword, setKeyword] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([
    "buildinpublic",
    "growthmindset",
    "saasgrowth",
    "creatorworkflow",
    "digitalmarketing",
    "indiehacker",
    "productivitytips",
    "socialmediastrategy",
  ]);
  const [copied, setCopied] = useState(false);

  function generateHashtags(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    const clean = keyword.toLowerCase().replace(/[^a-z0-9]/g, "");
    setHashtags([
      clean,
      `${clean}tips`,
      `${clean}hacks`,
      `${clean}growth`,
      `${clean}community`,
      `learn${clean}`,
      `${clean}marketing`,
      `${clean}2026`,
      `best${clean}`,
      `modern${clean}`,
    ]);
  }

  function copyAll() {
    navigator.clipboard.writeText(hashtags.map((h) => `#${h}`).join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Free Creator Tool
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          Trending Hashtag Generator
        </h1>
        <p className="text-sm text-zinc-600 max-w-xl mx-auto">
          Discover relevant, high-reach hashtags for Instagram, X, LinkedIn, and TikTok in one click. No account required.
        </p>
      </div>

      <form onSubmit={generateHashtags} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter core keyword (e.g. fitness, webdesign, ai)..."
          className="flex-1 text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <button type="submit" className="btn-buffer-dark px-6 py-3 text-xs font-bold flex items-center justify-center gap-2">
          <Hash className="w-4 h-4 text-[#C4F279]" />
          Generate Tags
        </button>
      </form>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Suggested Hashtags ({hashtags.length})
          </h2>
          <button
            onClick={copyAll}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 text-xs font-bold hover:bg-zinc-100 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied All" : "Copy All Tags"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {hashtags.map((h) => (
            <span
              key={h}
              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
            >
              #{h}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-3xl p-8 text-center space-y-3">
        <h3 className="text-base font-bold text-zinc-900">Want to save reusable hashtag groups?</h3>
        <p className="text-xs text-zinc-600 max-w-md mx-auto">
          Postinger allows you to save hashtag bundles and insert them directly into multi-channel posts with one click.
        </p>
        <Link href="/register" className="btn-buffer-lime text-xs px-5 py-2.5 font-bold inline-flex items-center gap-1.5 shadow-sm">
          Try Postinger Free <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
