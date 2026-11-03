"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Zap, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { PLAN_LIMITS } from "@/lib/plans/limits";

export function BufferPricingCalculator() {
  const [channels, setChannels] = useState(4);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const isAnnual = billingCycle === "annual";
  const discountFactor = isAnnual ? 0.8 : 1.0; // 20% off annual

  const essentialsPerChannel = Math.round(6 * discountFactor);
  const teamPerChannel = Math.round(12 * discountFactor);

  const essentialsTotal = essentialsPerChannel * channels;
  const teamTotal = teamPerChannel * channels;

  const hoursSavedPerMonth = Math.round(channels * 4.5);

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white border border-zinc-200/90 shadow-xl shadow-zinc-900/5 p-6 sm:p-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Transparent, Channel-Based Pricing
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Pay only for what you actually use
        </h3>
        <p className="text-sm text-zinc-500 mt-2">
          Scale effortlessly from 1 creator account to an entire agency roster. No hidden fees or surprise seat locks.
        </p>

        {/* Billing cycle toggle */}
        <div className="inline-flex items-center p-1 bg-zinc-100 rounded-xl mt-6 border border-zinc-200/80">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isAnnual ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isAnnual ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Annual Billing
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Slider Bar */}
      <div className="max-w-xl mx-auto mb-12 p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Connected Social Channels:
          </label>
          <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
            {channels} {channels === 1 ? "Channel" : "Channels"}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="15"
          value={channels}
          onChange={(e) => setChannels(parseInt(e.target.value))}
          className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-[11px] text-zinc-400 mt-2 font-mono">
          <span>1 Channel</span>
          <span>5 Channels</span>
          <span>10 Channels</span>
          <span>15 Channels</span>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-600">
          <span>Estimated time saved:</span>
          <span className="font-bold text-zinc-900 text-sm">~{hoursSavedPerMonth} hours/month</span>
        </div>
      </div>

      {/* 3 Pricing Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Free */}
        <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Free Plan
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 mb-2">$0</div>
            <p className="text-xs text-zinc-500 mb-6">
              For individuals just starting to build their personal brand presence.
            </p>

            <ul className="space-y-3 text-xs text-zinc-600 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Up to 3 channels</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>10 scheduled posts per channel</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Basic visual calendar</span>
              </li>
            </ul>
          </div>

          <Link
            href="/register"
            className="w-full py-2.5 rounded-xl border border-zinc-200 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        {/* Tier 2: Essentials (Recommended) */}
        <div className="p-6 rounded-2xl border-2 border-blue-600 bg-blue-50/20 relative shadow-xl shadow-blue-600/5 flex flex-col justify-between">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
            Most Popular
          </div>

          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              Essentials
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-extrabold text-zinc-900">${essentialsTotal}</span>
              <span className="text-xs text-zinc-500">/month</span>
            </div>
            <p className="text-xs text-zinc-500 mb-6">
              ${essentialsPerChannel}/channel/mo for creators needing unlimited queues & AI.
            </p>

            <ul className="space-y-3 text-xs text-zinc-700 mb-6 font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Unlimited scheduled posts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>AI Content Assistant (all 5 modes)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Best time to post heatmap</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Detailed engagement analytics</span>
              </li>
            </ul>
          </div>

          <Link
            href="/register"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-center text-xs font-semibold text-white transition-all shadow-md shadow-blue-500/20"
          >
            Start 14-Day Free Trial
          </Link>
        </div>

        {/* Tier 3: Team */}
        <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Team & Agency
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-extrabold text-zinc-900">${teamTotal}</span>
              <span className="text-xs text-zinc-500">/month</span>
            </div>
            <p className="text-xs text-zinc-500 mb-6">
              ${teamPerChannel}/channel/mo for teams that collaborate with approvals.
            </p>

            <ul className="space-y-3 text-xs text-zinc-600 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Unlimited team members & seats</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Draft approval workflows</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Workspace isolation & audit logs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Custom exportable reports</span>
              </li>
            </ul>
          </div>

          <Link
            href="/register"
            className="w-full py-2.5 rounded-xl border border-zinc-200 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Try Team Free
          </Link>
        </div>
      </div>
    </div>
  );
}
