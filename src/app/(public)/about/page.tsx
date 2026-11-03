"use client";

import React from "react";
import Link from "next/link";
import { Users, Heart, Shield, Globe, Award, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  const VALUES = [
    {
      title: "Default to Transparency",
      desc: "From our public changelog and open metrics to transparent pricing and privacy practices, we build in the open.",
      icon: Globe,
    },
    {
      title: "Work for Customer Success",
      desc: "We prioritize user independence, giving small businesses and creators powerful enterprise tools without predatory locks.",
      icon: Heart,
    },
    {
      title: "Privacy & Security First",
      desc: "Zero tracking pixels, argon2 password encryption, SSRF protection, and tokens encrypted at rest.",
      icon: Shield,
    },
    {
      title: "Continuous Craftsmanship",
      desc: "We write clean, efficient software with human empathy, fast load times, and rock-solid background workers.",
      icon: Award,
    },
  ];

  const STATS = [
    { label: "Supported Networks", value: "12+" },
    { label: "Publishing Uptime", value: "99.98%" },
    { label: "Community Creators", value: "45,000+" },
    { label: "Posts Scheduled Daily", value: "250,000+" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Hero */}
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 py-24 px-6 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-6">
            <Users className="h-4 w-4" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Helping independent brands and creators thrive on social
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Postinger was built to give businesses, creators, and agencies an intuitive, reliable, and privacy-respecting platform to schedule posts, understand analytics, and build authentic audiences.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-1">{stat.value}</div>
              <div className="text-xs md:text-sm text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-lg leading-relaxed">
          <h2 className="text-3xl font-bold text-white mb-6">Why We Built Postinger</h2>
          <p>
            The modern social media ecosystem is fragmented across dozens of walled gardens. Creators and marketing teams spend hours each day manually resizing imagery, converting videos, coping with character limits, and toggling between tabs.
          </p>
          <p>
            Postinger solves this by unifying publishing, scheduling, idea management, and analytics under a clean, unified cockpit. Whether you are posting an Instagram Carousel, an X thread, a YouTube Short, or a Substack Note, Postinger lets you compose once, tailor per network, and queue according to your audience's peak engagement hours.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-6 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">Values that guide how we work</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              We believe great software comes from clear ethics, simple design, and deep technical discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{val.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{val.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Start managing your social presence today</h2>
          <p className="text-slate-400 mb-8">Join thousands of creators who save hours every week with Postinger.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            Get started for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
