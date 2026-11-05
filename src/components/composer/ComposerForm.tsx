"use client";

import React from "react";
import {
  Sparkles,
  Save,
  Clock,
  Calendar,
  Send,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { ComposerAccount, MediaAssetItem } from "./useComposerData";

interface ComposerFormProps {
  accounts: ComposerAccount[];
  selectedAccIds: string[];
  onToggleAccount: (id: string) => void;
  body: string;
  onBodyChange: (val: string) => void;
  onOpenAiModal: () => void;
  selectedMediaIds: string[];
  onRemoveMedia: (id: string) => void;
  onOpenMediaModal: () => void;
  mediaAssets: MediaAssetItem[];
  hashtags: string[];
  hashtagInput: string;
  onHashtagInputChange: (val: string) => void;
  onAddHashtag: (tag: string) => void;
  onRemoveHashtag: (tag: string) => void;
  showSchedule: boolean;
  onToggleSchedule: () => void;
  scheduledAt: string;
  onScheduledAtChange: (val: string) => void;
  saving: boolean;
  onSave: (action: "DRAFT" | "QUEUE" | "SCHEDULE" | "PUBLISH_NOW") => void;
}

export function ComposerForm({
  accounts,
  selectedAccIds,
  onToggleAccount,
  body,
  onBodyChange,
  onOpenAiModal,
  selectedMediaIds,
  onRemoveMedia,
  onOpenMediaModal,
  mediaAssets,
  hashtags,
  hashtagInput,
  onHashtagInputChange,
  onAddHashtag,
  onRemoveHashtag,
  showSchedule,
  onToggleSchedule,
  scheduledAt,
  onScheduledAtChange,
  saving,
  onSave,
}: ComposerFormProps) {
  return (
    <div className="space-y-4">
      {/* Channel selector */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
        <span className="text-xs font-semibold text-zinc-700 block mb-2">Publish To:</span>
        {accounts.length === 0 ? (
          <p className="text-xs text-zinc-400">No channels connected yet. Go to Channels to connect.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {accounts.map((acc: ComposerAccount) => {
              const isSelected = selectedAccIds.includes(acc.id);
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => onToggleAccount(acc.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isSelected
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                      : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  <span>@{acc.handle}</span>
                  <span className="text-[10px] opacity-70">({acc.platform})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Body Editor */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <span className="text-xs font-bold text-zinc-700">Caption &amp; Body</span>
          <button
            type="button"
            onClick={onOpenAiModal}
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </button>
        </div>

        <textarea
          rows={6}
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="What's happening? Share news, write insights, or post updates..."
          className="w-full text-sm text-zinc-900 outline-none resize-none leading-relaxed placeholder-zinc-400"
        />

        {/* Media previews */}
        {selectedMediaIds.length > 0 && (
          <div className="flex gap-2 pt-2 border-t border-zinc-100 overflow-x-auto">
            {selectedMediaIds.map((id) => {
              const asset = mediaAssets.find((a) => a.id === id);
              if (!asset) return null;
              return (
                <div key={id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0">
                  <img src={asset.url} alt={asset.originalName} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemoveMedia(id)}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Editor toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={onOpenMediaModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 p-1 rounded-lg"
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            Attach Media ({selectedMediaIds.length})
          </button>
          <span className="text-xs text-zinc-400 font-mono">{body.length} chars</span>
        </div>
      </div>

      {/* Hashtags */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 space-y-2">
        <span className="text-xs font-semibold text-zinc-700">Hashtags</span>
        <div className="flex flex-wrap gap-1.5 items-center">
          {hashtags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
              #{tag}
              <button type="button" onClick={() => onRemoveHashtag(tag)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={hashtags.length === 0 ? "Add tag and press Enter..." : "+ tag"}
            value={hashtagInput}
            onChange={(e) => onHashtagInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                onAddHashtag(hashtagInput);
              }
            }}
            className="text-xs outline-none px-2 py-1 bg-transparent min-w-[80px]"
          />
        </div>
      </div>

      {/* Schedule Date */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Custom Scheduled Date</h3>
            <p className="text-[11px] text-zinc-500">Pick specific time or add to queue schedule</p>
          </div>
          <button
            type="button"
            onClick={onToggleSchedule}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
              showSchedule ? "bg-blue-600 text-white border-blue-600" : "bg-zinc-50 text-zinc-700 border-zinc-200"
            }`}
          >
            {showSchedule ? "Date Active" : "Pick Date"}
          </button>
        </div>
        {showSchedule && (
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <input
              type="datetime-local"
              value={scheduledAt}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => onScheduledAtChange(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 outline-none"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSave("DRAFT")}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> Draft
          </button>
          <button
            type="button"
            onClick={() => onSave("QUEUE")}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#C4F279] text-[#121212] text-xs font-extrabold hover:bg-[#b8ec6a] transition-all disabled:opacity-50"
          >
            <Clock className="w-3.5 h-3.5" /> Queue
          </button>
          <button
            type="button"
            onClick={() => onSave("SCHEDULE")}
            disabled={saving || !showSchedule}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-all disabled:opacity-40"
          >
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </button>
        </div>
        <button
          type="button"
          onClick={() => onSave("PUBLISH_NOW")}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#121212] text-white text-sm font-extrabold hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-md"
        >
          <Send className="w-4 h-4 text-[#C4F279]" />
          {saving ? "Publishing…" : "Publish Now"}
        </button>
      </div>
    </div>
  );
}
