"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Shield className="h-4 w-4" />
            <span>Updated November 2026</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-400 text-base">
            How Postinger collects, uses, and safeguards your personal information and social media tokens.
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-8 text-base leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-400" />
              1. Information We Collect
            </h2>
            <p>
              When you create a Postinger account, we collect your name, email address, and hashed authentication credentials. When you link a social network account (such as X, Instagram, LinkedIn, Bluesky, or YouTube), we receive OAuth 2.0 access and refresh tokens authorized by you, alongside public profile identifiers (username, avatar, follower counts).
            </p>
            <p>
              We do <strong>not</strong> sell your data to data brokers or third-party advertisers. All social tokens are used exclusively to publish content and fetch metrics on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-400" />
              2. Security & Token Storage
            </h2>
            <p>
              All sensitive credentials, including OAuth access and refresh tokens, are encrypted at rest using AES-256 encryption. Passwords are salted and hashed using industry-standard cryptographic functions (Argon2 / bcrypt with 12 salt rounds) and are never logged or stored in plain text.
            </p>
            <p>
              External network communication occurs strictly over TLS 1.3. Server-side request forgery (SSRF) filters prevent private IP inspection when parsing RSS feeds or media links.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              3. Data Retention & Deletion
            </h2>
            <p>
              You maintain complete ownership of all post drafts, scheduled media, ideas, and analytics stored in Postinger. You can disconnect any social channel at any time from your channel settings, which immediately invalidates and revokes stored tokens.
            </p>
            <p>
              If you choose to delete your Postinger account from Settings &gt; Profile, all associated workspaces, posts, analytics records, and team memberships are permanently purged from our primary database within 30 days.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white mb-2">Questions or Compliance Requests?</h3>
            <p className="text-sm text-slate-400">
              For GDPR data export requests or privacy inquiries, contact our security officer at{" "}
              <a href="mailto:privacy@postinger.app" className="text-emerald-400 underline">
                privacy@postinger.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
