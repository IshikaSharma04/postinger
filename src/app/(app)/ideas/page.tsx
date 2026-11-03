"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Sparkles,
  ArrowRight,
  Trash2,
  Tag,
  Search,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  LayoutGrid,
  Columns,
  Share2,
  Loader2,
  Rss,
  ExternalLink,
  Image as ImageIcon,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { POST_TEMPLATES } from "@/lib/templates/post-templates";

interface TagItem {
  text: string;
  bg: string;
  color: string;
}

interface IdeaCard {
  id: string;
  title: string;
  notes: string;
  imageUrl?: string;
  tags: TagItem[];
  status: "UNASSIGNED" | "REVIEW" | "DONE";
  createdAt: string;
}

const TAG_PALETTE: { bg: string; color: string }[] = [
  { bg: "bg-purple-50", color: "text-purple-700" },
  { bg: "bg-blue-50", color: "text-blue-700" },
  { bg: "bg-orange-50", color: "text-orange-700" },
  { bg: "bg-amber-50", color: "text-amber-700" },
  { bg: "bg-emerald-50", color: "text-emerald-700" },
  { bg: "bg-pink-50", color: "text-pink-700" },
];

function formatTags(tagList: string[]): TagItem[] {
  return tagList.map((t, idx) => {
    const palette = TAG_PALETTE[idx % TAG_PALETTE.length];
    return {
      text: t,
      bg: palette.bg,
      color: palette.color,
    };
  });
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

export default function InAppIdeasPage() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { data: workspaceId } = useWorkspaceId();

  const [topTab, setTopTab] = useState<"IDEAS" | "TEMPLATES" | "FEEDS">("IDEAS");
  const [viewMode, setViewMode] = useState<"BOARD" | "GALLERY">("BOARD");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // New Idea Form State
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagInput, setTagInput] = useState("Video, Tips");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedTitle, setNewFeedTitle] = useState("");
  const [isSyncingFeeds, setIsSyncingFeeds] = useState(false);

  // Fetch RSS Feeds
  const { data: rssFeeds = [], refetch: refetchFeeds } = useQuery({
    queryKey: ["rss-feeds", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/rss?workspaceId=${workspaceId}`);
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!workspaceId,
  });

  // Fetch Ideas from Database
  const { data: dbIdeas = [], isLoading } = useQuery({
    queryKey: ["ideas", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/ideas?workspaceId=${workspaceId}`);
      const json = await res.json();
      if (!json.success || !json.data?.ideas) return [];
      return json.data.ideas.map((item: any) => ({
        id: item.id,
        title: item.title,
        notes: item.content || "",
        imageUrl: item.mediaUrl || undefined,
        tags: formatTags(item.tags || []),
        status: item.status as "UNASSIGNED" | "REVIEW" | "DONE",
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      })) as IdeaCard[];
    },
    enabled: !!workspaceId,
  });

  // Seed default ideas if user has no ideas yet
  const createIdeaMutation = useMutation({
    mutationFn: async (payload: { title: string; content?: string; mediaUrl?: string; tags?: string[]; status?: string }) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: payload.title,
          content: payload.content || "",
          mediaUrl: payload.mediaUrl,
          tags: payload.tags || [],
          status: payload.status || "UNASSIGNED",
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create idea");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("New idea added to your scratchpad!");
    },
    onError: (err: Error) => {
      toast.error("Could not save idea", err.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "UNASSIGNED" | "REVIEW" | "DONE" }) => {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update status");
      return json.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["ideas"] });
      toast.success(`Idea moved to ${vars.status.toLowerCase()}!`);
    },
    onError: (err: Error) => {
      toast.error("Could not move idea", err.message);
    },
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete idea");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea removed");
    },
    onError: (err: Error) => {
      toast.error("Could not delete idea", err.message);
    },
  });

  const convertToPostMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ideas/${id}/convert`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to convert idea");
      return json.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Converted to draft post! Opening Composer...");
      router.push(`/compose?prefill=${encodeURIComponent(data.post.body)}`);
    },
    onError: (err: Error) => {
      toast.error("Conversion failed", err.message);
    },
  });

  const cards = dbIdeas;
  const unassignedCards = cards.filter((c) => c.status === "UNASSIGNED");
  const reviewCards = cards.filter((c) => c.status === "REVIEW");
  const doneCards = cards.filter((c) => c.status === "DONE");

  const handleMoveStatus = (id: string, newStatus: IdeaCard["status"]) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDeleteCard = (id: string) => {
    deleteIdeaMutation.mutate(id);
  };

  const handleTurnIntoPost = (card: IdeaCard) => {
    convertToPostMutation.mutate(card.id);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    createIdeaMutation.mutate({
      title: title.trim(),
      content: notes.trim(),
      mediaUrl: imageUrl.trim() || undefined,
      tags: parsedTags.length ? parsedTags : ["General"],
      status: "UNASSIGNED",
    });

    setTitle("");
    setNotes("");
    setImageUrl("");
    setShowAddModal(false);
  };

  const handleAiBrainstorm = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "IDEAS",
          prompt: "Creative viral social media ideas for design, creator lifestyle, and tech",
          tone: "Casual",
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.suggestions?.length) {
        for (const s of json.data.suggestions.slice(0, 2)) {
          await createIdeaMutation.mutateAsync({
            title: s.split("\n")[0].slice(0, 60),
            content: s,
            tags: ["AI Fresh", "Hooks"],
            status: "UNASSIGNED",
          });
        }
        toast.success("Generated 2 ideas with AI Assistant!");
      }
    } catch {
      toast.error("AI service busy");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
      {/* ── Buffer Create Header Bar (Matches Screenshot) ── */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <h2 className="font-extrabold text-xl text-zinc-900 tracking-tight">Create</h2>

          {/* Sub-tabs: Ideas, Templates, Feeds */}
          <div className="flex items-center gap-1">
            {(["IDEAS", "TEMPLATES", "FEEDS"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTopTab(t)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all capitalize ${
                  topTab === t
                    ? "bg-zinc-100 text-zinc-900 font-bold"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {t.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Controls: Board / Gallery, AI, + New Idea */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center p-1 bg-zinc-100 rounded-xl text-xs font-semibold text-zinc-600">
            <button
              onClick={() => setViewMode("BOARD")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                viewMode === "BOARD" ? "bg-white text-zinc-900 shadow-xs font-bold" : ""
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Board
            </button>
            <button
              onClick={() => setViewMode("GALLERY")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                viewMode === "GALLERY" ? "bg-white text-zinc-900 shadow-xs font-bold" : ""
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Gallery
            </button>
          </div>

          <button
            onClick={handleAiBrainstorm}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors shadow-xs"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
            AI Ideas
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-buffer-dark inline-flex items-center gap-1.5 text-xs px-4 py-2 font-bold shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            New idea
          </button>
        </div>
      </div>

      {/* ── Sub-tab 1: Templates Library ── */}
      {topTab === "TEMPLATES" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Proven Content Templates</h3>
              <p className="text-xs text-zinc-500">Battle-tested frameworks with fill-in placeholders for high-engagement social posts</p>
            </div>
            <span className="text-xs font-mono font-bold bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-xl">
              {POST_TEMPLATES.length} Templates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POST_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {tmpl.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 mb-1">{tmpl.title}</h4>
                  <p className="text-xs text-zinc-500 mb-3">{tmpl.description}</p>
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 text-[11px] text-zinc-700 font-mono whitespace-pre-wrap leading-relaxed mb-3 max-h-36 overflow-y-auto">
                    {tmpl.body}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {tmpl.hashtags.slice(0, 2).map((h) => (
                      <span key={h} className="text-[10px] text-zinc-400 font-mono">
                        #{h}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const fullContent = `${tmpl.body}\n\n${tmpl.hashtags.map((h) => `#${h}`).join(" ")}`;
                      router.push(`/compose?prefill=${encodeURIComponent(fullContent)}`);
                    }}
                    className="btn-buffer-lime text-xs px-3 py-1.5 font-bold inline-flex items-center gap-1 shadow-xs"
                  >
                    Use in composer →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : topTab === "FEEDS" ? (
        /* ── Sub-tab 2: RSS Feed Subscriptions ── */
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <h3 className="text-base font-bold text-zinc-900 mb-1">RSS Content Feeds</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Subscribe to blogs, newsletters, and publication feeds. New articles will automatically land in your Ideas scratchpad ready to repurpose.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newFeedUrl || !workspaceId) return;
                try {
                  const res = await fetch("/api/rss", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      workspaceId,
                      url: newFeedUrl,
                      title: newFeedTitle || undefined,
                    }),
                  });
                  const json = await res.json();
                  if (!json.success) throw new Error(json.error ?? "Failed to add feed");
                  toast.success("RSS feed subscribed and initial articles imported!");
                  setNewFeedUrl("");
                  setNewFeedTitle("");
                  refetchFeeds();
                  qc.invalidateQueries({ queryKey: ["ideas"] });
                } catch (err: any) {
                  toast.error("Could not add feed", err.message);
                }
              }}
              className="flex flex-col sm:flex-row gap-2.5 items-center"
            >
              <input
                type="text"
                placeholder="Feed Title (e.g. TechCrunch Tech)"
                value={newFeedTitle}
                onChange={(e) => setNewFeedTitle(e.target.value)}
                className="w-full sm:w-1/3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="url"
                placeholder="https://example.com/feed.xml"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                required
                className="w-full sm:flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="btn-buffer-dark text-xs px-4 py-2 font-bold w-full sm:w-auto flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1 inline" />
                Subscribe Feed
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h4 className="text-sm font-bold text-zinc-900">Active RSS Subscriptions ({rssFeeds.length})</h4>
              <button
                onClick={async () => {
                  setIsSyncingFeeds(true);
                  try {
                    // Trigger refetch
                    await refetchFeeds();
                    await qc.invalidateQueries({ queryKey: ["ideas"] });
                    toast.success("Feeds synced with latest articles!");
                  } finally {
                    setIsSyncingFeeds(false);
                  }
                }}
                disabled={isSyncingFeeds || rssFeeds.length === 0}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {isSyncingFeeds ? <Loader2 className="w-3 h-3 animate-spin" /> : <Rss className="w-3 h-3" />}
                Sync all feeds
              </button>
            </div>

            {rssFeeds.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <Rss className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No RSS subscriptions added yet. Add an industry feed above to automate ideas.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {rssFeeds.map((feed: any) => (
                  <div key={feed.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">{feed.title || "RSS Feed"}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {feed.lastFetchedAt ? `Synced ${new Date(feed.lastFetchedAt).toLocaleTimeString()}` : "Pending sync"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono truncate max-w-md">{feed.url}</p>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await fetch(`/api/rss?id=${feed.id}&workspaceId=${workspaceId}`, { method: "DELETE" });
                          refetchFeeds();
                          toast.success("Feed unsubscribed");
                        } catch {
                          toast.error("Failed to delete feed");
                        }
                      }}
                      className="text-zinc-400 hover:text-red-500 p-1"
                      title="Unsubscribe feed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs">Loading scratchpad ideas...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-[#FAF8F5] rounded-3xl p-12 text-center border border-[#E8E2D8]">
          <Sparkles className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900 mb-1">Your scratchpad is empty</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
            Jot down quick thoughts, brainstorm hooks with AI, or save multimedia concepts before turning them into scheduled posts.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-buffer-dark text-xs px-4 py-2 font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1 inline" />
              Create your first idea
            </button>
            <button
              onClick={handleAiBrainstorm}
              disabled={isGenerating}
              className="btn-buffer-lime text-xs px-4 py-2 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 inline" />
              Brainstorm with AI
            </button>
          </div>
        </div>
      ) : viewMode === "BOARD" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* Column 1: Unassigned */}
          <div className="bg-[#FAF8F5] rounded-3xl p-4 border border-[#E8E2D8] shadow-xs">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                Unassigned
              </span>
              <span className="w-5 h-5 rounded-full bg-white text-zinc-600 text-xs font-mono font-bold flex items-center justify-center border border-zinc-200 shadow-xs">
                {unassignedCards.length}
              </span>
            </div>

            <div className="space-y-3.5">
              {unassignedCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-sm hover:shadow-md transition-all group"
                >
                  {card.imageUrl && (
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 bg-zinc-100">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-sm text-zinc-900 leading-snug">
                      {card.title}
                    </h4>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity p-0.5"
                      title="Delete idea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {Boolean(card.notes) && (
                    <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                      {card.notes}
                    </p>
                  )}

                  {/* Pastel Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {card.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${t.bg} ${t.color}`}
                      >
                        {t.text}
                      </span>
                    ))}
                  </div>

                  {/* Card Controls */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleTurnIntoPost(card)}
                      className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Turn into Post <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleMoveStatus(card.id, "REVIEW")}
                      className="text-zinc-400 hover:text-zinc-900 font-semibold text-[11px] flex items-center gap-0.5"
                      title="Move to Review"
                    >
                      Review <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Review */}
          <div className="bg-[#FAF8F5] rounded-3xl p-4 border border-[#E8E2D8] shadow-xs">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                Review
              </span>
              <span className="w-5 h-5 rounded-full bg-white text-zinc-600 text-xs font-mono font-bold flex items-center justify-center border border-zinc-200 shadow-xs">
                {reviewCards.length}
              </span>
            </div>

            <div className="space-y-3.5">
              {reviewCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-sm hover:shadow-md transition-all group"
                >
                  {card.imageUrl && (
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 bg-zinc-100">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-sm text-zinc-900 leading-snug">
                      {card.title}
                    </h4>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity p-0.5"
                      title="Delete idea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {Boolean(card.notes) && (
                    <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                      {card.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {card.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${t.bg} ${t.color}`}
                      >
                        {t.text}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleMoveStatus(card.id, "UNASSIGNED")}
                      className="text-zinc-400 hover:text-zinc-900 font-semibold text-[11px] flex items-center gap-0.5"
                    >
                      <ChevronLeft className="w-3 h-3" /> Back
                    </button>

                    <button
                      onClick={() => handleMoveStatus(card.id, "DONE")}
                      className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-0.5"
                    >
                      Done <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Done */}
          <div className="bg-[#FAF8F5] rounded-3xl p-4 border border-[#E8E2D8] shadow-xs">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                Done & Scheduled
              </span>
              <span className="w-5 h-5 rounded-full bg-white text-zinc-600 text-xs font-mono font-bold flex items-center justify-center border border-zinc-200 shadow-xs">
                {doneCards.length}
              </span>
            </div>

            <div className="space-y-3.5">
              {doneCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-sm opacity-90 hover:opacity-100 transition-all group"
                >
                  {card.imageUrl && (
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 bg-zinc-100">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Scheduled to Publish
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity p-0.5"
                      title="Delete idea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-zinc-900 mb-1 leading-snug">
                    {card.title}
                  </h4>
                  {Boolean(card.notes) && (
                    <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                      {card.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {card.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${t.bg} ${t.color}`}
                      >
                        {t.text}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Gallery View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm hover:shadow-md transition-all group"
            >
              {card.imageUrl && (
                <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 bg-zinc-100">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-sm text-zinc-900 line-clamp-1">{card.title}</h4>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity p-0.5"
                  title="Delete idea"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{card.notes}</p>
              <button
                onClick={() => handleTurnIntoPost(card)}
                className="w-full py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
              >
                Compose Post
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-extrabold text-base text-zinc-900 mb-1">
              Add New Content Idea
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Jot down concepts, attach an image link, and assign tags.
            </p>

            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Idea Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10 Rules of Visual Content Design"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Key takeaways, references..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Video, Before + After, Tips"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  className="btn-buffer-lime px-4 py-2 text-xs font-bold"
                >
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
