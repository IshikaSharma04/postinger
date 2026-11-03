import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ShieldCheck, Sparkles, Plus, Clock, ExternalLink } from "lucide-react";
import { PostlyLogo } from "@/components/brand/PostlyLogo";

interface ChannelData {
  title: string;
  badge: string;
  description: string;
  headline: string;
  autoPublish: boolean;
  bestFormats: string[];
  features: string[];
  color: string;
  mockPostPreview: string;
}

const CHANNELS_DATA: Record<string, ChannelData> = {
  instagram: {
    title: "Instagram",
    badge: "Meta Partner Ecosystem",
    headline: "Schedule Reels, Carousel Posts, and Stories to Instagram",
    description: "Visually plan your grid, write first comments for hashtags, and auto-publish content effortlessly.",
    autoPublish: true,
    bestFormats: ["Reels (9:16)", "Carousel albums (up to 10 photos)", "Grid feed posts", "Story reminders"],
    features: ["Direct publishing for Business & Creator accounts", "First comment auto-posting for hashtags", "Hashtag group insertion", "Grid preview canvas"],
    color: "#E4405F",
    mockPostPreview: "Behind the scenes in our studio today 📸 Consistency is compounding our reach! Drop your thoughts below 👇 #creative #growth",
  },
  facebook: {
    title: "Facebook",
    badge: "Meta Pages & Groups",
    headline: "Automate Your Facebook Business Page Publishing",
    description: "Post updates, video links, and multi-image albums to your brand audience on Facebook.",
    autoPublish: true,
    bestFormats: ["Page posts", "Video uploads", "Photo albums", "Community link updates"],
    features: ["Auto-publish to Facebook Pages", "Audience engagement tracking", "Comment sync in Community Inbox", "Bulk scheduling"],
    color: "#1877F2",
    mockPostPreview: "Excited to unveil our latest release! Here's how creators are cutting scheduling time by 80% this month.",
  },
  x: {
    title: "Twitter / X",
    badge: "X Microblogging",
    headline: "Publish Posts, Multi-Part Threads, and Media to X",
    description: "Maintain a daily presence on X with automated thread publishing, queue slots, and analytics.",
    autoPublish: true,
    bestFormats: ["Single posts (280 chars)", "Multi-post threads (1/N)", "Video & GIF embeds"],
    features: ["Ordered thread fan-out", "Best-time slot suggestions", "Engagement analytics & retweets", "Keyboard shortcut drafting"],
    color: "#000000",
    mockPostPreview: "The best growth strategy in 2026 isn't more content — it's repurposing high-signal ideas across 5 formats simultaneously. 🧵👇",
  },
  linkedin: {
    title: "LinkedIn",
    badge: "Professional Network",
    headline: "Build Your Personal Brand & Company Reach on LinkedIn",
    description: "Share career insights, PDF carousels, and thought leadership posts to your professional network.",
    autoPublish: true,
    bestFormats: ["Long-form thought leadership", "Document / PDF slides", "Multi-image posts"],
    features: ["Personal profile & company page support", "Professional tone AI copywriter", "CTR and reaction analytics", "Clean post formatting"],
    color: "#0A66C2",
    mockPostPreview: "Lessons learned after scaling to 100k followers without paid ads: Depth of insight consistently beats vanity metrics.",
  },
  tiktok: {
    title: "TikTok",
    badge: "Short-Form Video",
    headline: "Plan and Remind Short-Form Video Drops on TikTok",
    description: "Align your video drops with optimal peak viewing times and notification reminders.",
    autoPublish: false,
    bestFormats: ["Vertical short-form video (9:16)", "Trending audio soundbites"],
    features: ["Smart notification reminders", "Hook copy generator", "Hashtag trend groupings", "Cross-network caption sync"],
    color: "#000000",
    mockPostPreview: "POV: You discovered how to manage all 12 social channels in one unified queue ✨ #creatorworkflow #growth",
  },
  youtube: {
    title: "YouTube Shorts",
    badge: "Google Creator Platform",
    headline: "Schedule and Push YouTube Shorts Directly to Your Channel",
    description: "Maximize vertical video reach by lining up YouTube Shorts alongside your TikToks and Reels.",
    autoPublish: false,
    bestFormats: ["YouTube Shorts (under 60s)", "Vertical video"],
    features: ["Title and description optimization", "Tags and keyword support", "Cadence consistency tracking", "Unified queue integration"],
    color: "#FF0000",
    mockPostPreview: "How to repurpose one YouTube video into 10 multi-channel posts in under 15 minutes! Full tutorial link in description. 🚀",
  },
  threads: {
    title: "Threads",
    badge: "Meta Decentralized Social",
    headline: "Auto-Publish Conversations & Text Updates to Threads",
    description: "Join the conversation on Threads with direct automated posting and multi-post reply sequences.",
    autoPublish: true,
    bestFormats: ["Text thoughts (up to 500 chars)", "Photos & video updates", "Reply threads"],
    features: ["Direct auto-publishing", "Instant cross-post from X", "Community engagement tracking", "Hashtag inclusion"],
    color: "#000000",
    mockPostPreview: "What is your #1 focus this quarter? We're doubling down on transparent product development and community-first features.",
  },
  pinterest: {
    title: "Pinterest",
    badge: "Visual Discovery Engine",
    headline: "Drive High-Intent Evergreen Traffic with Pinterest Pins",
    description: "Schedule visual pins with outbound destination links and keyword-rich descriptions.",
    autoPublish: true,
    bestFormats: ["Standard visual pins (2:3 aspect ratio)", "Idea pins"],
    features: ["Board destination selection", "Outbound link tracking", "Evergreen queue recycle", "High-resolution image uploads"],
    color: "#BD081C",
    mockPostPreview: "10 Minimalist Studio Desk Setups to Boost Focus and Productivity · Read the full design breakdown on our blog 📌",
  },
  "google-business": {
    title: "Google Business Profile",
    badge: "Local SEO & Discovery",
    headline: "Publish Local Updates, Special Offers, and Events to Google",
    description: "Keep your local search presence active with timely announcements and business updates.",
    autoPublish: true,
    bestFormats: ["Standard business updates", "Special offers & promotions", "Events & holiday hours"],
    features: ["Direct Google Maps & Search sync", "Call-to-action buttons (Book, Order, Visit)", "Local engagement analytics"],
    color: "#4285F4",
    mockPostPreview: "We are open this weekend with new interactive workshops! Reserve your spot today or visit our studio location.",
  },
  bluesky: {
    title: "Bluesky",
    badge: "AT Protocol Ecosystem",
    headline: "Decentralized Microblogging via the Open AT Protocol",
    description: "Connect via your handle and app password to publish text updates, media, and threads.",
    autoPublish: true,
    bestFormats: ["Text posts (300 chars)", "Image attachments", "Ordered threads"],
    features: ["Open federation protocol", "App password authentication", "Direct auto-publish", "Community conversation monitoring"],
    color: "#0085FF",
    mockPostPreview: "Excited to be publishing directly to Bluesky via Postinger! The future of social media is open, interoperable, and decentralized. 🦋",
  },
  mastodon: {
    title: "Mastodon",
    badge: "Fediverse Open Standard",
    headline: "Publish to Any Mastodon Instance Across the Fediverse",
    description: "Seamlessly publish to your Mastodon account without being locked into closed proprietary algorithms.",
    autoPublish: true,
    bestFormats: ["Toots / Posts (up to 500 chars)", "CW (Content Warnings)", "Alt text for images"],
    features: ["Custom instance URL support", "Open OAuth 2.0 authorization", "Direct auto-publishing", "Zero surveillance tracking"],
    color: "#6364FF",
    mockPostPreview: "Greetings from the Fediverse! Sharing our open-source workflow notes and community updates directly from Postinger. 🐘",
  },
  substack: {
    title: "Substack Notes",
    badge: "Writer & Publication Network",
    headline: "Share Notes and Drive Subscriber Discovery on Substack",
    description: "Keep your newsletter subscribers engaged between issues with short-form notes.",
    autoPublish: true,
    bestFormats: ["Short-form notes", "Publication quotes", "Behind-the-scenes thoughts"],
    features: ["Publication target support", "Draft-to-note repurposing", "Subscriber growth tracking", "Direct linking to articles"],
    color: "#FF6719",
    mockPostPreview: "Working on this week's deep-dive essay on building durable web tools. Here is an early excerpt from the intro...",
  },
};

export async function generateStaticParams() {
  return Object.keys(CHANNELS_DATA).map((platform) => ({ platform }));
}

export default async function ChannelLandingPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  const channel = CHANNELS_DATA[platform];
  if (!channel) notFound();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Navigation */}
      <header className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <PostlyLogo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-bold text-zinc-700 hover:text-zinc-900 px-3 py-2">
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: channel.color }} />
          <span>{channel.badge}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 max-w-3xl mx-auto leading-tight">
          {channel.headline}
        </h1>

        <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          {channel.description}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            Connect {channel.title} Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/publish"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-sm transition-all"
          >
            Explore Publisher Features
          </Link>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-zinc-50 border-y border-zinc-100 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <h2 className="text-2xl font-black text-zinc-900">
              Why Creators & Brands Publish to {channel.title} via Postinger
            </h2>
            <ul className="space-y-3">
              {channel.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Mock Post Canvas */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: channel.color }}
                >
                  {channel.title.slice(0, 1)}
                </div>
                <div>
                  <div className="font-bold text-xs text-zinc-900">YourBrandOfficial</div>
                  <div className="text-[10px] text-zinc-400 font-mono">Scheduled via Postinger Queue</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                {channel.autoPublish ? "Auto-Publishes" : "Reminder Alert"}
              </span>
            </div>

            <p className="text-xs text-zinc-800 leading-relaxed font-sans">{channel.mockPostPreview}</p>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] text-zinc-500 space-y-1">
              <span className="font-bold text-zinc-700 block">Supported Formats:</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {channel.bestFormats.map((fmt, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 text-[10px]">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-black text-zinc-900">Ready to streamline your {channel.title} content?</h2>
        <p className="text-sm text-zinc-500">
          Get started free today. Test with our interactive Sandbox or link your live profile in seconds.
        </p>
        <div className="pt-2">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
          >
            Get Started Free on Postinger
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
