"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Copy, Check, ArrowRight } from "lucide-react";

export default function UtmBuilderPage() {
  const [url, setUrl] = useState("https://mybrand.com/launch");
  const [source, setSource] = useState("twitter");
  const [medium, setMedium] = useState("social");
  const [campaign, setCampaign] = useState("spring_launch");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const generatedUrl = (() => {
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      if (source) u.searchParams.set("utm_source", source);
      if (medium) u.searchParams.set("utm_medium", medium);
      if (campaign) u.searchParams.set("utm_campaign", campaign);
      if (content) u.searchParams.set("utm_content", content);
      return u.toString();
    } catch {
      return url;
    }
  })();

  function copyUrl() {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Free Marketing Tool
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          Campaign UTM Link Builder
        </h1>
        <p className="text-sm text-zinc-600 max-w-xl mx-auto">
          Generate clean, accurate UTM tracking parameters for your Google Analytics and social media campaigns.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-700">Destination Website URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700">UTM Source (utm_source)</label>
            <input
              type="text"
              placeholder="e.g. twitter, linkedin, newsletter"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700">UTM Medium (utm_medium)</label>
            <input
              type="text"
              placeholder="e.g. social, cpc, email"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700">Campaign Name (utm_campaign)</label>
            <input
              type="text"
              placeholder="e.g. spring_promo, webinar_2026"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 outline-none"
            />
          </div>
        </div>

        {/* Generated URL Box */}
        <div className="pt-4 border-t border-zinc-100 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Generated Trackable Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={generatedUrl}
              className="flex-1 text-xs font-mono bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 outline-none select-all"
            />
            <button
              onClick={copyUrl}
              className="btn-buffer-lime px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-3xl p-8 text-center space-y-3">
        <h3 className="text-base font-bold text-zinc-900">Track clicks automatically with Postinger Start Page</h3>
        <p className="text-xs text-zinc-600 max-w-md mx-auto">
          Create a branded link-in-bio page at postinger.app/p/yourname with built-in telemetry, live previews, and zero setup.
        </p>
        <Link href="/register" className="btn-buffer-dark text-xs px-5 py-2.5 font-bold inline-flex items-center gap-1.5 shadow-sm text-white">
          Create Your Start Page Free <ArrowRight className="w-3.5 h-3.5 text-[#C4F279]" />
        </Link>
      </div>
    </div>
  );
}
