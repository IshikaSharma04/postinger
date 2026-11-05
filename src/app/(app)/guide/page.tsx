import Link from "next/link";
import {
  PenSquare,
  Calendar,
  Clock,
  Sparkles,
  Smartphone,
  MessageSquare,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  Zap,
  Layers,
  Globe,
  Share2,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export default function GuidePage() {
  const steps = [
    {
      num: "01",
      title: "Connect Your Social Accounts",
      tagline: "Link Instagram, Twitter / X, LinkedIn, TikTok, and YouTube in 30 seconds.",
      description:
        "Head over to Channels to authorize your profiles. Postinger uses official OAuth 2.0 and Graph API standards to securely connect your accounts. Tokens are stored encrypted on the server with automated refresh handling.",
      cta: "Connect Channels",
      href: "/accounts",
      color: "from-sky-500/10 to-blue-500/10 border-sky-200 text-sky-950",
      accent: "bg-sky-500 text-white",
      badge: "Foundation",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    },
    {
      num: "02",
      title: "Compose Once, Customize per Channel",
      tagline: "Tailor captions, character limits, and first comments without rewriting.",
      description:
        "Open the Post Composer to draft your master message. Click individual platform tabs (X, Instagram, LinkedIn) to customize copy specifically for each network. Add images or video, schedule a first comment with hashtags, and check the live feed preview.",
      cta: "Open Post Composer",
      href: "/compose",
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-950",
      accent: "bg-emerald-600 text-white",
      badge: "Publishing",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
    },
    {
      num: "03",
      title: "Visual Calendar & One-Click Rescheduling",
      tagline: "Plan weeks in advance and reorganize your queue on the fly.",
      description:
        "Switch between Month and Week views on the Calendar. Click any date cell to inspect scheduled posts in the side drawer. Change times with the instant reschedule selector, or click '+ Schedule on this day' to prefill a new post directly.",
      cta: "Open Calendar",
      href: "/calendar",
      color: "from-purple-500/10 to-indigo-500/10 border-purple-200 text-purple-950",
      accent: "bg-purple-600 text-white",
      badge: "Planning",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    },
    {
      num: "04",
      title: "Content Ideas Bank & AI Assistant",
      tagline: "Never run out of inspiration with our Kanban idea board and AI rewriter.",
      description:
        "Jot down raw concepts in the Idea Bank. Drag cards across stages (Idea -> In Progress -> Ready). When an idea is polished, click 'Convert to Post' to load it straight into the Composer with your tags and media attached.",
      cta: "Explore Idea Bank",
      href: "/ideas",
      color: "from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-950",
      accent: "bg-amber-600 text-white",
      badge: "Brainstorming",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    },
    {
      num: "05",
      title: "Start Page (Link-in-Bio Builder)",
      tagline: "Build a beautiful mobile microsite for your social bio links.",
      description:
        "Give your followers a single destination for your portfolio, newsletter, videos, and social links. The Start Page builder offers real-time mobile preview, custom theme palettes, and instant public publishing at /p/[handle].",
      cta: "Launch Start Page",
      href: "/start-page",
      color: "from-rose-500/10 to-pink-500/10 border-rose-200 text-rose-950",
      accent: "bg-rose-600 text-white",
      badge: "Audience",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
    },
    {
      num: "06",
      title: "Community Inbox & Unified Conversations",
      tagline: "Engage with fans and reply to comments across all networks in one inbox.",
      description:
        "Filter incoming comments by Unread, Needs Reply, or Sentiment (Questions, Praise, Feedback). Type replies directly in Postinger to keep your audience engaged without switching between 5 different social apps.",
      cta: "Open Community Inbox",
      href: "/community",
      color: "from-cyan-500/10 to-blue-500/10 border-cyan-200 text-cyan-950",
      accent: "bg-cyan-600 text-white",
      badge: "Engagement",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* ── Top Hero with 3D Holographic Prism ── */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-8 md:p-12 border border-neutral-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          <div className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-lime-400 text-black">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Product Walkthrough
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
              Master Postinger in 6 Simple Steps
            </h1>
            <p className="text-sm md:text-base text-neutral-300 max-w-2xl leading-relaxed">
              Everything you need to schedule multi-channel content, manage queue time slots, build your link-in-bio, and engage your audience like a pro.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/compose"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-lime-400 text-black hover:bg-lime-300 transition-all shadow-md hover:scale-[1.02]"
              >
                <PenSquare className="w-4 h-4" />
                Start Composing Now
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>

          <div className="md:col-span-4 flex items-center justify-center">
            <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-lime-400">
              <Zap className="w-16 h-16 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-lime-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* ── Visual Steps Grid (2 cols, colorful cards with images) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`rounded-2xl border ${step.color} bg-gradient-to-br p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group`}
          >
            <div>
              {/* Header Badge & Step Number */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black tracking-tight text-neutral-400 group-hover:text-neutral-900 transition-colors">
                  {step.num}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/80 border border-neutral-200 text-neutral-800 shadow-2xs">
                  {step.badge}
                </span>
              </div>

              {/* Graphic Card Thumbnail */}
              <div className="w-full h-40 rounded-xl overflow-hidden bg-neutral-100 border border-black/5 mb-5 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h2 className="text-lg font-extrabold text-neutral-900">{step.title}</h2>
              <p className="text-xs font-semibold text-neutral-600 mt-1">{step.tagline}</p>
              <p className="text-xs text-neutral-600 mt-3 leading-relaxed">{step.description}</p>
            </div>

            <div className="pt-6 mt-6 border-t border-black/5 flex items-center justify-between">
              <Link
                href={step.href}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-black group-hover:translate-x-1 transition-all"
              >
                {step.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Platform Limits & Specifications Cheat Sheet ── */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 text-lime-400" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-neutral-900">Supported Platforms & Specifications</h3>
            <p className="text-xs text-neutral-500">Official API limits automatically enforced by Postinger validators.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Max Characters</th>
                <th className="py-3 px-3">Supported Media</th>
                <th className="py-3 px-3">Direct Publishing</th>
                <th className="py-3 px-3">Unique Feature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              <tr>
                <td className="py-3 px-3 font-bold text-neutral-900">Twitter / X</td>
                <td className="py-3 px-3">280 (Standard)</td>
                <td className="py-3 px-3">Up to 4 images, 1 video</td>
                <td className="py-3 px-3 text-emerald-600 font-semibold">✓ Live Direct</td>
                <td className="py-3 px-3">Thread scheduling supported</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-neutral-900">Instagram</td>
                <td className="py-3 px-3">2,200</td>
                <td className="py-3 px-3">Photos, Carousels, Reels</td>
                <td className="py-3 px-3 text-emerald-600 font-semibold">✓ Business / Creator</td>
                <td className="py-3 px-3">First-comment scheduling</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-neutral-900">LinkedIn</td>
                <td className="py-3 px-3">3,000</td>
                <td className="py-3 px-3">Single/multi-image, PDF, Video</td>
                <td className="py-3 px-3 text-emerald-600 font-semibold">✓ Profile & Company</td>
                <td className="py-3 px-3">Professional formatting</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-neutral-900">TikTok</td>
                <td className="py-3 px-3">4,000</td>
                <td className="py-3 px-3">Vertical 9:16 Video (3s–10m)</td>
                <td className="py-3 px-3 text-emerald-600 font-semibold">✓ Direct Post API</td>
                <td className="py-3 px-3">Trending sound tagging</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-neutral-900">YouTube</td>
                <td className="py-3 px-3">5,000 (Description)</td>
                <td className="py-3 px-3">YouTube Shorts & Videos</td>
                <td className="py-3 px-3 text-emerald-600 font-semibold">✓ Direct Upload</td>
                <td className="py-3 px-3">Custom thumbnail selection</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
