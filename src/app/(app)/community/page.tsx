"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Heart,
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Bookmark,
  Share2,
  ExternalLink,
  TrendingUp,
  Zap,
  Award,
} from "lucide-react";
import {
  TwitterXIcon,
  LinkedInIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/SocialBrandIcons";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toaster";
import { useRouter } from "next/navigation";

interface SocialCommentItem {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string | null;
  platform: string;
  content: string;
  sentiment: "QUESTION" | "PRAISE" | "FEEDBACK";
  status: "UNREAD" | "READ" | "REPLIED";
  replyText?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

function useWorkspaceId() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      const json = await res.json();
      return (json.data ?? [])[0]?.id ?? null;
    },
  });
}

export default function CommunityPage() {
  const toast = useToast();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: workspaceId } = useWorkspaceId();

  const [filter, setFilter] = useState<"UNREPLIED" | "ALL" | "QUESTION" | "PRAISE">("UNREPLIED");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [isAiGenerating, setIsAiGenerating] = useState<Record<string, boolean>>({});

  // Fetch Saved Replies
  const { data: savedReplies = [] } = useQuery({
    queryKey: ["saved-replies", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/community/replies?workspaceId=${workspaceId}`);
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!workspaceId,
  });

  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: ["community-comments", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/community/comments?workspaceId=${workspaceId}`);
      const json = await res.json();
      return (json.data?.comments ?? []) as SocialCommentItem[];
    },
    enabled: !!workspaceId,
  });

  // Listen for real-time SSE comment events
  React.useEffect(() => {
    if (!workspaceId) return;
    const eventSource = new EventSource(`/api/community/events?workspaceId=${workspaceId}`);
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "NEW_COMMENT") {
          toast.success("New comment received in inbox!");
          qc.invalidateQueries({ queryKey: ["community-comments"] });
        }
      } catch {}
    };
    return () => eventSource.close();
  }, [workspaceId, qc, toast]);

  const replyMutation = useMutation({
    mutationFn: async ({ id, replyText }: { id: string; replyText: string }) => {
      const res = await fetch(`/api/community/comments/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to send reply");
      return json.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["community-comments"] });
      setReplyDrafts((prev) => ({ ...prev, [vars.id]: "" }));
      setActiveReplyId(null);
      toast.success("Reply dispatched to social channel!");
    },
    onError: (err: Error) => {
      toast.error("Could not send reply", err.message);
    },
  });

  const repliedCount = comments.filter((c) => c.status === "REPLIED" || Boolean(c.replyText)).length;
  const totalCount = comments.length;
  const responseRate = totalCount > 0 ? Math.round((repliedCount / totalCount) * 100) : 100;

  const filteredComments = comments
    .filter((c) => {
      const isReplied = c.status === "REPLIED" || Boolean(c.replyText);
      if (filter === "UNREPLIED" && isReplied) return false;
      if (filter === "QUESTION" && c.sentiment !== "QUESTION") return false;
      if (filter === "PRAISE" && c.sentiment !== "PRAISE") return false;
      if (platformFilter !== "ALL" && c.platform !== platformFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "NEWEST" ? timeB - timeA : timeA - timeB;
    });

  const handleToggleLike = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendReply = (id: string) => {
    const text = replyDrafts[id];
    if (!text || !text.trim()) return;
    replyMutation.mutate({ id, replyText: text.trim() });
  };

  const handleMarkResolved = (id: string) => {
    replyMutation.mutate({ id, replyText: "Resolved by team." });
  };

  const handleAiSuggestReply = async (comment: SocialCommentItem, mode: "friendly" | "shorten" | "formal" = "friendly") => {
    setIsAiGenerating((prev) => ({ ...prev, [comment.id]: true }));
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode === "shorten" ? "SHORTEN" : mode === "formal" ? "MORE_FORMAL" : "REWRITE",
          prompt: `Write a thoughtful, authentic customer reply to this social comment from @${comment.authorHandle}: "${comment.content}"`,
          tone: mode === "formal" ? "Professional" : "Friendly",
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.suggestions?.[0]) {
        setReplyDrafts((prev) => ({ ...prev, [comment.id]: json.data.suggestions[0] }));
        setActiveReplyId(comment.id);
        toast.success("AI reply drafted!");
      }
    } catch {
      toast.error("AI Assistant unavailable");
    } finally {
      setIsAiGenerating((prev) => ({ ...prev, [comment.id]: false }));
    }
  };

  const handleConvertToPost = async (commentId: string) => {
    try {
      const res = await fetch(`/api/community/comments/${commentId}/convert`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to convert comment");
      toast.success("Converted comment into post! Opening composer...");
      router.push(`/compose?prefill=${encodeURIComponent(json.data.post.body)}`);
    } catch (err: any) {
      toast.error("Conversion failed", err.message);
    }
  };

  const getPlatformIcon = (platform: string) => {
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
  };

  const getNativePlatformUrl = (platform: string, handle: string) => {
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
  };

  const unrepliedCount = comments.filter((c) => c.status !== "REPLIED" && !c.replyText).length;

  return (
    <div className="animate-fade-in max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Community & Social Inbox"
          description="Engage with your audience across all networks from one unified inbox. Never miss a customer question or praise."
        />
        <Button variant="secondary" size="sm" onClick={() => refetch()} className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* ── Comment Score Dashboard ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Response Rate</div>
            <div className="text-xl font-extrabold text-zinc-900">{responseRate}%</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Excellent responsiveness
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Avg Response Speed</div>
            <div className="text-xl font-extrabold text-zinc-900">14 mins</div>
            <div className="text-[10px] text-blue-600 font-semibold">Under 1 hour target</div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Consistency Score</div>
            <div className="text-xl font-extrabold text-zinc-900">98 / 100</div>
            <div className="text-[10px] text-purple-600 font-semibold">All channels active</div>
          </div>
        </div>
      </div>

      {/* Filter and Sorting Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter("UNREPLIED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === "UNREPLIED"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
            }`}
          >
            <span>Needs Reply</span>
            {unrepliedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-bold flex items-center justify-center">
                {unrepliedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter("QUESTION")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === "QUESTION"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Questions
          </button>

          <button
            onClick={() => setFilter("PRAISE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === "PRAISE"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            Praise
          </button>

          <button
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "ALL"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200"
            }`}
          >
            All History
          </button>
        </div>

        {/* Channel and Sorting dropdowns */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Channels</option>
            <option value="TWITTER">Twitter / X</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="TIKTOK">TikTok</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
          </select>
        </div>
        <div className="text-xs text-zinc-500">
          Sync status: <strong className="text-emerald-600">Live Webhooks</strong>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs">Syncing incoming social comments...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 p-8 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-bold text-base text-zinc-900">Inbox Zero achieved!</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            You’ve answered all incoming questions and messages from your connected channels.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => {
            const isReplied = comment.status === "REPLIED" || Boolean(comment.replyText);
            const isLiked = likedMap[comment.id] || false;

            return (
              <div
                key={comment.id}
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
                        onClick={() => handleToggleLike(comment.id)}
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
                          onClick={() =>
                            setActiveReplyId(
                              activeReplyId === comment.id ? null : comment.id
                            )
                          }
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      )}

                      {/* Create Post from Reply */}
                      <button
                        onClick={() => handleConvertToPost(comment.id)}
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
                          onClick={() => handleMarkResolved(comment.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-600 transition-colors ml-auto"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>

                    {/* Inline Reply Input & AI Helpers */}
                    {activeReplyId === comment.id && !isReplied && (
                      <div className="mt-3 pt-3 border-t border-zinc-100 space-y-2.5">
                        {/* Saved replies + AI shortcuts bar */}
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          {/* Saved Replies Dropdown */}
                          <div className="flex items-center gap-1.5">
                            <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                            <select
                              onChange={(e) => {
                                if (!e.target.value) return;
                                const selected = savedReplies.find((r: any) => r.id === e.target.value);
                                if (selected) {
                                  setReplyDrafts((prev) => ({ ...prev, [comment.id]: selected.content }));
                                }
                              }}
                              className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-medium text-zinc-700 outline-none"
                            >
                              <option value="">Insert Saved Reply...</option>
                              {savedReplies.map((r: any) => (
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
                              onClick={() => handleAiSuggestReply(comment, "friendly")}
                              disabled={isAiGenerating[comment.id]}
                              className="px-2 py-0.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-[11px] font-bold hover:bg-purple-100 flex items-center gap-1"
                            >
                              {isAiGenerating[comment.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-600" />}
                              AI Draft
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAiSuggestReply(comment, "shorten")}
                              disabled={isAiGenerating[comment.id]}
                              className="px-2 py-0.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 text-[11px] font-medium hover:bg-zinc-100"
                            >
                              Shorten
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAiSuggestReply(comment, "formal")}
                              disabled={isAiGenerating[comment.id]}
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
                            value={replyDrafts[comment.id] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              // Check shortcut expansion
                              const found = savedReplies.find((r: any) => val.includes(r.shortcut));
                              if (found) {
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [comment.id]: val.replace(found.shortcut, found.content),
                                }));
                              } else {
                                setReplyDrafts((prev) => ({ ...prev, [comment.id]: val }));
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSendReply(comment.id);
                            }}
                            className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={replyMutation.isPending}
                            onClick={() => handleSendReply(comment.id)}
                          >
                            {replyMutation.isPending ? (
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
          })}
        </div>
      )}
    </div>
  );
}
