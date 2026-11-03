"use client";

import { useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Crop, ArrowRight, Download } from "lucide-react";

const SIZES = [
  { platform: "Instagram Feed", aspect: "1:1 Square", width: 1080, height: 1080 },
  { platform: "Instagram Portrait", aspect: "4:5 Vertical", width: 1080, height: 1350 },
  { platform: "Stories & Reels / TikTok", aspect: "9:16 Fullscreen", width: 1080, height: 1920 },
  { platform: "Twitter / X Post", aspect: "16:9 Landscape", width: 1200, height: 675 },
  { platform: "LinkedIn Post", aspect: "1.91:1 Banner", width: 1200, height: 627 },
  { platform: "YouTube Thumbnail", aspect: "16:9 HD", width: 1280, height: 720 },
];

export default function ImageResizerPage() {
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Free Creator Tool
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          Social Media Image Aspect Resizer
        </h1>
        <p className="text-sm text-zinc-600 max-w-xl mx-auto">
          Fit your creative visuals to the exact native dimensions of Instagram, Twitter, LinkedIn, TikTok, and YouTube.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Aspect presets */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Platform Presets</h2>
          {SIZES.map((sz) => (
            <button
              key={sz.platform}
              onClick={() => setSelectedSize(sz)}
              className={`w-full text-left p-3 rounded-2xl border text-xs transition-all ${
                selectedSize.platform === sz.platform
                  ? "border-blue-600 bg-blue-50/70 font-bold text-blue-900 shadow-xs"
                  : "border-zinc-200 hover:border-zinc-300 text-zinc-700"
              }`}
            >
              <div className="font-bold">{sz.platform}</div>
              <div className="text-[11px] text-zinc-500 font-mono">
                {sz.width} × {sz.height} ({sz.aspect})
              </div>
            </button>
          ))}
        </div>

        {/* Preview Frame */}
        <div className="md:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">{selectedSize.platform} Preview</h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                {selectedSize.width} × {selectedSize.height} px
              </p>
            </div>
            <label className="btn-buffer-dark px-3 py-1.5 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#C4F279]" />
              Upload Image
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="w-full bg-zinc-100 rounded-2xl p-4 flex items-center justify-center min-h-[300px] overflow-hidden border border-zinc-200">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="rounded-xl object-cover max-h-[350px] shadow-sm transition-all"
                style={{
                  aspectRatio: `${selectedSize.width} / ${selectedSize.height}`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-3xl p-8 text-center space-y-3">
        <h3 className="text-base font-bold text-zinc-900">Upload once, publish across 12 channels automatically</h3>
        <p className="text-xs text-zinc-600 max-w-md mx-auto">
          Postinger automatically adapts your media attachments and captions per platform so you never have to manually re-upload.
        </p>
        <Link href="/register" className="btn-buffer-lime text-xs px-5 py-2.5 font-bold inline-flex items-center gap-1.5 shadow-sm">
          Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
