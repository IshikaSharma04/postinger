"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles, HelpCircle } from "lucide-react";
import { PostingerPublicNavbar } from "@/components/layout/PostingerPublicNavbar";
import { PostingerPricingCalculator } from "@/components/home/PostingerPricingCalculator";

export default function PostingerPricingPage() {
  return (
    <div className="min-h-screen bg-[#F4F0EB] text-[#121212] font-sans antialiased selection:bg-[#C4F279] selection:text-black">
      <PostingerPublicNavbar />

      <section className="pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <PostingerPricingCalculator />
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-16 bg-white border-t border-[#E6E1D8] text-center">
        <div className="max-w-2xl mx-auto px-6 space-y-4">
          <p className="text-xl font-bold text-zinc-900 leading-snug">
            &ldquo;Postinger replaced 3 messy spreadsheets and saved our marketing team 14 hours every single week.&rdquo;
          </p>
          <div className="text-xs text-zinc-500 font-medium">
            — Sarah Lin, Head of Growth at Orbit Studio
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E6E1D8] py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Postinger Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
