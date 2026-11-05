import React from "react";
import { ComposerAccount } from "./useComposerData";

const PLATFORM_META: Record<string, { color: string; icon: string }> = {
  TWITTER: { color: "#1da1f2", icon: "X" },
  LINKEDIN: { color: "#0077b5", icon: "in" },
  INSTAGRAM: { color: "#e1306c", icon: "IG" },
  FACEBOOK: { color: "#1877f2", icon: "fb" },
  TIKTOK: { color: "#111111", icon: "TT" },
  BLUESKY: { color: "#0085ff", icon: "BS" },
  THREADS: { color: "#000000", icon: "@" },
  MASTODON: { color: "#6364ff", icon: "M" },
  PINTEREST: { color: "#e60023", icon: "P" },
};

interface ComposerPreviewProps {
  body: string;
  hashtags: string[];
  accounts: ComposerAccount[];
  selectedAccIds: string[];
  previewPlatform: string;
  onSelectPreviewPlatform: (platform: string) => void;
}

export function ComposerPreview({
  body,
  hashtags,
  accounts,
  selectedAccIds,
  previewPlatform,
  onSelectPreviewPlatform,
}: ComposerPreviewProps) {
  const activeMeta = previewPlatform ? PLATFORM_META[previewPlatform] : null;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 sticky top-6">
      <h3 className="text-sm font-bold text-zinc-900 mb-3">Live Preview</h3>
      <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-500">Preview</span>
          {previewPlatform && activeMeta && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${activeMeta.color}20`,
                color: activeMeta.color,
              }}
            >
              {previewPlatform}
            </span>
          )}
        </div>
        <div className="bg-white rounded-xl p-4 border border-zinc-100 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
              {activeMeta?.icon ?? "P"}
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">Your Account</div>
              <div className="text-[10px] text-zinc-400">@yourbrand · Just now</div>
            </div>
          </div>
          <p className="text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed">
            {body || <span className="text-zinc-300 italic">Post caption will appear here…</span>}
          </p>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {hashtags.map((tag) => (
                <span key={tag} className="text-xs text-blue-600 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Platform preview switcher */}
      {selectedAccIds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {accounts
            .filter((a) => selectedAccIds.includes(a.id))
            .map((a) => (
              <button
                key={a.id}
                onClick={() => onSelectPreviewPlatform(a.platform)}
                className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
                  previewPlatform === a.platform
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {a.platform}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
