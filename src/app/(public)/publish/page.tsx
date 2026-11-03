"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  CheckCircle,
  Share2,
} from "lucide-react";
import { PostlyNavbar } from "@/components/layout/PostlyNavbar";

export default function PostlyPublishPage() {
  return (
    <div className="min-h-screen bg-[#F4F0EB] text-[#121212] font-sans antialiased selection:bg-[#C4F279] selection:text-black">
      <PostlyNavbar />

      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-blue-700">
              PUBLISH & SCHEDULE
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#121212] leading-[1.08]">
              Plan and publish <br />
              without the stress
            </h1>

            <p className="text-lg sm:text-xl text-[#525252] leading-relaxed max-w-md">
              Coordinate all your channels from one visual calendar and automated queue slots.
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

          <div className="lg:col-span-7">
            <div className="bg-[#BCE4F7] p-5 sm:p-7 rounded-[36px] sm:rounded-[44px] shadow-xl shadow-sky-950/5">
              <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                  <span className="font-extrabold text-sm text-zinc-900">Weekly Calendar Preview</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    3 Channels Synced
                  </span>
                </div>
                <div className="rounded-2xl border border-zinc-200/80 p-4 bg-zinc-50 space-y-3">
                  <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold text-zinc-600">
                    <div>Mon 9 AM</div>
                    <div>Tue 2 PM</div>
                    <div>Wed 11 AM</div>
                    <div>Thu 4 PM</div>
                    <div>Fri 10 AM</div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="bg-blue-100/70 border border-blue-200 p-2.5 rounded-xl text-left">
                      <span className="text-[10px] font-bold text-blue-800">Twitter / X</span>
                      <p className="text-[11px] text-zinc-700 font-medium truncate mt-1">SaaS growth thread</p>
                    </div>
                    <div className="bg-pink-100/70 border border-pink-200 p-2.5 rounded-xl text-left">
                      <span className="text-[10px] font-bold text-pink-800">Instagram</span>
                      <p className="text-[11px] text-zinc-700 font-medium truncate mt-1">Behind the scenes reel</p>
                    </div>
                    <div className="bg-emerald-100/70 border border-emerald-200 p-2.5 rounded-xl text-left">
                      <span className="text-[10px] font-bold text-emerald-800">LinkedIn</span>
                      <p className="text-[11px] text-zinc-700 font-medium truncate mt-1">Q4 Strategy teardown</p>
                    </div>
                    <div className="bg-amber-100/70 border border-amber-200 p-2.5 rounded-xl text-left">
                      <span className="text-[10px] font-bold text-amber-800">TikTok</span>
                      <p className="text-[11px] text-zinc-700 font-medium truncate mt-1">Quick design hack</p>
                    </div>
                    <div className="bg-purple-100/70 border border-purple-200 p-2.5 rounded-xl text-left">
                      <span className="text-[10px] font-bold text-purple-800">Threads</span>
                      <p className="text-[11px] text-zinc-700 font-medium truncate mt-1">Founder question</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-white border-t border-[#E6E1D8]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-zinc-900">Drag & Drop Calendar</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Reschedule posts instantly by dragging them between days or switching from month to week views.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-zinc-900">Recurring Queue Slots</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Define your regular posting schedule once and let Postinger automatically dispatch posts into the next open slot.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-zinc-900">Cross-Network Customizer</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Tailor copy, hashtags, and media aspect ratios for each individual social channel in a single composition flow.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Try-it-Now Sandbox (No Login Required) */}
      <section className="py-20 bg-[#FAF8F5] border-t border-[#E6E1D8]">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Interactive Live Demo
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-900">Try the Composer without an account</h2>
            <p className="text-sm text-zinc-600 max-w-lg mx-auto">
              Test drive our multi-channel editor right now. Your draft is saved in your browser and automatically transferred to your account after sign up.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Target Channels:</span>
              <div className="flex gap-1.5 flex-wrap">
                {["Twitter / X", "Instagram", "LinkedIn", "Bluesky", "Threads"].map((ch, i) => (
                  <span key={ch} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                    ✓ {ch}
                  </span>
                ))}
              </div>
            </div>

            <textarea
              id="guest-sandbox-caption"
              rows={4}
              defaultValue="Excited to test out Postinger for our weekly social posting queue! 🚀 #socialmedia #creators"
              className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600 resize-none font-medium"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-zinc-400 font-mono">Simulated multi-channel fan-out active</span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("guest-sandbox-caption") as HTMLTextAreaElement;
                    if (el && typeof window !== "undefined") {
                      localStorage.setItem("postinger_guest_draft", el.value);
                      alert("Draft saved to local storage! Create your free account to sync.");
                      window.location.href = `/register?prefill=${encodeURIComponent(el.value)}`;
                    }
                  }}
                  className="btn-buffer-lime text-xs px-5 py-2.5 font-bold flex-1 sm:flex-none text-center shadow-xs"
                >
                  Save Draft Locally &amp; Sign Up →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E6E1D8] py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Postinger Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
