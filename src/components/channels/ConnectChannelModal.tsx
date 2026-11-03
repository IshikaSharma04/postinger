"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export interface ChannelMeta {
  platform: string;
  name: string;
  type: string;
  color: string;
  bg: string;
  autoPublish: boolean;
  requiresNotice: boolean;
  description: string;
}

export const ALL_SUPPORTED_CHANNELS: ChannelMeta[] = [
  { platform: "TWITTER", name: "Twitter / X", type: "Profile", color: "#000000", bg: "bg-black", autoPublish: true, requiresNotice: false, description: "Auto-publishes posts and multi-part threads" },
  { platform: "LINKEDIN", name: "LinkedIn", type: "Profile & Company Page", color: "#0A66C2", bg: "bg-[#0A66C2]", autoPublish: true, requiresNotice: false, description: "Auto-publishes text, carousels, and image posts" },
  { platform: "INSTAGRAM", name: "Instagram", type: "Business & Creator", color: "#E4405F", bg: "bg-[#E4405F]", autoPublish: true, requiresNotice: false, description: "Direct publish for Feed, Reels; Reminder for Stories" },
  { platform: "FACEBOOK", name: "Facebook", type: "Pages & Groups", color: "#1877F2", bg: "bg-[#1877F2]", autoPublish: true, requiresNotice: false, description: "Auto-publishes directly to Facebook Pages" },
  { platform: "TIKTOK", name: "TikTok", type: "Business & Personal", color: "#000000", bg: "bg-black", autoPublish: false, requiresNotice: true, description: "Direct video push or notification reminder" },
  { platform: "THREADS", name: "Threads", type: "Profile", color: "#000000", bg: "bg-black", autoPublish: true, requiresNotice: false, description: "Auto-publishes text updates and photo sets" },
  { platform: "YOUTUBE", name: "YouTube Shorts", type: "Channel", color: "#FF0000", bg: "bg-[#FF0000]", autoPublish: false, requiresNotice: true, description: "Schedules and pushes YouTube Shorts video content" },
  { platform: "PINTEREST", name: "Pinterest", type: "Boards", color: "#BD081C", bg: "bg-[#BD081C]", autoPublish: true, requiresNotice: false, description: "Pins with destination links and descriptions" },
  { platform: "GOOGLE_BUSINESS", name: "Google Business", type: "Locations", color: "#4285F4", bg: "bg-[#4285F4]", autoPublish: true, requiresNotice: false, description: "Local business updates, offers, and events" },
  { platform: "BLUESKY", name: "Bluesky", type: "Handle / AT Protocol", color: "#0085FF", bg: "bg-[#0085FF]", autoPublish: true, requiresNotice: false, description: "Open decentralized microblogging via AT Protocol" },
  { platform: "MASTODON", name: "Mastodon", type: "Fediverse Instance", color: "#6364FF", bg: "bg-[#6364FF]", autoPublish: true, requiresNotice: false, description: "Open federation posts across any Mastodon instance" },
  { platform: "SUBSTACK_NOTES", name: "Substack Notes", type: "Publication", color: "#FF6719", bg: "bg-[#FF6719]", autoPublish: true, requiresNotice: false, description: "Publish notes to your publication subscribers" },
];

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function ConnectChannelModal({ isOpen, onClose, workspaceId }: ConnectModalProps) {
  const queryClient = useQueryClient();
  const [selectedChannel, setSelectedChannel] = useState<ChannelMeta | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [customHandle, setCustomHandle] = useState("");
  const [customDisplayName, setCustomDisplayName] = useState("");

  if (!isOpen) return null;

  const handleStartConnect = (ch: ChannelMeta) => {
    setSelectedChannel(ch);
    setCustomHandle(`creator_${ch.platform.toLowerCase().slice(0, 5)}`);
    setCustomDisplayName(`Creative ${ch.name}`);
  };

  const handleAuthorizeSandbox = async () => {
    if (!selectedChannel) return;
    setConnecting(true);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          platform: selectedChannel.platform,
          handle: customHandle.replace(/^@/, "").trim(),
          displayName: customDisplayName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect channel");
      }

      toast.success(`${selectedChannel.name} connected successfully in Sandbox mode!`);
      queryClient.invalidateQueries({ queryKey: ["social-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      setSelectedChannel(null);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Could not connect account");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Connect a Social Channel</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Select any of the 12 networks to publish, schedule, and analyze content.
            </p>
          </div>
          <button
            onClick={() => { setSelectedChannel(null); onClose(); }}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!selectedChannel ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_SUPPORTED_CHANNELS.map((ch) => (
                <button
                  key={ch.platform}
                  onClick={() => handleStartConnect(ch)}
                  className="p-4 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60 text-left transition-all flex items-start gap-3 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-xs"
                    style={{ backgroundColor: ch.color }}
                  >
                    {ch.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {ch.name}
                      </span>
                      {ch.autoPublish ? (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Auto-Publish
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Notification
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{ch.type}</div>
                    <div className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{ch.description}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Realistic Mock Authorization Screen */
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                  style={{ backgroundColor: selectedChannel.color }}
                >
                  {selectedChannel.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">
                    Authorize Postinger on {selectedChannel.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Sandbox Mode (No API keys needed)
                    </span>
                    <span className="text-[11px] text-zinc-400">· Ready to test immediately</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">
                    Profile Handle / Username
                  </label>
                  <input
                    type="text"
                    value={customHandle}
                    onChange={(e) => setCustomHandle(e.target.value)}
                    className="w-full text-xs bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    placeholder="e.g. brand_official"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={customDisplayName}
                    onChange={(e) => setCustomDisplayName(e.target.value)}
                    className="w-full text-xs bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g. Acme Brand Inc."
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-zinc-200 text-xs text-zinc-600 space-y-1">
                <div className="font-bold text-zinc-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Requested Permissions:
                </div>
                <ul className="list-disc list-inside text-[11px] text-zinc-500 pl-1 space-y-0.5">
                  <li>Publish content, reels, threads, and pins to your profile</li>
                  <li>Read follower feedback and incoming comments for Community Inbox</li>
                  <li>Access posting engagement telemetry and best-time statistics</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-200/60 transition-colors"
                >
                  ← Choose different channel
                </button>

                <button
                  type="button"
                  disabled={connecting || !customHandle.trim()}
                  onClick={handleAuthorizeSandbox}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
                >
                  {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Authorize & Connect Channel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Free Plan supports up to 3 connected channels.</span>
          <span className="font-semibold text-zinc-600">Postinger Channel Ecosystem</span>
        </div>
      </div>
    </div>
  );
}
