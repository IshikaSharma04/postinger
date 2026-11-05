"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";
import { Spinner } from "@/components/ui/States";
import { useComposerData } from "@/components/composer/useComposerData";
import { ComposerPreview } from "@/components/composer/ComposerPreview";
import { ComposerMediaModal } from "@/components/composer/ComposerMediaModal";
import { ComposerAiModal } from "@/components/composer/ComposerAiModal";
import { ComposerForm } from "@/components/composer/ComposerForm";

function ComposeContent() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") || searchParams.get("postId");
  const prefill = searchParams.get("prefill") || searchParams.get("template") || "";
  const dateParam = searchParams.get("date") || "";

  const { workspace, accounts, mediaAssets, editPost, isLoading, refetchMedia } =
    useComposerData(editId);

  // Form state
  const [body, setBody] = useState(prefill);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [selectedAccIds, setSelectedAccIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState(dateParam ? `${dateParam}T09:00` : "");
  const [showSchedule, setShowSchedule] = useState(Boolean(dateParam));
  const [previewPlatform, setPreviewPlatform] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Modals state
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Populate from edit post or prefill
  useEffect(() => {
    if (editPost) {
      setBody(editPost.body ?? "");
      setHashtags(editPost.hashtags ?? []);
      setSelectedAccIds(editPost.postAccounts?.map((pa) => pa.socialAccountId) ?? []);
      setSelectedMediaIds(editPost.mediaAttachments?.map((ma) => ma.assetId) ?? []);
      if (editPost.scheduledAt) {
        setScheduledAt(new Date(editPost.scheduledAt).toISOString().slice(0, 16));
        setShowSchedule(true);
      }
    } else if (prefill) {
      setBody(prefill);
    } else {
      const cached = localStorage.getItem("postinger_compose_prefill");
      if (cached) {
        setBody(cached);
        localStorage.removeItem("postinger_compose_prefill");
      }
    }
  }, [editPost, prefill]);

  // Set default preview platform and accounts
  useEffect(() => {
    if (accounts.length > 0 && selectedAccIds.length === 0 && !editId) {
      setSelectedAccIds([accounts[0].id]);
      setPreviewPlatform(accounts[0].platform);
    }
  }, [accounts, selectedAccIds.length, editId]);

  function toggleAccount(id: string) {
    setSelectedAccIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (!next.includes(id) && accounts.find((a) => a.id === id)?.platform === previewPlatform) {
        const remaining = accounts.find((a) => next.includes(a.id));
        setPreviewPlatform(remaining?.platform ?? "");
      }
      return next;
    });
  }

  function addHashtag(tag: string) {
    const clean = tag.replace(/^#/, "").trim();
    if (clean && !hashtags.includes(clean) && hashtags.length < 30) {
      setHashtags((prev) => [...prev, clean]);
      setHashtagInput("");
    }
  }

  function removeHashtag(tag: string) {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !workspace?.id) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("workspaceId", workspace.id);
      const res = await fetch("/api/media", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Upload failed");
      await refetchMedia();
      setSelectedMediaIds((prev) => [...prev, json.data.id]);
      toast.success("Media uploaded successfully");
    } catch (err: unknown) {
      toast.error("Upload error", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave(action: "DRAFT" | "QUEUE" | "SCHEDULE" | "PUBLISH_NOW") {
    if (!workspace?.id) return;
    if (selectedAccIds.length === 0) {
      toast.error("Select channels", "Please select at least one social channel");
      return;
    }
    if (!body.trim()) {
      toast.error("Content required", "Post body cannot be empty");
      return;
    }

    setSaving(true);
    try {
      let finalStatus: "DRAFT" | "SCHEDULED" = "DRAFT";
      let finalScheduledAt: string | undefined = undefined;

      if (action === "SCHEDULE") {
        if (!scheduledAt) {
          toast.error("Missing date", "Please select a scheduled date and time");
          setSaving(false);
          return;
        }
        finalStatus = "SCHEDULED";
        finalScheduledAt = new Date(scheduledAt).toISOString();
      } else if (action === "QUEUE") {
        finalStatus = "SCHEDULED";
        finalScheduledAt = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
      }

      const payload = {
        workspaceId: workspace.id,
        body: body.trim(),
        hashtags,
        socialAccountIds: selectedAccIds,
        mediaAssetIds: selectedMediaIds,
        status: finalStatus,
        scheduledAt: finalScheduledAt,
        action: action === "PUBLISH_NOW" ? "PUBLISH_NOW" : undefined,
      };

      const url = editId ? `/api/posts/${editId}` : "/api/posts";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save post");

      toast.success(
        action === "PUBLISH_NOW"
          ? "Post dispatched to worker!"
          : action === "SCHEDULE"
          ? "Post scheduled!"
          : action === "QUEUE"
          ? "Added to queue!"
          : "Draft saved!"
      );

      router.push("/posts");
    } catch (err: unknown) {
      toast.error("Error saving post", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            {editId ? "Edit Post" : "Compose New Post"}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Craft, customize, and queue updates across connected channels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Form & Editor */}
        <div className="lg:col-span-3">
          <ComposerForm
            accounts={accounts}
            selectedAccIds={selectedAccIds}
            onToggleAccount={toggleAccount}
            body={body}
            onBodyChange={setBody}
            onOpenAiModal={() => setShowAiModal(true)}
            selectedMediaIds={selectedMediaIds}
            onRemoveMedia={(id) => setSelectedMediaIds((prev) => prev.filter((x) => x !== id))}
            onOpenMediaModal={() => setShowMediaModal(true)}
            mediaAssets={mediaAssets}
            hashtags={hashtags}
            hashtagInput={hashtagInput}
            onHashtagInputChange={setHashtagInput}
            onAddHashtag={addHashtag}
            onRemoveHashtag={removeHashtag}
            showSchedule={showSchedule}
            onToggleSchedule={() => setShowSchedule(!showSchedule)}
            scheduledAt={scheduledAt}
            onScheduledAtChange={setScheduledAt}
            saving={saving}
            onSave={handleSave}
          />
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-2">
          <ComposerPreview
            body={body}
            hashtags={hashtags}
            accounts={accounts}
            selectedAccIds={selectedAccIds}
            previewPlatform={previewPlatform}
            onSelectPreviewPlatform={setPreviewPlatform}
          />
        </div>
      </div>

      {/* Modals */}
      <ComposerMediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        mediaAssets={mediaAssets}
        selectedMediaIds={selectedMediaIds}
        isUploading={isUploading}
        onToggleMedia={(id) =>
          setSelectedMediaIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          )
        }
        onFileUpload={handleFileUpload}
      />

      <ComposerAiModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        currentBody={body}
        onApplySuggestion={setBody}
      />
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      }
    >
      <ComposeContent />
    </Suspense>
  );
}
