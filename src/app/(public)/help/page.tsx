"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, HelpCircle, BookOpen, Share2, BarChart2, Users, CreditCard, ChevronDown, ChevronUp, MessageSquare, ArrowRight } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: "getting-started",
    question: "How do I connect my first social account?",
    answer: "Click the '+ Connect Channels' button in your left sidebar or head to Settings > Channels. Choose any of the 12 supported networks (Instagram, Facebook, X, LinkedIn, TikTok, YouTube, Threads, Pinterest, Google Business, Bluesky, Mastodon, Substack) or select Sandbox Mode to experiment instantly without live API keys.",
  },
  {
    category: "getting-started",
    question: "Is there a free plan available?",
    answer: "Yes! Postinger's Free Plan includes up to 3 connected channels, 10 scheduled posts per channel queue, access to the AI Copywriter, basic analytics, and one Start Page link-in-bio site forever.",
  },
  {
    category: "publishing",
    question: "How does the publishing queue work?",
    answer: "You configure recurring weekly time slots per channel in your Queue Settings (e.g., 9:00 AM and 5:00 PM on weekdays). When scheduling a post, choosing 'Add to Queue' automatically places the draft into your next open slot according to your channel timezone.",
  },
  {
    category: "publishing",
    question: "Can I customize post content differently for each network?",
    answer: "Absolutely. In the Postinger Composer, click on individual channel tabs to adjust text length, attach platform-specific aspect ratio media (like 9:16 for Reels and TikTok), add first comments, or select custom hashtag groups.",
  },
  {
    category: "analytics",
    question: "How frequently are engagement metrics updated?",
    answer: "For live OAuth connections, Postinger syncs impressions, likes, comments, shares, and clicks every 4 hours. Sandbox channels simulate live organic growth with realistic hourly increments.",
  },
  {
    category: "billing",
    question: "Can I upgrade or downgrade my plan at any time?",
    answer: "Yes, you can switch between Free, Pro ($6/mo/channel), and Enterprise ($12/mo/channel) plans at any time in Settings > Billing. Prorated credits are automatically calculated.",
  },
  {
    category: "team",
    question: "How do roles and permissions work for team members?",
    answer: "Workspace Owners have full access to billing and account deletion. Admins can connect channels, invite members, and schedule posts. Members can create and draft posts that require approval before entering the scheduled queue.",
  },
];

const CATEGORIES = [
  { id: "getting-started", title: "Getting Started", icon: BookOpen, desc: "Account setup, onboarding, and first steps" },
  { id: "publishing", title: "Publishing & Queues", icon: Share2, desc: "Scheduling modes, multi-channel composer, and media" },
  { id: "analytics", title: "Analytics & Reports", icon: BarChart2, desc: "Heatmaps, takeaways, and CSV/PDF export" },
  { id: "team", title: "Team & Permissions", icon: Users, desc: "Inviting colleagues, roles, and approvals" },
  { id: "billing", title: "Billing & Plans", icon: CreditCard, desc: "Invoices, quotas, and subscription changes" },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Search Header */}
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            <span>Postinger Knowledge Base</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            How can we help you today?
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
            Find answers to common questions, explore platform guides, or learn best practices for growing your audience.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search help articles (e.g. queue, sandbox, start page, billing)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
            />
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-14 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-14">
          <button
            onClick={() => setActiveCategory("all")}
            className={`p-5 rounded-2xl text-left border transition-all ${
              activeCategory === "all"
                ? "bg-emerald-500/10 border-emerald-500 text-white"
                : "bg-slate-800/50 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">All Topics</h3>
            <p className="text-xs text-slate-400 mt-1">Browse all help answers</p>
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`p-5 rounded-2xl text-left border transition-all ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500 text-white"
                    : "bg-slate-800/50 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-slate-700/60 text-slate-200 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white text-base">{cat.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.desc}</p>
              </button>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredFaqs.length} results
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-800/30 border border-slate-800">
              <p className="text-slate-400">No articles matching "{search}". Try searching for another term.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-slate-800/50 overflow-hidden transition-colors hover:border-slate-700"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 flex items-center justify-between text-left gap-4"
                  >
                    <span className="font-semibold text-white text-base">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-slate-800/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Support Strip */}
      <section className="py-16 px-6 border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-emerald-500/20 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start text-emerald-400 text-sm font-semibold mb-2">
              <MessageSquare className="h-4 w-4" />
              <span>Need personal assistance?</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Our support team is here to help</h3>
            <p className="text-slate-400 max-w-md text-sm">
              Have questions about your account, custom integrations, or scheduling limits? Drop us a note anytime.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            Open In-App Support
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
