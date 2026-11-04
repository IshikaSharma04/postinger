"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  Layers,
  FolderPlus,
  Compass,
  Zap,
} from "lucide-react";
import { PostingerPublicNavbar } from "@/components/layout/PostingerPublicNavbar";
import { PostingerLogo } from "@/components/brand/PostingerLogo";
import {
  TwitterXIcon,
  LinkedInIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/SocialBrandIcons";

const FAQS = [
  {
    q: "What content can Postinger create and organize?",
    a: "Postinger helps you brainstorm, organize, and publish any kind of social content: short-form tweets, long LinkedIn carousels, Instagram reels, video drafts, and multi-network campaigns with AI hook generation.",
  },
  {
    q: "Where can Postinger publish my content?",
    a: "With Postinger you can plan, schedule, and dispatch content to Instagram, TikTok, Facebook, X (Twitter), Pinterest, LinkedIn, YouTube Shorts, Threads, and Bluesky directly from one unified workspace.",
  },
  {
    q: "Can I use Postinger's content creation tools for free?",
    a: "Yes! Our forever free plan lets you connect up to 3 social accounts, schedule 10 posts per channel, and store unlimited ideas in your content scratchpad.",
  },
  {
    q: "How does the Scratchpad Kanban board work?",
    a: "The scratchpad organizes rough thoughts into actionable posts across Unassigned, Review, and Done stages. When an idea is ready, 1-click turns it directly into a scheduled draft in your composer.",
  },
];

export default function PostingerCreatePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [boardView, setBoardView] = useState<"BOARD" | "GALLERY">("BOARD");
  const [activeTab, setActiveTab] = useState<"IDEAS" | "TEMPLATES" | "FEEDS">("IDEAS");

  return (
    <div className="min-h-screen bg-[#F4F0EB] text-[#121212] font-sans antialiased selection:bg-[#C4F279] selection:text-black">
      {/* ── Postinger Sticky Navigation ── */}
      <PostingerPublicNavbar />

      {/* ── Hero Section (Scratchpad Experience) ── */}
      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Copy */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-[#25523B]">
              CREATE
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#121212] leading-[1.08]">
              Your content <br />
              scratchpad
            </h1>

            <p className="text-lg sm:text-xl text-[#525252] leading-relaxed max-w-md">
              Dream up, gather, and polish your content ideas in one place
            </p>

            <div className="pt-2">
              <Link
                href="/register"
                className="btn-buffer-dark inline-flex items-center gap-3 px-8 py-4 text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Get started for free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Coral Card Container with Interactive Mockup */}
          <div className="lg:col-span-7">
            <div className="bg-[#FFBEA8] p-5 sm:p-7 rounded-[36px] sm:rounded-[44px] shadow-xl shadow-orange-950/5 relative overflow-hidden">
              {/* Inner White In-App Mockup Card */}
              <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-orange-200/50 p-4 sm:p-5 shadow-2xl relative">
                {/* App Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-5">
                    <span className="font-extrabold text-base text-zinc-900">Create</span>
                    <div className="flex items-center gap-1">
                      {(["IDEAS", "TEMPLATES", "FEEDS"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setActiveTab(t)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors capitalize ${
                            activeTab === t
                              ? "bg-zinc-100 text-zinc-900 font-bold"
                              : "text-zinc-400 hover:text-zinc-700"
                          }`}
                        >
                          {t.toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Header Controls */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center p-0.5 bg-zinc-100 rounded-lg text-[11px] font-semibold text-zinc-600">
                      <button
                        onClick={() => setBoardView("BOARD")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          boardView === "BOARD" ? "bg-white text-zinc-900 shadow-xs" : ""
                        }`}
                      >
                        Board
                      </button>
                      <button
                        onClick={() => setBoardView("GALLERY")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          boardView === "GALLERY" ? "bg-white text-zinc-900 shadow-xs" : ""
                        }`}
                      >
                        Gallery
                      </button>
                    </div>

                    <Link
                      href="/ideas"
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New idea
                    </Link>
                  </div>
                </div>

                {/* 3 Kanban Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Column 1: Unassigned */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-600 px-1">
                      <span>Unassigned</span>
                      <span className="text-[11px] bg-zinc-100 px-1.5 py-0.5 rounded-full text-zinc-500 font-semibold">2</span>
                    </div>

                    {/* Card 1 */}
                    <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-zinc-200/80 shadow-xs space-y-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
                        alt="Video Ideas"
                        className="rounded-xl w-full h-24 object-cover"
                      />
                      <h4 className="font-extrabold text-xs text-zinc-900 leading-snug">
                        Video Ideas
                      </h4>
                      <p className="text-[11px] text-zinc-500 leading-tight">
                        Time-lapse or video transition edit of our orange room transformation.
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAE4FF] text-[#553C9A]">
                          Before + After
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#D2F7EE] text-[#0D6854]">
                          Video
                        </span>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-zinc-200/80 shadow-xs space-y-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80"
                        alt="Project sneak peak"
                        className="rounded-xl w-full h-20 object-cover"
                      />
                      <h4 className="font-extrabold text-xs text-zinc-900 leading-snug">
                        Project sneak peak
                      </h4>
                      <p className="text-[11px] text-zinc-500 leading-tight">
                        Tour of latest studio project before photography rollout.
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Review (with floating hand cursor) */}
                  <div className="space-y-3 relative">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-600 px-1">
                      <span>Review</span>
                      <span className="text-[11px] bg-zinc-100 px-1.5 py-0.5 rounded-full text-zinc-500 font-semibold">1</span>
                    </div>

                    {/* Floating Card */}
                    <div className="bg-[#FAF8F5] rounded-2xl p-3 border-2 border-orange-400 shadow-xl space-y-2.5 transform -rotate-2 relative z-10">
                      <div className="absolute -top-3 -right-2 text-xl select-none animate-bounce">
                        🖐️
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80"
                        alt="Table styling"
                        className="rounded-xl w-full h-24 object-cover"
                      />
                      <h4 className="font-extrabold text-xs text-zinc-900 leading-snug">
                        The subtle art of table styling idea
                      </h4>
                      <p className="text-[11px] text-zinc-500 leading-tight">
                        Post about our process of finding the right balance between rustic and modern.
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAE4FF] text-[#553C9A]">
                          Before + After
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFE3DC] text-[#C04222]">
                          Collection
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-zinc-200/80 shadow-xs space-y-2 opacity-70">
                      <h4 className="font-extrabold text-xs text-zinc-900">
                        Design Tips in 30 Seconds
                      </h4>
                      <p className="text-[11px] text-zinc-500">Short actionable advice.</p>
                    </div>
                  </div>

                  {/* Column 3: Done */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-600 px-1">
                      <span>Done</span>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">6</span>
                    </div>

                    <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-zinc-200/80 shadow-xs space-y-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                        alt="Meet Jenny"
                        className="rounded-xl w-full h-24 object-cover"
                      />
                      <h4 className="font-extrabold text-xs text-zinc-900 leading-snug">
                        Meet Jenny
                      </h4>
                      <p className="text-[11px] text-zinc-500 leading-tight">
                        Story of how Jenny grew from local hobbyist to running a full studio.
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAE4FF] text-[#553C9A]">
                          Before + After
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFE3DC] text-[#C04222]">
                          Photos
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-zinc-200/80 shadow-xs space-y-2">
                      <h4 className="font-extrabold text-xs text-zinc-900">
                        All About earth tones
                      </h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFE3DC] text-[#C04222]">
                        Collection
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <section className="py-20 bg-white border-y border-[#E6E1D8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#25523B]">
              Streamlined Content Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#121212] mt-2">
              From rough idea to published post
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-[#F4F0EB]/60 border border-[#E6E1D8] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-300 text-zinc-950 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-extrabold text-lg text-zinc-950">Jot it down anytime</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Save raw concepts, links, audio notes, or photo references into your workspace library from desktop or mobile.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F4F0EB]/60 border border-[#E6E1D8] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-300 text-zinc-950 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-extrabold text-lg text-zinc-950">Collaborate & polish</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Work through drafts with team members. Move cards through Unassigned, Review, and Done stages with drag-and-drop simplicity.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F4F0EB]/60 border border-[#E6E1D8] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-300 text-zinc-950 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-extrabold text-lg text-zinc-950">1-Click to publish</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                When an idea is ready, convert it straight into a scheduled post with automated time slots across your connected accounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-20 sm:py-28 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#121212]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#E6E1D8] p-5 shadow-xs transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-sm sm:text-base text-zinc-900"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                )}
              </button>

              {activeFaq === idx && (
                <p className="mt-3 text-xs sm:text-sm text-zinc-600 leading-relaxed pt-2 border-t border-zinc-100">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Mint Bottom CTA ── */}
      <section className="py-20 bg-[#121212] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to organize your content ideas?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
            Get started today on Postinger’s forever free plan. No credit card required.
          </p>
          <div>
            <Link
              href="/register"
              className="btn-buffer-lime inline-block px-9 py-4 text-base font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all text-zinc-950"
            >
              Get started for free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E6E1D8] py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Postinger Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
