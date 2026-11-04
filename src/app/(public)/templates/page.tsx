"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check, Search, Sparkles, Filter } from "lucide-react";
import { PostingerLogo } from "@/components/brand/PostingerLogo";
import { POST_TEMPLATES } from "@/lib/templates/post-templates";
import { toast } from "sonner";

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["ALL", ...Array.from(new Set(POST_TEMPLATES.map((t) => t.category)))];

  const filtered = POST_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === "ALL" || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase()) ||
      tpl.body.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Template copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <PostingerLogo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-bold text-zinc-700 hover:text-zinc-900 px-3 py-2">
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Content Frameworks
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900">
          Proven Social Post Templates
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto">
          Never stare at a blank cursor again. Tested frameworks for case studies, personal stories, actionable tips, and launch announcements.
        </p>
      </section>

      {/* Filters Bar */}
      <section className="px-6 max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="px-6 max-w-6xl mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                  {tpl.category}
                </span>
                <h3 className="font-bold text-base text-zinc-900">{tpl.title}</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{tpl.description}</p>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 font-mono text-[11px] text-zinc-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                  {tpl.body}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopy(tpl.id, tpl.body)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === tpl.id ? "Copied" : "Copy"}
                </button>
                <Link
                  href={`/compose?template=${encodeURIComponent(tpl.body)}`}
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs"
                >
                  Use in Composer →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
