"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Image as ImageIcon,
  Send,
  Save,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Upload,
  Check,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

// ─── Platform metadata ───────────────────────────────────────────────────────

const PLATFORM_META: Record<string, { icon: string; color: string; limit: number }> = {
  TWITTER:   { icon: "𝕏",  color: "#1DA1F2", limit: 280 },
  INSTAGRAM: { icon: "IG", color: "#E1306C", limit: 2200 },
  LINKEDIN:  { icon: "in", color: "#0077B5", limit: 3000 },
  FACEBOOK:  { icon: "f",  color: "#4267B2", limit: 63206 },
  TIKTOK:    { icon: "TT", color: "#010101", limit: 2200 },
  YOUTUBE:   { icon: "YT", color: "#FF0000", limit: 5000 },
  PINTEREST: { icon: "P",  color: "#BD081C", limit: 500 },
  THREADS:   { icon: "@",  color: "#000000", limit: 500 },
  BLUESKY:   { icon: "🦋", color: "#0085FF", limit: 300 },
  MASTODON:  { icon: "M",  color: "#6364FF", limit: 500 },
};

// ─── Compose Content ─────────────────────────────────────────────────────────

function ComposeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId      = searchParams.get("edit") || searchParams.get("postId");
  const prefill     = searchParams.get("prefill") || searchParams.get("template") || "";
  const dateParam   = searchParams.get("date") || "";
  const isEditMode  = !!editId;

  // Form state
  const [body,              setBody]            = useState(prefill);
  const [hashtags,          setHashtags]        = useState<string[]>([]);
  const [hashtagInput,      setHashtagInput]    = useState("");
  const [selectedAccIds,    setSelectedAccIds]  = useState<string[]>([]);
  const [scheduledAt,       setScheduledAt]     = useState(dateParam ? `${dateParam}T09:00` : "");
  const [showSchedule,      setShowSchedule]    = useState(!!dateParam);
  const [previewPlatform,   setPreviewPlatform] = useState<string>("");
  const [saving,            setSaving]          = useState(false);

  // Media state
  const [mediaAssets,       setMediaAssets]     = useState<any[]>([]);
  const [selectedMediaIds,  setSelectedMediaIds]= useState<string[]>([]);
  const [showMediaModal,    setShowMediaModal]  = useState(false);
  const [isUploading,       setIsUploading]     = useState(false);

  // AI state
  const [showAiModal,       setShowAiModal]     = useState(false);
  const [aiPrompt,          setAiPrompt]        = useState("");
  const [aiTone,            setAiTone]          = useState("Punchy");
  const [aiAction,          setAiAction]        = useState("REWRITE");
  const [aiSuggestions,     setAiSuggestions]   = useState<string[]>([]);
  const [aiLoading,         setAiLoading]       = useState(false);

  // Workspace / accounts
  const [workspace,         setWorkspace]       = useState<any>(null);
  const [accounts,          setAccounts]        = useState<any[]>([]);
  const [loading,           setLoading]         = useState(true);

  // ── Boot: load workspace + accounts ───────────────────────────────────────
  useEffect(() => {
    async function boot() {
      try {
        const wsRes  = await fetch("/api/workspaces");
        const wsJson = await wsRes.json();
        const ws     = wsJson.data?.[0] ?? null;
        setWorkspace(ws);

        if (ws) {
          const [accRes, mediaRes] = await Promise.all([
            fetch(`/api/accounts?workspaceId=${ws.id}`),
            fetch(`/api/media?workspaceId=${ws.id}&limit=50`),
          ]);
          const accJson   = await accRes.json();
          const mediaJson = await mediaRes.json();
          setAccounts(accJson.data ?? []);
          setMediaAssets(mediaJson.data?.assets ?? []);
        }

        // If editing, load the post
        if (editId) {
          const postRes  = await fetch(`/api/posts/${editId}`);
          const postJson = await postRes.json();
          const p        = postJson.data;
          if (p) {
            setBody(p.body ?? "");
            setHashtags(p.hashtags ?? []);
            setSelectedAccIds(p.postAccounts?.map((pa: any) => pa.socialAccountId) ?? []);
            setSelectedMediaIds(p.mediaAttachments?.map((ma: any) => ma.assetId) ?? []);
            if (p.scheduledAt) {
              setScheduledAt(new Date(p.scheduledAt).toISOString().slice(0, 16));
              setShowSchedule(true);
            }
          }
        }

        // Restore from localStorage prefill
        if (!prefill && !editId) {
          const cached = localStorage.getItem("postinger_compose_prefill");
          if (cached) {
            setBody(cached);
            localStorage.removeItem("postinger_compose_prefill");
          }
        }
      } catch (err) {
        console.error("Compose boot error", err);
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, [editId, prefill]);

  // ── Hashtag helpers ────────────────────────────────────────────────────────
  function addHashtag(raw: string) {
    const tag = raw.replace(/^#/, "").trim().toLowerCase();
    if (tag && !hashtags.includes(tag) && hashtags.length < 30) {
      setHashtags([...hashtags, tag]);
    }
    setHashtagInput("");
  }
  function removeHashtag(tag: string) {
    setHashtags(hashtags.filter(t => t !== tag));
  }

  // ── Media upload ───────────────────────────────────────────────────────────
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !workspace?.id) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("workspaceId", workspace.id);
      const res  = await fetch("/api/media", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Upload failed");
      setMediaAssets(prev => [json.data, ...prev]);
      setSelectedMediaIds(prev => [...prev, json.data.id]);
      toast.success("Media uploaded and attached!");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  }

  // ── AI generate ────────────────────────────────────────────────────────────
  async function handleAiGenerate() {
    setAiLoading(true);
    try {
      const res  = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: aiAction, prompt: aiPrompt || body, tone: aiTone, platform: previewPlatform }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "AI failed");
      setAiSuggestions(json.data?.suggestions ?? []);
      if (json.data?.notice) toast.info(json.data.notice);
    } catch (err: any) {
      toast.error("AI error: " + err.message);
    } finally {
      setAiLoading(false);
    }
  }

  // ── Save / publish ─────────────────────────────────────────────────────────
  async function handleSave(action: "DRAFT" | "QUEUE" | "SCHEDULE" | "PUBLISH_NOW") {
    if (!body.trim()) { toast.warning("Please write something first!"); return; }
    if (action === "SCHEDULE" && !scheduledAt) {
      toast.warning("Please pick a date & time to schedule.");
      setShowSchedule(true);
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        body,
        hashtags,
        socialAccountIds: selectedAccIds,
        mediaAssetIds:    selectedMediaIds,
        action,
        status:       action === "SCHEDULE" ? "SCHEDULED" : "DRAFT",
        scheduledAt:  scheduledAt ? new Date(scheduledAt) : undefined,
        workspaceId:  workspace?.id ?? "",
        postFormat:   "POST",
        fanOut:       true,
        tags:         [],
      };

      const url    = isEditMode ? `/api/posts/${editId}` : "/api/posts";
      const method = isEditMode ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Save failed");

      const status = json.data?.status;
      toast.success(
        status === "SCHEDULED" ? "Post scheduled! 🗓️" :
        status === "PUBLISHED" ? "Post published! 🚀" : "Draft saved! ✅"
      );
      router.push("/posts");
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const fullText   = [body, ...hashtags.map(h => `#${h}`)].join(" ");
  const charLimit  = PLATFORM_META[previewPlatform]?.limit ?? 3000;
  const overLimit  = fullText.length > charLimit;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-200">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-black text-zinc-900">
            {isEditMode ? "Edit Post" : "Compose Post"}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isEditMode ? "Update your draft or change publishing time" : "Create and schedule content across all your channels"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ── Left: Composer ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Target Channels */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Target Channels</h3>
            {accounts.length === 0 ? (
              <div className="text-center py-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                <p className="text-xs text-zinc-500 mb-2">No social accounts connected yet</p>
                <Link href="/accounts" className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Connect an account →
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {accounts.map((acc: any) => {
                  const isSelected = selectedAccIds.includes(acc.id);
                  const meta = PLATFORM_META[acc.platform] ?? { icon: "?", color: "#999" };
                  return (
                    <button
                      key={acc.id}
                      onClick={() => {
                        setSelectedAccIds(isSelected
                          ? selectedAccIds.filter(id => id !== acc.id)
                          : [...selectedAccIds, acc.id]
                        );
                        if (!isSelected) setPreviewPlatform(acc.platform);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-500/20"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: meta.color }}
                      >
                        {meta.icon}
                      </span>
                      <span>@{acc.handle}</span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Caption</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAiPrompt(body); setShowAiModal(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Assistant
                </button>
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-xs font-medium hover:bg-zinc-50 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Attach Media
                  {selectedMediaIds.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {selectedMediaIds.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="What would you like to share? Write your caption here..."
              rows={7}
              className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className={`font-mono ${overLimit ? "text-red-500 font-bold" : "text-zinc-400"}`}>
                {fullText.length}{previewPlatform ? `/${charLimit}` : ""} characters
              </span>
              {overLimit && (
                <span className="text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Exceeds {previewPlatform} limit
                </span>
              )}
            </div>

            {/* Attached Media */}
            {selectedMediaIds.length > 0 && (
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <span className="text-xs font-semibold text-zinc-500 block mb-2">Attached ({selectedMediaIds.length})</span>
                <div className="flex flex-wrap gap-2">
                  {selectedMediaIds.map(id => {
                    const asset = mediaAssets.find(a => a.id === id);
                    if (!asset) return null;
                    return (
                      <div key={id} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-zinc-200">
                        {asset.mimeType?.startsWith("image/") ? (
                          <img src={asset.url} alt={asset.originalName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-500 font-bold">VIDEO</div>
                        )}
                        <button
                          onClick={() => setSelectedMediaIds(prev => prev.filter(x => x !== id))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hashtags */}
            <div className="mt-4 pt-3 border-t border-zinc-100">
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Hashtags</label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-zinc-200 bg-white min-h-[42px] items-center focus-within:border-blue-600 transition-all">
                {hashtags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 font-medium">
                    #{tag}
                    <button onClick={() => removeHashtag(tag)} className="hover:text-blue-900 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {hashtags.length < 30 && (
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={e => setHashtagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addHashtag(hashtagInput); }
                      else if (e.key === "Backspace" && !hashtagInput && hashtags.length > 0) removeHashtag(hashtags[hashtags.length - 1]);
                    }}
                    onBlur={() => hashtagInput && addHashtag(hashtagInput)}
                    placeholder={hashtags.length === 0 ? "Add hashtags (press Enter)..." : ""}
                    className="flex-1 min-w-[140px] text-xs outline-none bg-transparent text-zinc-900 placeholder-zinc-400"
                  />
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">{hashtags.length}/30 hashtags</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Schedule Date</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Pick a future date, or leave empty for queue order.</p>
              </div>
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  showSchedule ? "bg-blue-600 text-white border-blue-600" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {showSchedule ? "Date Selected ✓" : "Pick Date"}
              </button>
            </div>
            {showSchedule && (
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Publishing Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleSave("DRAFT")}
                disabled={saving}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Save Draft
              </button>
              <button
                onClick={() => handleSave("QUEUE")}
                disabled={saving}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#C4F279] text-[#121212] text-xs font-extrabold hover:bg-[#b8ec6a] transition-all disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5" /> Add to Queue
              </button>
              <button
                onClick={() => handleSave("SCHEDULE")}
                disabled={saving || !showSchedule}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-all disabled:opacity-40"
              >
                <Calendar className="w-3.5 h-3.5" /> Schedule
              </button>
            </div>
            <button
              onClick={() => handleSave("PUBLISH_NOW")}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#121212] text-white text-sm font-extrabold hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-50 shadow-md"
            >
              <Send className="w-4 h-4 text-[#C4F279]" />
              {saving ? "Publishing…" : "Publish Now"}
            </button>
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 sticky top-6">
            <h3 className="text-sm font-bold text-zinc-900 mb-3">Live Preview</h3>
            <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-500">Preview</span>
                {previewPlatform && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${PLATFORM_META[previewPlatform]?.color}20`, color: PLATFORM_META[previewPlatform]?.color }}
                  >
                    {previewPlatform}
                  </span>
                )}
              </div>
              <div className="bg-white rounded-xl p-4 border border-zinc-100 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                    {previewPlatform ? PLATFORM_META[previewPlatform]?.icon ?? "P" : "P"}
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
                    {hashtags.map(tag => (
                      <span key={tag} className="text-xs text-blue-600 font-medium">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Platform preview switcher */}
            {selectedAccIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {accounts.filter((a: any) => selectedAccIds.includes(a.id)).map((a: any) => (
                  <button
                    key={a.id}
                    onClick={() => setPreviewPlatform(a.platform)}
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
        </div>
      </div>

      {/* ── Media Modal ── */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-zinc-900">Attach Media</h3>
              </div>
              <button onClick={() => setShowMediaModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload banner */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900">Upload from Device</p>
                <p className="text-[11px] text-zinc-500">JPG, PNG, WEBP, MP4</p>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100">
                <input type="file" className="sr-only" onChange={handleFileUpload} accept="image/*,video/*" />
                {isUploading ? <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Choose File
              </label>
            </div>

            <div className="flex-1 overflow-y-auto">
              {mediaAssets.length === 0 ? (
                <div className="p-10 text-center text-zinc-400 text-xs">No media uploaded yet.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaAssets.map((asset: any) => {
                    const isSelected = selectedMediaIds.includes(asset.id);
                    return (
                      <button
                        key={asset.id}
                        onClick={() =>
                          setSelectedMediaIds(isSelected
                            ? selectedMediaIds.filter(id => id !== asset.id)
                            : [...selectedMediaIds, asset.id]
                          )
                        }
                        className={`relative rounded-xl overflow-hidden aspect-square border transition-all ${
                          isSelected ? "border-blue-600 ring-2 ring-blue-500/20" : "border-zinc-200 hover:border-blue-300"
                        }`}
                      >
                        {asset.mimeType?.startsWith("image/") ? (
                          <img src={asset.url} alt={asset.originalName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-500 font-bold">VIDEO</div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-500">{selectedMediaIds.length} attached</span>
              <button
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Modal ── */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-zinc-900">AI Caption Generator</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1">
              {/* Tone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Tone</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Punchy", "Professional", "Casual", "Thought-Leadership", "Technical"].map(t => (
                    <button
                      key={t}
                      onClick={() => setAiTone(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        aiTone === t ? "bg-purple-600 border-purple-600 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Action</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "REWRITE", label: "Rewrite" },
                    { id: "HOOKS",   label: "Viral Hooks" },
                    { id: "IDEAS",   label: "Brainstorm" },
                    { id: "SUMMARIZE", label: "Summarize" },
                  ].map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAiAction(a.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        aiAction === a.id ? "bg-purple-100 border-purple-300 text-purple-900 font-bold" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Topic or Draft</label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Paste rough thoughts or enter a topic..."
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 outline-none focus:border-purple-600 resize-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAiModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {aiLoading ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Generate
                </button>
              </div>

              {/* Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Suggestions</span>
                  {aiSuggestions.map((sug, i) => (
                    <div key={i} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-purple-300 transition-all space-y-2">
                      <p className="text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap">{sug}</p>
                      <button
                        onClick={() => {
                          setBody(sug);
                          toast.success("Applied to caption!");
                          setShowAiModal(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function ComposePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <ComposeContent />
    </Suspense>
  );
}
