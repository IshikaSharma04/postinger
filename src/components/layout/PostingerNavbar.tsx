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
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import {
  TwitterXIcon,
  LinkedInIcon,
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  PinterestIcon,
} from "@/components/icons/SocialBrandIcons";

export function PostingerLogoIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className}>
      <path d="M16 2.5L2 9.5l14 7 14-7L16 2.5z" />
      <path d="M5.5 15.5L2 17.5l14 7 14-7-3.5-2L16 20.8l-10.5-5.3z" opacity="0.85" />
      <path d="M5.5 23.5L2 25.5l14 7 14-7-3.5-2L16 28.8l-10.5-5.3z" opacity="0.65" />
    </svg>
  );
}

export function PostingerNavbar() {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F4F0EB]/95 backdrop-blur-md border-b border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 text-zinc-900 group">
            <PostingerLogoIcon className="w-8 h-8 text-zinc-950 transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-2xl tracking-tight text-zinc-950">Postinger</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[15px] font-semibold text-zinc-700">
            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 hover:text-zinc-950 transition-colors py-2"
              >
                <span>Features</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {featuresOpen && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-3xl p-3 shadow-2xl border border-zinc-200/80 animate-fade-in">
                  <Link
                    href="/create"
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-100/70 text-orange-700 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                        Create
                        <span className="text-[10px] font-extrabold text-[#25523B] bg-[#C4F279]/50 px-1.5 py-0.2 rounded-md">
                          Scratchpad
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                        Build your content ideas library
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/publish"
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-900">Publish</div>
                      <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                        Plan, queue, and schedule cross-platform
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/insights"
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-900">Insights</div>
                      <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                        Best time to post & audience telemetry
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/community"
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-pink-100/70 text-pink-700 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-900">Community</div>
                      <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                        Unified social inbox & comment triage
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/start-page"
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-900">Start Page</div>
                      <p className="text-xs text-zinc-500 leading-tight mt-0.5">
                        Custom link-in-bio page builder
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Integrations Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIntegrationsOpen(true)}
              onMouseLeave={() => setIntegrationsOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 hover:text-zinc-950 transition-colors py-2"
              >
                <span>Integrations</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {integrationsOpen && (
                <div className="absolute top-full left-0 w-72 bg-white rounded-3xl p-4 shadow-2xl border border-zinc-200/80 animate-fade-in grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-50">
                    <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                    <span className="text-xs font-semibold text-zinc-800">Instagram</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-50">
                    <TwitterXIcon className="w-4 h-4 text-[#1D9BF0]" />
                    <span className="text-xs font-semibold text-zinc-800">Twitter / X</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-50">
                    <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
                    <span className="text-xs font-semibold text-zinc-800">LinkedIn</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-50">
                    <TikTokIcon className="w-4 h-4 text-black" />
                    <span className="text-xs font-semibold text-zinc-800">TikTok</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-50">
                    <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                    <span className="text-xs font-semibold text-zinc-800">Facebook</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-50">
                    <PinterestIcon className="w-4 h-4 text-[#BD081C]" />
                    <span className="text-xs font-semibold text-zinc-800">Pinterest</span>
                  </div>
                </div>
              )}
            </div>

            <Link href="/create" className="hover:text-zinc-950 transition-colors">
              Create
            </Link>
            <Link href="/pricing" className="hover:text-zinc-950 transition-colors">
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right Buttons: Log in & Mint Green CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="btn-brand-outline px-6 py-2.5 text-sm font-semibold tracking-tight"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="btn-brand-lime px-6 py-2.5 text-sm font-bold tracking-tight shadow-sm hover:shadow"
          >
            Get started for free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-zinc-900"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E6E1D8] bg-[#F4F0EB] px-6 py-4 space-y-3">
          <Link href="/create" className="block text-sm font-bold text-zinc-900">
            Create Scratchpad
          </Link>
          <Link href="/publish" className="block text-sm font-bold text-zinc-900">
            Publish & Queue
          </Link>
          <Link href="/insights" className="block text-sm font-bold text-zinc-900">
            Insights & Analytics
          </Link>
          <Link href="/community" className="block text-sm font-bold text-zinc-900">
            Community Inbox
          </Link>
          <Link href="/start-page" className="block text-sm font-bold text-zinc-900">
            Start Page (Bio)
          </Link>
          <Link href="/pricing" className="block text-sm font-bold text-zinc-900">
            Pricing
          </Link>
          <div className="pt-3 border-t border-zinc-200 flex flex-col gap-2">
            <Link href="/login" className="btn-brand-outline w-full py-2.5 text-center text-sm font-bold">
              Log in
            </Link>
            <Link href="/register" className="btn-brand-lime w-full py-2.5 text-center text-sm font-bold">
              Get started for free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
