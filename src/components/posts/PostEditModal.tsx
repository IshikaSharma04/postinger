"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import type { PostListItem } from "./types";

interface PostEditModalProps {
  post: PostListItem;
  body: string;
  scheduledAt: string;
  onBodyChange: (v: string) => void;
  onScheduledAtChange: (v: string) => void;
  onClose: () => void;
  onSave: (id: string, body: string, scheduledAt?: string) => void;
  saving: boolean;
}

export function PostEditModal({
  post,
  body,
  scheduledAt,
  onBodyChange,
  onScheduledAtChange,
  onClose,
  onSave,
  saving,
}: PostEditModalProps) {
  const toast = useToast();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-app rounded-2xl max-w-lg w-full p-6 shadow-xl relative space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-app">
          <h3 className="text-sm font-bold text-app">Edit &amp; Reschedule Post</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-tertiary hover:text-app hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Post Caption</label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              className="w-full p-3 rounded-xl border border-app bg-white text-xs text-app outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">
              Reschedule Publish Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => onScheduledAtChange(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-app bg-white text-xs text-app outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            loading={saving}
            onClick={() => {
              if (!body.trim()) {
                toast.warning("Body cannot be empty");
                return;
              }
              onSave(post.id, body.trim(), scheduledAt || undefined);
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
