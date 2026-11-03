"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Key, Lock, Server, CheckCircle2, AlertOctagon } from "lucide-react";

export default function SecurityPage() {
  const CONTROLS = [
    {
      title: "AES-256 Encryption at Rest",
      desc: "All OAuth tokens, client secrets, and sensitive credentials are encrypted using AES-256 before being written to PostgreSQL.",
      icon: Lock,
    },
    {
      title: "Transport Layer Security (TLS 1.3)",
      desc: "All network traffic in transit between your browser and Postinger is strictly encrypted using modern TLS 1.3 with HSTS enforced.",
      icon: Server,
    },
    {
      title: "Argon2 & Bcrypt Password Hashing",
      desc: "Account passwords are salted and hashed using bcrypt with 12 rounds / argon2. Plain-text passwords are never logged or stored.",
      icon: Key,
    },
    {
      title: "SSRF & Injection Hardening",
      desc: "Media link and RSS fetchers validate URLs against private IPv4/IPv6 ranges to prevent Server-Side Request Forgery attacks.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="h-4 w-4" />
            <span>Enterprise-Grade Architecture</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">Security at Postinger</h1>
          <p className="text-slate-400 text-base">
            Our multi-layered defense model safeguards your social accounts, scheduling pipelines, and user data.
          </p>
        </div>

        {/* Security Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {CONTROLS.map((control, idx) => {
            const Icon = control.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1.5">{control.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{control.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Sections */}
        <div className="prose prose-invert max-w-none text-slate-300 space-y-8 text-base leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Authentication & Role-Based Access Control</h2>
            <p>
              Session management uses secure, HTTP-only cookies with Strict SameSite flags. Workspace access is partitioned at the database layer; mutations verify role permissions (Owner, Admin, Member) and confirm workspace affiliation before executing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">API Key Scopes & Webhook Verification</h2>
            <p>
              Developer API keys are hashed in storage and presented to the user only once upon generation. Each key can be restricted to specific scopes (e.g. <code>posts:read</code>, <code>posts:write</code>, <code>analytics:read</code>). Inbound and outbound webhooks are verified via HMAC SHA-256 signatures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Responsible Disclosure</h2>
            <p>
              If you discover a security vulnerability in Postinger, we welcome your disclosure through our bug bounty program. Please report findings with reproduction steps to{" "}
              <a href="mailto:security@postinger.app" className="text-emerald-400 underline">
                security@postinger.app
              </a>
              . We commit to acknowledging reports within 24 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
