"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Layers,
  Calendar,
  BarChart3,
  MessageSquare,
  Smartphone,
  Sparkles,
  Users,
  Code2,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { PostlyLogo } from "@/components/brand/PostlyLogo";
import {
  TwitterXIcon,
  LinkedInIcon,
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  PinterestIcon,
} from "@/components/icons/SocialBrandIcons";

export function PostlyNavbar() {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [madeForOpen, setMadeForOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E8E6DF]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-9">
          <Link href="/" className="group focus:outline-none flex items-center gap-2.5">
            <PostlyLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[15px] font-medium text-[#121212]">
            {/* Features Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-black transition-colors py-2 focus:outline-none font-medium text-[#121212]"
              >
                <span>Features</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {featuresOpen && (
                <div className="absolute top-full -left-6 w-[560px] bg-white rounded-3xl p-5 shadow-2xl border border-zinc-200/90 animate-fade-in z-50 grid grid-cols-2 gap-3">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <Link
                      href="/create"
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#121212]">Create</div>
                        <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                          Build your own library of content ideas
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/insights"
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#121212] flex items-center gap-1.5">
                          Insights
                          <span className="text-[10px] font-bold text-[#25523B] bg-[#C4F279] px-1.5 py-0.5 rounded-full">
                            New
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                          Understand your performance and what to post next
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/team"
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#121212]">Collaborate</div>
                        <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                          Work together seamlessly, from planning to publishing
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/compose"
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#121212]">AI Assistant</div>
                        <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                          Get help creating, refining, and repurposing content
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <Link
                      href="/publish"
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#121212]">Publish</div>
                        <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                          Plan and schedule your content across social platforms
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/community"
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#121212]">Community</div>
                        <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                          Easily engage with your community
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/start-page"
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#121212]">Start Page</div>
                        <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                          Build a custom link-in-bio page in minutes
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/api/health"
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#121212]">API</div>
                        <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                          Connect Postinger to your agents and automation tools
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Integrations Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIntegrationsOpen(true)}
              onMouseLeave={() => setIntegrationsOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-black transition-colors py-2 focus:outline-none font-medium text-[#121212]"
              >
                <span>Integrations</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {integrationsOpen && (
                <div className="absolute top-full -left-20 w-[640px] bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200/90 animate-fade-in z-50 grid grid-cols-3 gap-6">
                  {/* Channels Column (2 cols wide) */}
                  <div className="col-span-2">
                    <div className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase mb-3">
                      CHANNELS
                    </div>
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-sm">
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <InstagramIcon className="w-4 h-4 text-[#E4405F]" />
                        <span>Instagram</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                        <span>Facebook</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <TikTokIcon className="w-4 h-4 text-black" />
                        <span>TikTok</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
                        <span>LinkedIn</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <TwitterXIcon className="w-4 h-4 text-black" />
                        <span>X (Twitter)</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">▶</span>
                        <span>YouTube</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <span className="w-4 h-4 text-black font-bold text-xs flex items-center justify-center">@</span>
                        <span>Threads</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <PinterestIcon className="w-4 h-4 text-[#BD081C]" />
                        <span>Pinterest</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <span className="w-4 h-4 text-blue-500 font-bold text-xs">G</span>
                        <span>Google Business</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <span className="w-4 h-4 text-sky-500 font-bold text-xs">🦋</span>
                        <span>Bluesky</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <span className="w-4 h-4 text-purple-600 font-bold text-xs">M</span>
                        <span>Mastodon</span>
                      </Link>
                      <Link href="/accounts" className="flex items-center gap-2.5 text-zinc-800 hover:text-black font-medium p-1 rounded-lg hover:bg-zinc-50">
                        <span className="w-4 h-4 text-orange-500 font-bold text-xs">S</span>
                        <span>Substack</span>
                      </Link>
                    </div>
                  </div>

                  {/* Tools Column */}
                  <div className="border-l border-zinc-100 pl-6">
                    <div className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase mb-3">
                      TOOLS
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-zinc-700 font-medium">
                        <span className="w-3.5 h-3.5 rounded bg-teal-500 inline-block" />
                        <span>Canva</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-700 font-medium">
                        <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block" />
                        <span>ChatGPT</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-700 font-medium">
                        <span className="w-3.5 h-3.5 rounded bg-orange-500 inline-block" />
                        <span>Zapier</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-700 font-medium">
                        <span className="w-3.5 h-3.5 rounded bg-red-500 inline-block" />
                        <span>n8n</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-700 font-medium">
                        <span className="w-3.5 h-3.5 rounded bg-black inline-block" />
                        <span>Grok</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-700 font-medium">
                        <span className="w-3.5 h-3.5 rounded bg-amber-600 inline-block" />
                        <span>Claude</span>
                      </div>
                    </div>
                    <Link
                      href="/accounts"
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:underline pt-2 border-t border-zinc-100 w-full"
                    >
                      See all app integrations &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Made for */}
            <Link href="/publish" className="hover:text-black transition-colors">
              Made for
            </Link>

            {/* Resources */}
            <Link href="/insights" className="hover:text-black transition-colors">
              Resources
            </Link>

            {/* Pricing */}
            <Link href="/pricing" className="hover:text-black transition-colors font-medium">
              Pricing
            </Link>
          </nav>
        </div>

        {/* CTA Buttons Right */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="h-11 px-5 rounded-full text-[14px] font-semibold text-[#121212] border border-[#D5D3CB] hover:bg-black/5 transition-all flex items-center justify-center"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="h-11 px-6 rounded-full text-[14px] font-bold text-[#121212] bg-[#98E376] hover:bg-[#85DC61] transition-all shadow-xs flex items-center justify-center active:scale-95"
          >
            Get started for free
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-zinc-700 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-zinc-200 px-6 py-6 space-y-4">
          <Link href="/create" className="block font-semibold text-zinc-800">Create</Link>
          <Link href="/publish" className="block font-semibold text-zinc-800">Publish</Link>
          <Link href="/insights" className="block font-semibold text-zinc-800">Insights</Link>
          <Link href="/accounts" className="block font-semibold text-zinc-800">Channels</Link>
          <Link href="/pricing" className="block font-semibold text-zinc-800">Pricing</Link>
          <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2.5">
            <Link href="/login" className="h-11 rounded-full text-center font-bold border border-zinc-300 flex items-center justify-center">
              Log in
            </Link>
            <Link href="/register" className="h-11 rounded-full text-center font-bold bg-[#98E376] flex items-center justify-center">
              Get started for free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
