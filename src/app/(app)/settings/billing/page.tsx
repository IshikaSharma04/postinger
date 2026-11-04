"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Info } from "lucide-react";

export default function BillingPage() {
  const [workspace, setWorkspace] = useState<{ id: string; name: string; plan: string } | null>(null);
  const [annual, setAnnual] = useState(true);

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const res = await fetch("/api/workspaces");
        const json = await res.json();
        if (json.success && json.data?.[0]) {
          setWorkspace(json.data[0]);
        }
      } catch {
        // Ignore fetch errors
      }
    }
    fetchWorkspace();
  }, []);

  const currentPlan = workspace?.plan || "FREE";

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-6 text-xs font-bold text-zinc-500">
        <Link href="/settings/profile" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          Profile
        </Link>
        <Link href="/settings/billing" className="py-3 text-blue-600 border-b-2 border-blue-600">
          Plans & Billing
        </Link>
        <Link href="/team" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          Team Members
        </Link>
        <Link href="/settings/api-keys" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          API Keys & Webhooks
        </Link>
        <Link href="/settings/security" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          Security
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900">Plans & Subscription</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Review your workspace quotas and future subscription options.
        </p>
      </div>

      {/* Honest Billing Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold">Billing & Paid Tiers Coming Soon</p>
          <p className="text-amber-700">
            All workspaces currently operate on the Free tier (up to 3 connected channels, 10 scheduled posts per channel).
            Stripe payment integration is scheduled for an upcoming release.
          </p>
        </div>
      </div>

      {/* Current Subscription Card */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Current Workspace Plan</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              {currentPlan} Active
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Postinger Free Plan</h2>
          <p className="text-xs text-zinc-500">
            Up to 3 social channels, 10 scheduled posts per channel, 1 team seat.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-zinc-500">Billing Interval:</span>
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setAnnual(false)}
              className={`px-3 py-1 rounded-lg transition-all ${!annual ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-3 py-1 rounded-lg transition-all ${annual ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500"}`}
            >
              Annual <span className="text-emerald-600 text-[10px] font-extrabold">-20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FREE */}
        <div className="p-6 rounded-3xl border border-blue-600 ring-2 ring-blue-600/10 shadow-md bg-white flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Free Tier</span>
              <h3 className="text-xl font-black text-zinc-900 mt-1">Free</h3>
              <div className="text-3xl font-black text-zinc-900 mt-2">$0</div>
              <p className="text-xs text-zinc-500 mt-1">For creators getting started with scheduling.</p>
            </div>

            <ul className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 3 Social channels</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 10 Scheduled posts/channel</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 100 Ideas bank scratchpad</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 1 Team collaborator seat</li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-2.5 rounded-xl text-xs font-bold border border-zinc-300 bg-zinc-100 text-zinc-500 cursor-default"
          >
            Current Plan
          </button>
        </div>

        {/* PRO */}
        <div className="p-6 rounded-3xl border border-zinc-200 shadow-xs bg-white flex flex-col justify-between space-y-6 relative opacity-90">
          <div className="space-y-4">
            <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-zinc-600 text-white text-[10px] font-bold tracking-wider uppercase">
              Upcoming
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Essentials</span>
              <h3 className="text-xl font-black text-zinc-900 mt-1">Pro Creator</h3>
              <div className="text-3xl font-black text-zinc-900 mt-2">
                {annual ? "$5" : "$6"}<span className="text-xs font-normal text-zinc-400">/channel/mo</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">For growing creators & multi-channel brands.</p>
            </div>

            <ul className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Up to 12 Social channels</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 2,000 scheduled posts</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited ideas bank</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 3 Team member seats</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> AI Copywriter assistant</li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>

        {/* ENTERPRISE */}
        <div className="p-6 rounded-3xl border border-zinc-200 shadow-xs bg-white flex flex-col justify-between space-y-6 opacity-90">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Agency & Scale</span>
              <h3 className="text-xl font-black text-zinc-900 mt-1">Enterprise</h3>
              <div className="text-3xl font-black text-zinc-900 mt-2">
                {annual ? "$10" : "$12"}<span className="text-xs font-normal text-zinc-400">/channel/mo</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">For agencies, high-volume teams, & large brands.</p>
            </div>

            <ul className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Up to 50 channels</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 10,000 scheduled posts</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Team seats with custom roles</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Multi-stage draft approvals</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Dedicated API key quotas</li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}
