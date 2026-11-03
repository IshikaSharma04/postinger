"use client";

import React from "react";

const BRAND_LOGOS = [
  { name: "Labs", style: "font-black tracking-tight" },
  { name: "Pizza Hut", style: "font-serif italic font-black" },
  { name: "VICE", style: "font-mono font-black tracking-widest" },
  { name: "CLASH of CLANS", style: "font-black tracking-wide uppercase" },
  { name: "METALLICA", style: "font-serif font-black tracking-tighter" },
  { name: "benefit", style: "font-serif font-semibold lowercase italic" },
  { name: "WIRED", style: "font-mono font-bold tracking-widest uppercase border-b-2 border-current pb-0.5" },
  { name: "SEMRUSH", style: "font-sans font-black tracking-tight uppercase" },
  { name: "crocs™", style: "font-sans font-black lowercase tracking-tight" },
  { name: "ElevenLabs", style: "font-sans font-bold tracking-tight" },
];

export function BufferSocialMarquee() {
  return (
    <div className="w-full overflow-hidden py-4 relative">
      {/* Edge gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAFAF8] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFAF8] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
        {/* Render twice for continuous loop */}
        {[...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS].map((brand, i) => (
          <div
            key={i}
            className="flex items-center gap-2 opacity-40 hover:opacity-80 transition-opacity grayscale hover:grayscale-0 cursor-default select-none text-zinc-800"
          >
            <span className={`text-xl sm:text-2xl ${brand.style}`}>
              {brand.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
