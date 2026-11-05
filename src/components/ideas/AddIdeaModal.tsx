import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: { title: string; content?: string; mediaUrl?: string; tags?: string[] }) => Promise<unknown>;
}

export function AddIdeaModal({ isOpen, onClose, onSave }: AddIdeaModalProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagInput, setTagInput] = useState("Video, Tips");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const tags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        title: title.trim(),
        content: notes.trim() || undefined,
        mediaUrl: imageUrl.trim() || undefined,
        tags,
      });

      setTitle("");
      setNotes("");
      setImageUrl("");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 max-w-md w-full shadow-2xl">
        <h3 className="font-extrabold text-base text-zinc-900 mb-1">
          Add New Content Idea
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Jot down concepts, attach an image link, and assign tags.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={saving}
            >
              Save Idea
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
