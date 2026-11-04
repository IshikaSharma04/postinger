import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Sparkles, Users, Briefcase, Code, ShieldCheck, Heart } from "lucide-react";
import { PostingerLogo } from "@/components/brand/PostingerLogo";

interface PersonaData {
  title: string;
  badge: string;
  headline: string;
  subhead: string;
  painPoint: string;
  solution: string;
  features: string[];
}

const PERSONA_DATA: Record<string, PersonaData> = {
  creators: {
    title: "Creators & Solo Builders",
    badge: "Built for Creators",
    headline: "Grow Your Personal Brand Without Living on Social Media",
    subhead: "Draft once, customize per network, and queue weeks of high-impact content in one sitting.",
    painPoint: "Context-switching between 6 different apps and spending hours copying captions.",
    solution: "A unified idea bank, AI copywriter, and per-channel fan-out scheduler in one clean tab.",
    features: ["4-stage idea scratchpad with RSS auto-sync", "AI tone shifting (Punchy, Casual, Thought Leader)", "Live previews for Instagram, X, and LinkedIn", "Link-in-bio Start Page builder"],
  },
  "small-business": {
    title: "Small Business Owners",
    badge: "Built for Local & Online Business",
    headline: "Keep Your Social Presence Active While Running Your Business",
    subhead: "Stay consistent, engage local customers, and schedule promotions ahead of time.",
    painPoint: "Having zero time during business hours to write and schedule posts every day.",
    solution: "Set weekly posting slots once and let Postinger publish to Google Business, Facebook, and Instagram automatically.",
    features: ["Google Business Profile offer and event posts", "Timezone-aware recurring posting queues", "Community Inbox with saved quick replies", "Simple analytics tracking top performers"],
  },
  agencies: {
    title: "Agencies & Consultants",
    badge: "Built for Social Media Agencies",
    headline: "Scale Multi-Client Publishing With Robust Approval Workflows",
    subhead: "Manage dozens of client brands, delegate drafting to contributors, and get client sign-off before publishing.",
    painPoint: "Accidental client cross-posting, messy email feedback loops, and lack of audit trails.",
    solution: "Dedicated workspace boundaries, multi-tier roles (Owner, Manager, Contributor), and draft approvals.",
    features: ["Strict tenant data isolation across client workspaces", "Contributor draft submission & Manager approvals", "Threaded internal feedback notes on drafts", "Exportable CSV & PDF client executive reports"],
  },
  nonprofits: {
    title: "Non-Profits & Community Organizations",
    badge: "Built for Mission-Driven Teams",
    headline: "Amplify Your Cause and Mobilize Volunteers on a Budget",
    subhead: "Rally donors and share community impact across every network without expensive agency software.",
    painPoint: "Tight budgets and volunteer turn-over causing sporadic communication.",
    solution: "A generous Free tier, collaborative team permissions, and evergreen campaign scheduling.",
    features: ["Free tier with 3 connected channels and 100 idea slots", "Multi-user collaboration for volunteer teams", "UTM campaign link tracking for donation drives", "Evergreen content recycling"],
  },
  "higher-education": {
    title: "Higher Education & Universities",
    badge: "Built for Campus Communications",
    headline: "Coordinate Multi-Department Campus Publishing Effortlessly",
    subhead: "Keep students, faculty, and alumni informed across campus channels and school organizations.",
    painPoint: "Decentralized departments publishing inconsistent messaging without oversight.",
    solution: "Centralized calendar visibility, department permissions, and standardized templates.",
    features: ["Campus-wide unified calendar view", "Department-level channel access control", "Pre-approved university announcement templates", "Full audit logging of all publishing actions"],
  },
  developers: {
    title: "Developers & Technical Teams",
    badge: "Built for API First Builders",
    headline: "Programmatic Social Publishing via REST API & Model Context Protocol",
    subhead: "Automate social announcements straight from your CI/CD pipelines, CLI tools, or Claude/Cursor agents.",
    painPoint: "Manual UI copying for changelog releases, blog post drops, and technical announcements.",
    solution: "A fully documented OpenAPI 3.0 REST API and native Model Context Protocol (MCP) server.",
    features: ["Scoped Bearer API keys (posts:write, analytics:read)", "Model Context Protocol server (mcp/server.ts)", "HMAC-SHA256 signed outgoing webhooks", "Sandbox mode for zero-credential test suites"],
  },
  startups: {
    title: "Fast-Growing Startups",
    badge: "Built for Startup Velocity",
    headline: "Build in Public and Drive Product Launch Momentum",
    subhead: "Share product milestones, behind-the-scenes engineering, and founder insights consistently.",
    painPoint: "Inconsistent founder publishing cadence while building the core product.",
    solution: "Hook generators, founder post templates, and scheduled thread publishing.",
    features: ["Viral hook & thread builders", "Multi-channel fan-out across founder & company handles", "UTM campaign builder for launch tracking", "Real-time comment notifications"],
  },
};

export async function generateStaticParams() {
  return Object.keys(PERSONA_DATA).map((persona) => ({ persona }));
}

export default async function PersonaLandingPage({
  params,
}: {
  params: Promise<{ persona: string }>;
}) {
  const { persona } = await params;
  const data = PERSONA_DATA[persona];
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Navigation */}
      <header className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <PostingerLogo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-bold text-zinc-700 hover:text-zinc-900 px-3 py-2">
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <span className="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          {data.badge}
        </span>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 max-w-3xl mx-auto leading-tight">
          {data.headline}
        </h1>

        <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          {data.subhead}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            Start Free for {data.title}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-sm transition-all"
          >
            Compare Plans & Caps
          </Link>
        </div>
      </section>

      {/* Before / After Solution Contrast */}
      <section className="py-16 bg-zinc-50 border-y border-zinc-100 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-red-100 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">The Struggle</span>
            <h3 className="font-bold text-base text-zinc-900">Before Postinger</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">{data.painPoint}</p>
          </div>

          <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">The Solution</span>
            <h3 className="font-bold text-base text-zinc-900">With Postinger</h3>
            <p className="text-xs text-zinc-700 leading-relaxed">{data.solution}</p>
          </div>
        </div>
      </section>

      {/* Feature Bullet List */}
      <section className="py-20 px-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-zinc-900">Tailored Capabilities for {data.title}</h2>
          <p className="text-xs text-zinc-500">Every feature designed to eliminate repetitive manual work.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.features.map((feat, i) => (
            <div key={i} className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-2xs flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-zinc-800 leading-relaxed">{feat}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
