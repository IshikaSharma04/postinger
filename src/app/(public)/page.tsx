"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  MessageSquare,
  BarChart3,
  Smartphone,
  CheckCircle2,
  Star,
  ChevronRight,
  Zap,
} from "lucide-react";
import { PostingerPublicNavbar } from "@/components/layout/PostingerPublicNavbar";
import { PostingerLogo } from "@/components/brand/PostingerLogo";
import { PostingerSocialMarquee } from "@/components/home/PostingerSocialMarquee";
import { PostingerHeroMockup } from "@/components/home/PostingerHeroMockup";
import { PostingerInteractivePostStudio } from "@/components/home/PostingerInteractivePostStudio";
import { PostingerBestTimeHeatmap } from "@/components/home/PostingerBestTimeHeatmap";
import { PostingerPricingCalculator } from "@/components/home/PostingerPricingCalculator";
import {
  TwitterXIcon,
  LinkedInIcon,
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  PinterestIcon,
} from "@/components/icons/SocialBrandIcons";

import { PostingerHeroWorkspace } from "@/components/home/PostingerHeroWorkspace";
import { PostingerShowcaseCards } from "@/components/home/PostingerShowcaseCards";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#121212] selection:bg-[#98E376] selection:text-black font-sans antialiased">
      {/* ── Commit Contest Announcement Banner (matching Screenshot 1) ── */}
      <div className="bg-[#121212] text-white text-xs py-2.5 px-4 text-center font-medium flex items-center justify-center gap-3">
        <span className="hidden sm:inline-block w-8 h-[1px] bg-zinc-800" />
        <span className="inline-flex items-center gap-2">
          <span className="font-bold text-white tracking-tight flex items-center gap-1">
            <span className="text-[#98E376]">Postinger</span> Commit
          </span>
          <span className="text-zinc-400">·</span>
          <span className="text-zinc-300">Join Postinger&apos;s first Build Contest. October 28 – November 13</span>
          <Link
            href="/register"
            className="ml-1 text-[11px] font-bold text-[#121212] bg-[#98E376] hover:bg-[#85DC61] px-2.5 py-0.5 rounded-full transition-colors"
          >
            Register
          </Link>
        </span>
        <span className="hidden sm:inline-block w-8 h-[1px] bg-zinc-800" />
      </div>

      {/* ── Official Postinger Navigation ─────────────────────────────────── */}
      <PostingerPublicNavbar />

      {/* ── Hero Workspace (matching Screenshot 1) ─────────────── */}
      <PostingerHeroWorkspace />

      {/* ── Social Proof Marquee (matching Screenshot 2) ──────────────── */}
      <section className="py-12 border-b border-[#E8E6DF] bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-6 text-center mb-6">
          <p className="text-sm font-semibold text-[#8E8D88] tracking-tight">
            313,986 creators, brands, and agencies using Postinger
          </p>
        </div>
        <PostingerSocialMarquee />
      </section>

      {/* ── Side-by-Side Product Showcase (matching Screenshot 2) ─────── */}
      <PostingerShowcaseCards />

      {/* ── Postinger 4 Core Workflows (2x2 Grid) ────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#25523B] bg-[#C4F279]/60 px-3 py-1 rounded-full">
            The Postinger Platform
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#121212] tracking-tight mt-4">
            Everything you need in one clean suite
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg mt-3">
            Replace disconnected spreadsheets and manual posting with four powerful workflows built for organic social reach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Publish */}
          <div className="bg-[#FFEBF4] rounded-3xl p-8 sm:p-10 border border-[#F4C8DD] flex flex-col justify-between hover:shadow-xl transition-all">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#9C276A]">
                Publish &amp; Queue
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121212] mt-2 mb-4 leading-tight">
                The most complete set of publishing integrations, ever
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed mb-6">
                Schedule your content to the most popular platforms including Facebook, Instagram, TikTok, LinkedIn, Threads, Bluesky, YouTube Shorts, Pinterest, and X.
              </p>
              <div className="bg-white/90 rounded-2xl p-4 border border-[#F4C8DD] shadow-sm mb-6 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                  <span>Cross-Network Customizer</span>
                  <span className="text-[#9C276A]">Auto-Adapted</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-pink-50 p-2 rounded-xl border border-pink-200">
                    <div className="font-bold text-pink-700">Instagram</div>
                    <div className="text-[10px] text-zinc-500">30 Hashtags</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-xl border border-blue-200">
                    <div className="font-bold text-blue-700">LinkedIn</div>
                    <div className="text-[10px] text-zinc-500">PDF Carousel</div>
                  </div>
                  <div className="bg-zinc-100 p-2 rounded-xl border border-zinc-300">
                    <div className="font-bold text-zinc-800">X (Twitter)</div>
                    <div className="text-[10px] text-zinc-500">280 Chars</div>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/publish"
              className="inline-flex items-center gap-2 font-bold text-sm text-[#121212] hover:text-[#9C276A] transition-colors"
            >
              <span>Explore Publish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Create Scratchpad */}
          <div className="bg-[#FFBEA8]/40 rounded-3xl p-8 sm:p-10 border border-[#F5A78E] flex flex-col justify-between hover:shadow-xl transition-all">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#B54A2E]">
                Create Scratchpad
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121212] mt-2 mb-4 leading-tight">
                Turn any idea into the perfect post
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed mb-6">
                Your content scratchpad. Dream up, gather, and polish your content ideas in one place with our visual Kanban board and AI brainstorming engine.
              </p>
              <div className="bg-white/90 rounded-2xl p-4 border border-[#F5A78E] shadow-sm mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800 mb-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B54A2E]" />
                    Scratchpad Kanban
                  </span>
                  <span className="text-zinc-400">Board &bull; Gallery</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-[#FAF8F5] p-2 rounded-xl border border-zinc-200 text-center font-semibold text-zinc-700">
                    Unassigned (4)
                  </div>
                  <div className="bg-[#FAF8F5] p-2 rounded-xl border border-zinc-200 text-center font-semibold text-zinc-700">
                    Review (1)
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center font-bold text-emerald-700">
                    Done (5)
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 font-bold text-sm text-[#121212] hover:text-[#B54A2E] transition-colors"
            >
              <span>Explore Scratchpad</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Community */}
          <div className="bg-[#FFF4D0] rounded-3xl p-8 sm:p-10 border border-[#F4E19C] flex flex-col justify-between hover:shadow-xl transition-all">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#8A6D00]">
                Community Inbox
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121212] mt-2 mb-4 leading-tight">
                Reply to comments in a flash
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed mb-6">
                Engage with your audience across all your channels at 10x speed. Postinger helps you triage questions, praise, and customer feedback from one simple dashboard.
              </p>
              <div className="bg-white/90 rounded-2xl p-4 border border-[#F4E19C] shadow-sm mb-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-zinc-800">@sarah_builds</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">Question</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">2m ago</span>
                </div>
                <p className="text-xs text-zinc-600 bg-amber-50/50 p-2 rounded-xl">
                  &ldquo;Does the scheduler support recurring weekly slots?&rdquo;
                </p>
              </div>
            </div>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 font-bold text-sm text-[#121212] hover:text-[#8A6D00] transition-colors"
            >
              <span>Explore Community Inbox</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 4: Insights */}
          <div className="bg-[#D8F0FA] rounded-3xl p-8 sm:p-10 border border-[#B8E1F2] flex flex-col justify-between hover:shadow-xl transition-all">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#186D9C]">
                Insights &amp; Heatmaps
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121212] mt-2 mb-4 leading-tight">
                Answers, not just analytics
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed mb-6">
                Discover exactly when your followers are online. Heatmap analytics pinpoint your peak engagement windows across every day of the week.
              </p>
              <div className="bg-white/90 rounded-2xl p-4 border border-[#B8E1F2] shadow-sm mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800 mb-2">
                  <span>Best Time Heatmap</span>
                  <span className="text-emerald-600 font-extrabold">Tuesday 9:00 AM (+42%)</span>
                </div>
                <div className="h-6 w-full bg-gradient-to-r from-emerald-100 via-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-emerald-950">
                  Peak Follower Activity Window
                </div>
              </div>
            </div>
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 font-bold text-sm text-[#121212] hover:text-[#186D9C] transition-colors"
            >
              <span>Explore Analytics &amp; Heatmaps</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 2 Bonus Feature Highlights: Start Page & AI Assistant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-3xl p-8 border border-[#E6E1D8] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase text-purple-700 tracking-wider">Start Page</span>
              <h4 className="text-lg font-bold text-zinc-900 mt-0.5 mb-1">Custom Link-in-Bio Builder</h4>
              <p className="text-xs text-zinc-600 leading-relaxed mb-3">
                Create a stunning mobile microsite with custom blocks, product links, and theme presets hosted on your public handle.
              </p>
              <Link href="/start-page" className="text-xs font-bold text-[#121212] hover:underline flex items-center gap-1">
                Open Start Page builder &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#E6E1D8] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">AI Content Assistant</span>
              <h4 className="text-lg font-bold text-zinc-900 mt-0.5 mb-1">Draft, Repurpose &amp; Polish</h4>
              <p className="text-xs text-zinc-600 leading-relaxed mb-3">
                Turn a single rough bullet into 5 viral hooks, reformat long blogs into Twitter threads, or generate punchy Instagram captions.
              </p>
              <Link href="/compose" className="text-xs font-bold text-[#121212] hover:underline flex items-center gap-1">
                Launch Post Studio &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Post Studio Demonstration ─────────────────────── */}
      <section id="studio" className="py-20 bg-white border-y border-[#E6E1D8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">
              Interactive Live Demo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] tracking-tight mt-2">
              Try the composer right now
            </h2>
            <p className="text-zinc-600 text-sm mt-2">
              Switch networks to preview how Postinger automatically customizes character limits, formatting, and media aspect ratios.
            </p>
          </div>
          <PostingerInteractivePostStudio />
        </div>
      </section>

      {/* ── Best Time Heatmap Section ─────────────────────────────────── */}
      <section id="heatmap" className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#25523B] bg-[#C4F279]/60 px-3 py-1 rounded-full">
            Audience Telemetry
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121212] tracking-tight mt-4">
            Post when your audience is listening
          </h2>
          <p className="text-zinc-600 text-sm mt-2">
            No more guessing games. Our heatmap reveals follower activity 24 hours a day, 7 days a week.
          </p>
        </div>
        <PostingerBestTimeHeatmap />
      </section>

      {/* ── Customer Quotes ───────────────────────────────────────────── */}
      <section className="py-20 bg-[#FAF8F5] border-t border-[#E6E1D8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight">
              Loved by creators &amp; modern brands
            </h2>
            <p className="text-zinc-600 text-xs mt-2">
              Clean design, zero bloat, and bulletproof publishing reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E6E1D8] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed italic mb-6">
                  &ldquo;Postinger gives us the exact clean scheduling experience we love, combined with bulletproof queue reliability and AI repurposing. It shaved 8 hours off our weekly cycle.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Elena"
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                />
                <div>
                  <div className="font-bold text-xs text-zinc-900">Elena Rostova</div>
                  <div className="text-[11px] text-zinc-400">Head of Growth @ Orbit</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E6E1D8] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed italic mb-6">
                  &ldquo;The best time to post heatmap alone doubled our impressions. Plus having a unified queue where I can customize captions per network is pure magic.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Marcus"
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                />
                <div>
                  <div className="font-bold text-xs text-zinc-900">Marcus Vance</div>
                  <div className="text-[11px] text-zinc-400">Founder, TechDispatch</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E6E1D8] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed italic mb-6">
                  &ldquo;I used to juggle three different tools for scheduling, ideas, and analytics. Postinger replaced all of them with an interface that feels delightful and fast.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="Sophia"
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                />
                <div>
                  <div className="font-bold text-xs text-zinc-900">Sophia Lin</div>
                  <div className="text-[11px] text-zinc-400">Creator (140k followers)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Pricing Calculator ────────────────────────────── */}
      <section id="pricing" className="py-24 max-w-6xl mx-auto px-6">
        <PostingerPricingCalculator />
      </section>

      {/* ── Mint Bottom Banner ────────────────────────────────────────── */}
      <section className="py-24 bg-[#C4F279] text-[#121212] border-t border-[#B2E661] text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            140,000+ people use Postinger to build their brand on social media every month
          </h2>
          <p className="text-base text-zinc-800 max-w-xl mx-auto mb-8 font-medium">
            Join the creators and small businesses growing their audience with simplicity and authenticity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-brand-dark px-9 py-4 text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Get started for free &rarr;
            </Link>
            <Link
              href="/login"
              className="btn-brand-outline px-8 py-4 text-base font-bold bg-transparent border-black text-black hover:bg-black/10 transition-all"
            >
              Sign into Postinger
            </Link>
          </div>
        </div>
      </section>

      {/* ── Postinger Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-[#E6E1D8] bg-[#F4F0EB] py-16 text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-3">
              <PostingerLogo size="md" />
              <p className="text-zinc-500 max-w-sm mb-4 leading-relaxed">
                Postinger is a social media workspace that helps individuals, creators, and teams brainstorm, publish, analyze, and engage across social networks.
              </p>
              <div className="flex items-center gap-3">
                <InstagramIcon className="w-4 h-4 text-zinc-600 hover:text-black transition-colors" />
                <LinkedInIcon className="w-4 h-4 text-zinc-600 hover:text-black transition-colors" />
                <TwitterXIcon className="w-4 h-4 text-zinc-600 hover:text-black transition-colors" />
                <TikTokIcon className="w-4 h-4 text-zinc-600 hover:text-black transition-colors" />
                <PinterestIcon className="w-4 h-4 text-zinc-600 hover:text-black transition-colors" />
              </div>
            </div>

            <div>
              <div className="font-bold text-zinc-900 mb-3 uppercase tracking-wider text-[11px]">
                Workflows
              </div>
              <ul className="space-y-2">
                <li><Link href="/create" className="hover:text-black">Create Scratchpad</Link></li>
                <li><Link href="/publish" className="hover:text-black">Publish &amp; Queue</Link></li>
                <li><Link href="/insights" className="hover:text-black">Insights &amp; Heatmaps</Link></li>
                <li><Link href="/community" className="hover:text-black">Community Inbox</Link></li>
                <li><Link href="/start-page" className="hover:text-black">Start Page (Bio)</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-zinc-900 mb-3 uppercase tracking-wider text-[11px]">
                Resources
              </div>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="hover:text-black">Pricing</Link></li>
                <li><a href="#studio" className="hover:text-black">Interactive Studio</a></li>
                <li><a href="#heatmap" className="hover:text-black">Follower Heatmap</a></li>
                <li><Link href="/ideas" className="hover:text-black">Idea Kanban</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-zinc-900 mb-3 uppercase tracking-wider text-[11px]">
                Company
              </div>
              <ul className="space-y-2">
                <li><span className="text-zinc-400">About</span></li>
                <li><span className="text-zinc-400">Transparency</span></li>
                <li><span className="text-zinc-400">Careers</span></li>
                <li><span className="text-zinc-400">Privacy &amp; Terms</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E6E1D8] flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Postinger Inc. Engineered for social excellence.</p>
            <p className="mt-2 sm:mt-0">Warm Stone (#F4F0EB) &bull; Mint Lime (#C4F279) &bull; Coral (#FFBEA8)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
