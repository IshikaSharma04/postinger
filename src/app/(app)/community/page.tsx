"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  CheckCircle2,
  HelpCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toaster";
import { useRouter } from "next/navigation";
import { CommunityScoreStrip } from "@/components/community/CommunityScoreStrip";
import { SocialCommentCard } from "@/components/community/SocialCommentCard";
import { SocialCommentItem, SavedReply } from "@/components/community/types";

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
  const { data: savedReplies = [] } = useQuery<SavedReply[]>({
    queryKey: ["saved-replies", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/community/replies?workspaceId=${workspaceId}`);
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!workspaceId,
  });

  const { data: comments = [], isLoading, refetch } = useQuery<SocialCommentItem[]>({
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
  const unrepliedCount = comments.filter((c) => c.status !== "REPLIED" && !c.replyText).length;

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to convert";
      toast.error("Conversion failed", message);
    }
  };

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
      <CommunityScoreStrip responseRate={responseRate} />

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
            onChange={(e) => setSortOrder(e.target.value as "NEWEST" | "OLDEST")}
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
          {filteredComments.map((comment) => (
            <SocialCommentCard
              key={comment.id}
              comment={comment}
              savedReplies={savedReplies}
              isLiked={likedMap[comment.id] || false}
              onToggleLike={handleToggleLike}
              isActiveReply={activeReplyId === comment.id}
              onToggleActiveReply={() =>
                setActiveReplyId(activeReplyId === comment.id ? null : comment.id)
              }
              replyDraft={replyDrafts[comment.id] || ""}
              onReplyDraftChange={(text) =>
                setReplyDrafts((prev) => ({ ...prev, [comment.id]: text }))
              }
              onSendReply={() => handleSendReply(comment.id)}
              onMarkResolved={() => handleMarkResolved(comment.id)}
              onConvertToPost={() => handleConvertToPost(comment.id)}
              onAiSuggestReply={(mode) => handleAiSuggestReply(comment, mode)}
              isAiGenerating={isAiGenerating[comment.id] || false}
              isReplying={replyMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
