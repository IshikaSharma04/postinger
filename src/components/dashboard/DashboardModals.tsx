"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FeedbackModalProps {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, rating }),
      });
      if (res.ok) {
        toast.success("Thank you for your feedback!");
        onClose();
      }
    } catch {
      toast.error("Failed to send feedback.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-900">Send Product Feedback</h3>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Your experience (1–5 stars)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors ${
                    rating >= s ? "bg-amber-400 text-black shadow-2xs" : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  ★ {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">What can we improve?</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share ideas, feature requests, or UI improvements..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {sending ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface GoalModalProps {
  initialGoal: number;
  workspaceId: string;
  onClose: () => void;
}

export function GoalModal({ initialGoal, workspaceId, onClose }: GoalModalProps) {
  const router = useRouter();
  const [goal, setGoal] = useState(initialGoal);

  const handleSave = async () => {
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: 5,
          postingFrequency: `${goal} times a week`,
          isCompleted: true,
        }),
      });
      toast.success(`Weekly posting goal set to ${goal} posts/week!`);
      onClose();
      router.refresh();
    } catch {
      toast.error("Failed to update goal.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-900">Adjust Weekly Posting Goal</h3>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4 py-2">
          <div className="text-center">
            <span className="text-4xl font-black text-blue-600">{goal}</span>
            <span className="text-xs text-zinc-400 block mt-1">posts per week</span>
          </div>
          <input
            type="range"
            min={1}
            max={21}
            step={1}
            value={goal}
            onChange={(e) => setGoal(parseInt(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>1/wk (Light)</span>
            <span>7/wk (Daily)</span>
            <span>21/wk (High)</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Save Goal
          </button>
        </div>
      </div>
    </div>
  );
}
