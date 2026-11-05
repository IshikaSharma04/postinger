"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Sparkles,
  Search,
  LayoutGrid,
  Columns,
  Rss,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { POST_TEMPLATES } from "@/lib/templates/post-templates";
import { useIdeas, IdeaCard as IdeaCardType } from "@/components/ideas/useIdeas";
import { IdeaCardItem } from "@/components/ideas/IdeaCard";
import { AddIdeaModal } from "@/components/ideas/AddIdeaModal";

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

export default function IdeasPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: workspaceId } = useWorkspaceId();
  const { ideas, isLoading, createIdea, updateStatus, deleteIdea } = useIdeas(workspaceId);

  const [topTab, setTopTab] = useState<"IDEAS" | "TEMPLATES" | "FEEDS">("IDEAS");
  const [viewMode, setViewMode] = useState<"BOARD" | "GALLERY">("BOARD");
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const unassignedCards = ideas.filter((c) => c.status === "UNASSIGNED");
  const reviewCards = ideas.filter((c) => c.status === "REVIEW");
  const doneCards = ideas.filter((c) => c.status === "DONE");

  function handleTurnIntoPost(card: IdeaCardType) {
    const text = card.notes ? `${card.title}\n\n${card.notes}` : card.title;
    localStorage.setItem("postinger_compose_prefill", text);
    router.push("/compose");
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Content Ideas Bank</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Collect inspiration, brainstorm captions, and convert winning ideas into scheduled posts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <Plus className="w-3.5 h-3.5" />
            New Idea
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          {(["IDEAS", "TEMPLATES", "FEEDS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTopTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                topTab === tab
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {tab === "IDEAS" ? "Scratchpad" : tab === "TEMPLATES" ? "Templates Library" : "RSS Feeds"}
            </button>
          ))}
        </div>

        {topTab === "IDEAS" && (
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("BOARD")}
              className={`p-1.5 rounded-lg ${viewMode === "BOARD" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500"}`}
              title="Board view"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("GALLERY")}
              className={`p-1.5 rounded-lg ${viewMode === "GALLERY" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500"}`}
              title="Gallery view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {topTab === "IDEAS" && (
        <>
          {viewMode === "BOARD" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Unassigned */}
              <div className="bg-[#FAF8F5] rounded-3xl p-4 border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                    Ideas Scratchpad
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white text-zinc-600 text-xs font-mono font-bold flex items-center justify-center border border-zinc-200 shadow-xs">
                    {unassignedCards.length}
                  </span>
                </div>
                <div className="space-y-3.5">
                  {unassignedCards.map((card) => (
                    <IdeaCardItem
                      key={card.id}
                      card={card}
                      onTurnIntoPost={handleTurnIntoPost}
                      onMoveStatus={updateStatus}
                      onDelete={deleteIdea}
                    />
                  ))}
                </div>
              </div>

              {/* Review */}
              <div className="bg-[#FAF8F5] rounded-3xl p-4 border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                    In Review
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white text-zinc-600 text-xs font-mono font-bold flex items-center justify-center border border-zinc-200 shadow-xs">
                    {reviewCards.length}
                  </span>
                </div>
                <div className="space-y-3.5">
                  {reviewCards.map((card) => (
                    <IdeaCardItem
                      key={card.id}
                      card={card}
                      onTurnIntoPost={handleTurnIntoPost}
                      onMoveStatus={updateStatus}
                      onDelete={deleteIdea}
                    />
                  ))}
                </div>
              </div>

              {/* Done */}
              <div className="bg-[#FAF8F5] rounded-3xl p-4 border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                    Done &amp; Scheduled
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white text-zinc-600 text-xs font-mono font-bold flex items-center justify-center border border-zinc-200 shadow-xs">
                    {doneCards.length}
                  </span>
                </div>
                <div className="space-y-3.5">
                  {doneCards.map((card) => (
                    <IdeaCardItem
                      key={card.id}
                      card={card}
                      onTurnIntoPost={handleTurnIntoPost}
                      onMoveStatus={updateStatus}
                      onDelete={deleteIdea}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ideas.map((card) => (
                <IdeaCardItem
                  key={card.id}
                  card={card}
                  onTurnIntoPost={handleTurnIntoPost}
                  onMoveStatus={updateStatus}
                  onDelete={deleteIdea}
                />
              ))}
            </div>
          )}
        </>
      )}

      {topTab === "TEMPLATES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {POST_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {tmpl.category}
                </span>
                <h4 className="font-bold text-sm text-zinc-900 mt-2">{tmpl.title}</h4>
                <p className="text-xs text-zinc-600 mt-1 line-clamp-3 font-mono bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                  {tmpl.body}
                </p>
              </div>
              <Button
                size="sm"
                className="mt-4 w-full"
                onClick={() => {
                  localStorage.setItem("postinger_compose_prefill", tmpl.body);
                  router.push("/compose");
                }}
              >
                Use Template
              </Button>
            </div>
          ))}
        </div>
      )}

      {topTab === "FEEDS" && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 text-center text-sm text-zinc-500">
          <Rss className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
          <p className="font-bold text-zinc-800">RSS Ingestion Feed</p>
          <p className="text-xs text-zinc-500 mt-1">Connect blog and publication feeds to auto-import draft concepts.</p>
        </div>
      )}

      {/* Add Idea Modal */}
      <AddIdeaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={createIdea}
      />
    </div>
  );
}
