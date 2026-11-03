"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Copy, Check, Sparkles, ArrowRight } from "lucide-react";

export default function BioGeneratorPage() {
  const [role, setRole] = useState("Full-stack builder & content creator");
  const [niche, setNiche] = useState("SaaS, productivity, and modern design");
  const [bios, setBios] = useState<string[]>([
    "Building scalable software & sharing lessons in public 🚀 | Design enthusiast | Writing weekly notes",
    "Founder @ stealth | Turning ideas into profitable software | Tweeting actionable growth frameworks ⚡",
    "Helping creators scale without burnout. Daily tips on systems, workflows & digital leverage 💡",
    "Software engineer by day, open-source tinkerer by night. Documenting the journey from 0 to 1.",
  ]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim()) return;
    setBios([
      `${role} · Obsessed with ${niche} ⚡ · Building the future one step at a time.`,
      `👋 I help operators master ${niche}. ${role}. Follow along for weekly tactical playbooks.`,
      `Ex-engineer turned ${role}. Sharing raw behind-the-scenes insights on ${niche} 🚀`,
      `${role} | Exploring the intersection of ${niche} | Join 10k+ readers on my weekly digest 👇`,
    ]);
  }

  function copyBio(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-pink-700 bg-pink-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Free Profile Tool
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          Social Media Bio Generator
        </h1>
        <p className="text-sm text-zinc-600 max-w-xl mx-auto">
          Craft high-converting bios for your Twitter, Instagram, Threads, and LinkedIn profiles in seconds.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700">What is your role or craft?</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Indie hacker, Product designer, Fitness coach"
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700">What topics or niche do you talk about?</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. AI tools, bootstrapping, creator economy"
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-buffer-dark px-6 py-2.5 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C4F279]" />
          Generate Bio Variations
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Suggested Bio Profiles</h2>
        <div className="space-y-3">
          {bios.map((b, idx) => (
            <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
              <p className="text-xs font-medium text-zinc-800 leading-relaxed">&ldquo;{b}&rdquo;</p>
              <button
                onClick={() => copyBio(b, idx)}
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
        <h3 className="text-base font-bold text-zinc-900">Pair your bio with a branded Start Page</h3>
        <p className="text-xs text-zinc-600 max-w-md mx-auto">
          Put a single high-converting link in your bio that showcases your latest posts, newsletters, and products.
        </p>
        <Link href="/register" className="btn-buffer-lime text-xs px-5 py-2.5 font-bold inline-flex items-center gap-1.5 shadow-sm">
          Claim Your Handle Free <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
