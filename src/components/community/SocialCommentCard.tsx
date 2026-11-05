"use client";

import {
  MessageSquare,
  Heart,
  Send,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  Bookmark,
  Share2,
  ExternalLink,
} from "lucide-react";
import {
  TwitterXIcon,
  LinkedInIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/SocialBrandIcons";
import { Button } from "@/components/ui/Button";
import { SocialCommentItem, SavedReply } from "./types";

interface SocialCommentCardProps {
  comment: SocialCommentItem;
  savedReplies: SavedReply[];
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  isActiveReply: boolean;
  onToggleActiveReply: () => void;
  replyDraft: string;
  onReplyDraftChange: (text: string) => void;
  onSendReply: () => void;
  onMarkResolved: () => void;
  onConvertToPost: () => void;
  onAiSuggestReply: (mode: "friendly" | "shorten" | "formal") => void;
  isAiGenerating: boolean;
  isReplying: boolean;
}

function getPlatformIcon(platform: string) {
  switch (platform.toUpperCase()) {
    case "TWITTER":
      return <TwitterXIcon className="w-3.5 h-3.5 text-[#1D9BF0]" />;
    case "LINKEDIN":
      return <LinkedInIcon className="w-3.5 h-3.5 text-[#0A66C2]" />;
    case "INSTAGRAM":
      return <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />;
    case "TIKTOK":
      return <TikTokIcon className="w-3.5 h-3.5 text-black" />;
    default:
      return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
  }
}

function getNativePlatformUrl(platform: string, handle: string) {
  const clean = handle.replace(/^@/, "");
  switch (platform.toUpperCase()) {
    case "TWITTER":
      return `https://twitter.com/${clean}`;
    case "INSTAGRAM":
      return `https://instagram.com/${clean}`;
    case "LINKEDIN":
      return `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(clean)}`;
    case "TIKTOK":
      return `https://tiktok.com/@${clean}`;
    default:
      return "#";
  }
}

export function SocialCommentCard({
  comment,
  savedReplies,
  isLiked,
  onToggleLike,
  isActiveReply,
  onToggleActiveReply,
  replyDraft,
  onReplyDraftChange,
  onSendReply,
  onMarkResolved,
  onConvertToPost,
  onAiSuggestReply,
  isAiGenerating,
  isReplying,
}: SocialCommentCardProps) {
  const isReplied = comment.status === "REPLIED" || Boolean(comment.replyText);

  return (
    <div
      className={`rounded-2xl border transition-all p-5 shadow-xs ${
        isReplied
          ? "bg-zinc-50/60 border-zinc-200"
          : "bg-white border-zinc-300 ring-1 ring-zinc-200/50"
      }`}
    >
      {/* Top Context Bar: Original Post & Platform */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 pb-2 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-zinc-100 flex items-center justify-center">
            {getPlatformIcon(comment.platform)}
          </div>
          <span className="font-semibold text-zinc-700 capitalize">
            {comment.platform.toLowerCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <Clock className="w-3 h-3" />
          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Author & Comment Body */}
      <div className="flex items-start gap-3.5">
        <img
          src={comment.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
          alt={comment.authorName}
          className="w-10 h-10 rounded-full object-cover border border-zinc-200 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-zinc-900">
              {comment.authorName}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {comment.authorHandle}
            </span>

            {comment.sentiment === "QUESTION" && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 ml-auto">
                ❓ Question
              </span>
            )}
            {comment.sentiment === "PRAISE" && (
              <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200 ml-auto">
                ❤️ Praise
              </span>
            )}
            {comment.sentiment === "FEEDBACK" && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 ml-auto">
                💡 Feedback
              </span>
            )}
          </div>

          <p className="text-sm text-zinc-800 leading-relaxed">
            {comment.content}
          </p>

          {/* Existing Reply Display */}
          {Boolean(comment.replyText) && (
            <div className="mt-3 p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs">
              <div className="font-bold text-blue-900 flex items-center gap-1 mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Your Reply
              </div>
              <p className="text-zinc-700">{comment.replyText}</p>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center flex-wrap gap-3 mt-4 pt-3 border-t border-zinc-100">
            <button
              onClick={() => onToggleLike(comment.id)}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                isLiked ? "text-pink-600" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-pink-600 text-pink-600" : ""}`}
              />
              <span>{isLiked ? "Liked" : "Like"}</span>
            </button>

            {!isReplied && (
              <button
                onClick={onToggleActiveReply}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}

            {/* Create Post from Reply */}
            <button
              onClick={onConvertToPost}
              className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
              title="Spin this discussion into a new social post"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Create Post from Reply</span>
            </button>

            {/* Native Platform Link */}
            <a
              href={getNativePlatformUrl(comment.platform, comment.authorHandle)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              title="View comment directly on native social network"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View on {comment.platform}</span>
            </a>

            {!isReplied && (
              <button
                onClick={onMarkResolved}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-600 transition-colors ml-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Resolved</span>
              </button>
            )}
          </div>

          {/* Inline Reply Input & AI Helpers */}
          {isActiveReply && !isReplied && (
            <div className="mt-3 pt-3 border-t border-zinc-100 space-y-2.5">
              {/* Saved replies + AI shortcuts bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                {/* Saved Replies Dropdown */}
                <div className="flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                  <select
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const selected = savedReplies.find((r) => r.id === e.target.value);
                      if (selected) {
                        onReplyDraftChange(selected.content);
                      }
                    }}
                    className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-medium text-zinc-700 outline-none"
                  >
                    <option value="">Insert Saved Reply...</option>
                    {savedReplies.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.shortcut} — {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AI Tone Options */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onAiSuggestReply("friendly")}
                    disabled={isAiGenerating}
                    className="px-2 py-0.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-[11px] font-bold hover:bg-purple-100 flex items-center gap-1"
                  >
                    {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-600" />}
                    AI Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => onAiSuggestReply("shorten")}
                    disabled={isAiGenerating}
                    className="px-2 py-0.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 text-[11px] font-medium hover:bg-zinc-100"
                  >
                    Shorten
                  </button>
                  <button
                    type="button"
                    onClick={() => onAiSuggestReply("formal")}
                    disabled={isAiGenerating}
                    className="px-2 py-0.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 text-[11px] font-medium hover:bg-zinc-100"
                  >
                    More Formal
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Reply to @${comment.authorHandle} (type :thanks for shortcut)...`}
                  value={replyDraft}
                  onChange={(e) => {
                    const val = e.target.value;
                    const found = savedReplies.find((r) => val.includes(r.shortcut));
                    if (found) {
                      onReplyDraftChange(val.replace(found.shortcut, found.content));
                    } else {
                      onReplyDraftChange(val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSendReply();
                  }}
                  className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isReplying}
                  onClick={onSendReply}
                >
                  {isReplying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 mr-1" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
