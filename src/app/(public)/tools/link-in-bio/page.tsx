"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Smartphone, Check, ArrowRight, ExternalLink, Globe } from "lucide-react";

export default function LinkInBioTool() {
  const [handle, setHandle] = useState("creator");
  const [selectedTheme, setSelectedTheme] = useState<"emerald" | "sunset" | "midnight">("emerald");

  const themes = {
    emerald: {
      bg: "from-slate-900 to-emerald-950",
      btn: "bg-emerald-500 text-slate-950 font-bold",
      accent: "text-emerald-400",
    },
    sunset: {
      bg: "from-purple-950 to-orange-950",
      btn: "bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold",
      accent: "text-orange-400",
    },
    midnight: {
      bg: "from-slate-950 to-slate-900",
      btn: "bg-slate-800 text-white border border-slate-700 font-bold",
      accent: "text-cyan-400",
    },
  };

  const currentTheme = themes[selectedTheme];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold mb-4">
            <Globe className="h-4 w-4" />
            <span>Postinger Start Page Builder</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Free Link-in-Bio Page Preview
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Design a custom, lightning-fast landing page to showcase your latest content, videos, products, and social links in one URL.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 shadow-xl">
              <label className="block text-sm font-bold text-white mb-2">
                Claim your custom handle
              </label>
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 mb-4 focus-within:ring-2 focus-within:ring-emerald-500">
                <span className="text-slate-400 text-sm select-none mr-1 font-mono">postinger.app/p/</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="yourname"
                  className="bg-transparent text-white font-mono text-sm focus:outline-none flex-1 font-semibold"
                />
              </div>

              <label className="block text-sm font-bold text-white mb-2">Select a Theme</label>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(["emerald", "sunset", "midnight"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTheme(t)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                      selectedTheme === t
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md"
                        : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2 mb-6">
                <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  <strong>postinger.app/p/{handle || "yourname"}</strong> is currently available to claim!
                </span>
              </div>

              <Link
                href={`/signup?claim=${encodeURIComponent(handle)}`}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <span>Claim This Free Start Page</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Interactive Mobile Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-[300px] h-[580px] rounded-[44px] bg-slate-950 border-4 border-slate-700 p-3 shadow-2xl relative flex flex-col">
              {/* Phone Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-3" />

              {/* Screen Preview */}
              <div
                className={`flex-1 rounded-[32px] bg-gradient-to-b ${currentTheme.bg} p-5 flex flex-col items-center text-center overflow-hidden border border-slate-800/80`}
              >
                <div className="h-16 w-16 rounded-full bg-slate-800 border-2 border-emerald-400/40 mb-3 flex items-center justify-center font-bold text-xl text-white shadow-lg">
                  {handle.slice(0, 2).toUpperCase() || "ME"}
                </div>
                <h3 className="font-bold text-white text-base leading-tight mb-1">
                  @{handle || "yourname"}
                </h3>
                <p className="text-xs text-slate-300 mb-6">
                  Content creator & digital strategist sharing weekly breakdowns.
                </p>

                {/* Simulated Blocks */}
                <div className="w-full space-y-2.5">
                  <div className={`w-full py-2.5 px-4 rounded-xl text-xs ${currentTheme.btn} shadow transition-transform hover:scale-[1.02]`}>
                    🎙️ Latest Podcast Episode
                  </div>
                  <div className={`w-full py-2.5 px-4 rounded-xl text-xs ${currentTheme.btn} shadow transition-transform hover:scale-[1.02]`}>
                    📚 Free Creator Playbook
                  </div>
                  <div className={`w-full py-2.5 px-4 rounded-xl text-xs ${currentTheme.btn} shadow transition-transform hover:scale-[1.02]`}>
                    ✉️ Join My Weekly Newsletter
                  </div>
                </div>

                <div className="mt-auto pt-6 text-[10px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>Powered by Postinger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
