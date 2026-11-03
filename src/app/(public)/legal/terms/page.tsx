"use client";

import React from "react";
import Link from "next/link";
import { Scale, CheckSquare, AlertTriangle, ShieldCheck } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Scale className="h-4 w-4" />
            <span>Effective November 2026</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">Terms of Service</h1>
          <p className="text-slate-400 text-base">
            Please read these terms carefully before creating an account or using Postinger services.
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-8 text-base leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing Postinger via our web app, API, browser extension, or mobile views, you agree to be bound by these Terms of Service and all applicable platform developer rules (including Meta, X, LinkedIn, YouTube, and Bluesky platform policies).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-emerald-400" />
              2. Acceptable Use & Content Guidelines
            </h2>
            <p>
              Postinger is intended for legitimate audience building and community engagement. You agree not to use our queue or automated publishing tools to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Broadcast unsolicited commercial spam, malware, or deceptive phishing links.</li>
              <li>Violate the intellectual property, copyright, or trademark rights of third parties.</li>
              <li>Distribute hate speech, harassment, or unlawful content in violation of host platform guidelines.</li>
              <li>Attempt to reverse-engineer, overwhelm, or bypass API rate limits or security firewalls.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              3. Service Availability & Subscriptions
            </h2>
            <p>
              Free accounts are limited to 3 connected channels and basic scheduling limits. Paid subscriptions (Pro and Enterprise) renew on a recurring monthly or annual basis. You may cancel or downgrade your plan at any time through Settings &gt; Billing.
            </p>
            <p>
              We aim for 99.9% publishing uptime. However, scheduled job delivery times may occasionally be influenced by downstream API downtime from third-party social platforms beyond our direct control.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white mb-2">Contact Legal</h3>
            <p className="text-sm text-slate-400">
              For legal inquiries or notices, contact{" "}
              <a href="mailto:legal@postinger.app" className="text-emerald-400 underline">
                legal@postinger.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
