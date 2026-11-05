"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { Clock, Edit2, Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toaster";
import type { CalendarPost } from "./CalendarDayCell";

interface CalendarDayDetailProps {
  date: Date;
  posts: CalendarPost[];
  onClose: () => void;
}

export function CalendarDayDetail({ date, posts, onClose }: CalendarDayDetailProps) {
  const toast = useToast();
  const qc = useQueryClient();
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, scheduledAt }: { id: string; scheduledAt: string }) => {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SCHEDULE", scheduledAt: new Date(scheduledAt).toISOString() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Reschedule failed");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post rescheduled successfully!");
      setReschedulingId(null);
    },
    onError: (err: Error) => toast.error("Reschedule failed", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Delete failed");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post removed from calendar");
    },
    onError: (err: Error) => toast.error("Delete failed", err.message),
  });

  return (
    <div className="bg-surface border border-app rounded-2xl p-5 shadow-sm animate-fade-in space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-app">
        <div>
          <h3 className="text-sm font-bold text-app">{format(date, "MMMM d, yyyy")}</h3>
          <span className="text-[11px] text-secondary">
            {posts.length} item{posts.length === 1 ? "" : "s"} scheduled
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-secondary hover:text-app text-xs font-semibold px-2 py-1 rounded-lg hover:bg-surface-subtle transition-colors"
        >
          Close
        </button>
      </div>

      <Link
        href={`/compose?date=${format(date, "yyyy-MM-dd")}`}
        className="w-full text-center py-2 px-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
      >
        <Plus className="w-3.5 h-3.5" /> Schedule post on this day
      </Link>

      {posts.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-secondary">No posts scheduled for this day yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-200 rounded-xl p-3 bg-white hover:border-gray-300 transition-all shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <StatusBadge status={post.status} />
                <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.scheduledAt ? format(new Date(post.scheduledAt), "h:mm a") : "Draft"}
                </span>
              </div>

              <p className="text-xs text-charcoal leading-relaxed line-clamp-3 font-normal">{post.body}</p>

              {post.postAccounts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.postAccounts.map((pa) => (
                    <span
                      key={pa.socialAccount.id}
                      className="text-[10px] text-zinc-600 bg-zinc-100 rounded-md px-1.5 py-0.5 font-medium"
                    >
                      @{pa.socialAccount.handle}
                    </span>
                  ))}
                </div>
              )}

              {reschedulingId === post.id && (
                <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2 mt-2">
                  <label className="text-[10px] font-bold text-blue-900 block">Choose new date &amp; time:</label>
                  <input
                    type="datetime-local"
                    value={newTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-lg border border-blue-200 bg-white"
                  />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button onClick={() => setReschedulingId(null)} className="text-[11px] text-zinc-500 hover:text-zinc-800 font-medium px-2 py-0.5">
                      Cancel
                    </button>
                    <button
                      onClick={() => { if (newTime) rescheduleMutation.mutate({ id: post.id, scheduledAt: newTime }); }}
                      className="text-[11px] bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                <Link href={`/compose?edit=${post.id}`} className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </Link>
                <div className="flex items-center gap-2">
                  {post.status !== "PUBLISHED" && (
                    <button
                      onClick={() => {
                        setReschedulingId(post.id);
                        setNewTime(post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : new Date(date).toISOString().slice(0, 16));
                      }}
                      className="text-zinc-500 hover:text-zinc-800 font-medium text-[11px]"
                    >
                      Reschedule
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(post.id); }}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                    title="Delete post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
