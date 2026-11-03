"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, ArrowRight } from "lucide-react";

const SAMPLE_HOOKS = [
  "Most creators make this fatal mistake with [Topic]...",
  "If I had to start over in 2026, here is the exact 3-step playbook I'd use:",
  "Stop scrolling if you want to double your [Metric] in 30 days:",
  "99% of people misunderstand [Topic]. Here is the contrarian truth:",
  "The single best investment I made for [Goal] cost $0. Here is how:",
];

export default function HookGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [hooks, setHooks] = useState<string[]>(SAMPLE_HOOKS);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function generateHooks(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setHooks([
      `The harsh reality about ${topic} nobody wants to admit:`,
      `How to master ${topic} without spending hundreds of hours:`,
      `3 simple ${topic} frameworks top 1% operators use daily:`,
      `Why everything you've been taught about ${topic} is outdated:`,
      `Here is what happens when you commit to ${topic} for 30 straight days:`,
    ]);
  }

  function copyHook(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Free Creator Tool
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          Viral Social Media Hook Generator
        </h1>
        <p className="text-sm text-zinc-600 max-w-xl mx-auto">
          Capture immediate attention in the first 3 seconds. Generate punchy hooks designed for X, LinkedIn, Threads, and TikTok. No login required.
        </p>
      </div>

      <form onSubmit={generateHooks} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your topic (e.g. Remote Work, SaaS Marketing, Web Design)..."
          className="flex-1 text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <button type="submit" className="btn-buffer-dark px-6 py-3 text-xs font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C4F279]" />
          Generate Hooks
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Suggested Hooks</h2>
        <div className="space-y-2.5">
          {hooks.map((hook, idx) => (
            <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 hover:border-zinc-300 transition-all">
              <p className="text-sm font-semibold text-zinc-800">&ldquo;{hook}&rdquo;</p>
              <button
                onClick={() => copyHook(hook, idx)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 text-xs font-bold hover:bg-zinc-100 flex items-center gap-1.5 flex-shrink-0"
              >
                {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIdx === idx ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-3xl p-8 text-center space-y-3">
        <h3 className="text-base font-bold text-zinc-900">Ready to schedule and publish your content?</h3>
        <p className="text-xs text-zinc-600 max-w-md mx-auto">
          Postinger lets you turn high-converting hooks into queued posts across 12 channels with automated time slot optimization.
        </p>
        <Link href="/register" className="btn-buffer-lime text-xs px-5 py-2.5 font-bold inline-flex items-center gap-1.5 shadow-sm">
          Get Started Free <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
