"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

interface Release {
  version: string;
  date: string;
  title: string;
  category: "feature" | "improvement" | "fix";
  summary: string;
  details: string[];
}

const RELEASES: Release[] = [
  {
    version: "v2.4.0",
    date: "November 2026",
    title: "12-Channel Support & Sandbox OAuth Simulator",
    category: "feature",
    summary: "Postinger now supports 12 full social networks plus Start Page link-in-bio, with complete offline Sandbox mode for zero-credential testing.",
    details: [
      "Added Bluesky AT Protocol & Mastodon ActivityPub native posting",
      "Substack Notes & Google Business Profile adapters",
      "Sandbox Mode with realistic mock profiles and simulated comments",
      "First Steps onboarding widget on Home dashboard",
    ],
  },
  {
    version: "v2.3.2",
    date: "October 2026",
    title: "AI Copywriter V2 & Hashtag Groups",
    category: "improvement",
    summary: "Enhanced our in-house AI copywriting engine with tone modulation, per-channel character constraints, and saved hashtag clusters.",
    details: [
      "Tone presets: Professional, Engaging, Bold, Casual, Educational",
      "Automatic hashtag recommendation engine with performance ranking",
      "Instant translation and channel-specific repurposing",
      "Bulk post scheduler from CSV with automatic timezone conversion",
    ],
  },
  {
    version: "v2.2.0",
    date: "October 2026",
    title: "Start Page Link-in-Bio 2.0",
    category: "feature",
    summary: "A complete overhaul of the Start Page builder with dynamic mobile previews, custom themes, video embeds, and click telemetry.",
    details: [
      "6 curated design themes with custom typography and accent gradients",
      "Product showcase blocks with direct checkout links",
      "YouTube, Vimeo, and Spotify interactive media embeds",
      "Server-side analytics tracking views, unique visitors, and CTR",
    ],
  },
  {
    version: "v2.1.0",
    date: "September 2026",
    title: "Team Permissions & Enterprise Security",
    category: "feature",
    summary: "Multi-seat workspace management with strict role-based access control, audit logging, and single-use password resets.",
    details: [
      "Owner, Admin, and Member permission tiers",
      "HMAC signed webhooks and granular API keys with custom scopes",
      "SSRF and private-IP sanitization across all external media fetchers",
      "Argon2/Bcrypt password hashing and encrypted token storage",
    ],
  },
  {
    version: "v2.0.4",
    date: "September 2026",
    title: "Queue Cadence & Best Time Heatmap",
    category: "improvement",
    summary: "Predictive engagement engine analyzing audience response times to recommend optimum publishing slots.",
    details: [
      "Hourly audience activity heatmap for connected accounts",
      "One-click 'Add to Best Slot' scheduling mode in Composer",
      "Enhanced BullMQ job retry policies with exponential backoff",
      "Automated streak tracking and weekly goal achievements",
    ],
  },
];

export default function ChangelogPage() {
  const [filter, setFilter] = useState<"all" | "feature" | "improvement" | "fix">("all");

  const filteredReleases = filter === "all" ? RELEASES : RELEASES.filter((r) => r.category === filter);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Hero */}
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Continuous Innovation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Postinger Changelog
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            See everything new we've shipped to help you schedule smarter, grow your channels, and engage your community.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(["all", "feature", "improvement", "fix"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                  filter === tab
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {tab === "all" ? "All Updates" : tab === "feature" ? "New Features" : tab === "improvement" ? "Improvements" : "Fixes"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl space-y-12">
          {filteredReleases.map((release) => (
            <article
              key={release.version}
              className="relative pl-8 md:pl-10 border-l-2 border-slate-800 hover:border-emerald-500/50 transition-colors"
            >
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-slate-900 border-2 border-emerald-500" />
              
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {release.version}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {release.date}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    release.category === "feature"
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {release.category}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">{release.title}</h2>
              <p className="text-slate-300 mb-4 text-base leading-relaxed">{release.summary}</p>

              <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Key Highlights</h3>
                {release.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 px-6 border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to experience these updates firsthand?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Create your free Postinger account today and connect your favorite social channels in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 transition-all"
            >
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all border border-slate-700"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
