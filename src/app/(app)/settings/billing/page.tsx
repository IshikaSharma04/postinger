"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  Building,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PLANS } from "@/lib/plans/limits";

export default function BillingPage() {
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [annual, setAnnual] = useState(true);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const fetchWorkspace = async () => {
    try {
      const res = await fetch("/api/workspaces");
      const json = await res.json();
      if (json.success && json.data?.[0]) {
        setWorkspace(json.data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const currentPlan = workspace?.plan || "FREE";

  const handlePlanChange = async (planKey: "FREE" | "PRO" | "ENTERPRISE") => {
    if (!workspace) return;
    setUpgrading(true);
    try {
      const res = await fetch("/api/billing/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id, plan: planKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update plan");
      toast.success(data.data.message || `Switched to ${planKey} plan!`);
      setSelectedPlanToUpgrade(null);
      await fetchWorkspace();
    } catch (e: any) {
      toast.error(e.message || "Failed to change plan");
    } finally {
      setUpgrading(false);
    }
  };

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
          Manage your workspace plan, channel quotas, and billing cycle.
        </p>
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
          <h2 className="text-xl font-bold text-zinc-900">
            {currentPlan === "FREE" ? "Postinger Free Plan" : currentPlan === "PRO" ? "Postinger Pro / Essentials" : "Postinger Enterprise / Team"}
          </h2>
          <p className="text-xs text-zinc-500">
            {currentPlan === "FREE"
              ? "Up to 3 social channels, 10 scheduled posts per channel, 1 team seat."
              : currentPlan === "PRO"
              ? "Up to 15 social channels, unlimited scheduled posts, 5 team seats."
              : "Unlimited channels, dedicated account manager, unlimited seats."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-zinc-500">Billed:</span>
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
        <div className={`p-6 rounded-3xl border bg-white flex flex-col justify-between space-y-6 ${currentPlan === "FREE" ? "border-blue-600 ring-2 ring-blue-600/10 shadow-md" : "border-zinc-200 shadow-xs"}`}>
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
            disabled={currentPlan === "FREE" || upgrading}
            onClick={() => handlePlanChange("FREE")}
            className="w-full py-2.5 rounded-xl text-xs font-bold border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            {currentPlan === "FREE" ? "Current Plan" : "Downgrade to Free"}
          </button>
        </div>

        {/* PRO */}
        <div className={`p-6 rounded-3xl border bg-white flex flex-col justify-between space-y-6 relative ${currentPlan === "PRO" ? "border-blue-600 ring-2 ring-blue-600/10 shadow-md" : "border-zinc-200 shadow-xs"}`}>
          <div className="space-y-4">
            <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase">
              Most Popular
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
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Up to 15 Social channels</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited scheduled posts</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited ideas bank</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 5 Team member seats</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> AI Copywriter assistant</li>
            </ul>
          </div>

          <button
            disabled={currentPlan === "PRO" || upgrading}
            onClick={() => handlePlanChange("PRO")}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-xs"
          >
            {currentPlan === "PRO" ? "Current Plan" : "Upgrade to Pro"}
          </button>
        </div>

        {/* ENTERPRISE */}
        <div className={`p-6 rounded-3xl border bg-white flex flex-col justify-between space-y-6 ${currentPlan === "ENTERPRISE" ? "border-blue-600 ring-2 ring-blue-600/10 shadow-md" : "border-zinc-200 shadow-xs"}`}>
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
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited channels</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited scheduled posts</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited team seats with custom roles</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Multi-stage draft approvals</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Dedicated API & MCP server quotas</li>
            </ul>
          </div>

          <button
            disabled={currentPlan === "ENTERPRISE" || upgrading}
            onClick={() => handlePlanChange("ENTERPRISE")}
            className="w-full py-2.5 rounded-xl text-xs font-bold border border-zinc-900 bg-zinc-900 hover:bg-black text-white disabled:opacity-50 transition-colors shadow-xs"
          >
            {currentPlan === "ENTERPRISE" ? "Current Plan" : "Upgrade to Enterprise"}
          </button>
        </div>
      </div>
    </div>
  );
}
