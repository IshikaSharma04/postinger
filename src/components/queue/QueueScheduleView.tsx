"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { ScheduleSlot } from "./types";

const WEEKDAYS = [
  { name: "Sunday", dayOfWeek: 0 },
  { name: "Monday", dayOfWeek: 1 },
  { name: "Tuesday", dayOfWeek: 2 },
  { name: "Wednesday", dayOfWeek: 3 },
  { name: "Thursday", dayOfWeek: 4 },
  { name: "Friday", dayOfWeek: 5 },
  { name: "Saturday", dayOfWeek: 6 },
];

function formatSlotTime(timeStr: string) {
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${mStr} ${ampm}`;
}

export function QueueScheduleView({ workspaceId }: { workspaceId: string | null }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [newDayOfWeek, setNewDayOfWeek] = useState<number>(1);
  const [newTime, setNewTime] = useState("09:00");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: slots = [], isLoading } = useQuery<ScheduleSlot[]>({
    queryKey: ["queue-slots", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/queue/slots?workspaceId=${workspaceId}`);
      const json = await res.json();
      return (json.data?.slots ?? []) as ScheduleSlot[];
    },
    enabled: !!workspaceId,
  });

  const addSlotMutation = useMutation({
    mutationFn: async (payload: { dayOfWeek: number; time: string }) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await fetch("/api/queue/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          dayOfWeek: payload.dayOfWeek,
          time: payload.time,
          timezone: "UTC",
          isActive: true,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to add slot");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue-slots"] });
      setShowAddModal(false);
      toast.success("New posting slot added to schedule!");
    },
    onError: (err: Error) => {
      toast.error("Could not add slot", err.message);
    },
  });

  const toggleSlotMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (!workspaceId) return;
      const res = await fetch(`/api/queue/slots?id=${id}&workspaceId=${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to toggle slot");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue-slots"] });
    },
    onError: (err: Error) => {
      toast.error("Toggle failed", err.message);
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!workspaceId) return;
      const res = await fetch(`/api/queue/slots?id=${id}&workspaceId=${workspaceId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete slot");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue-slots"] });
      toast.success("Schedule slot removed");
    },
    onError: (err: Error) => {
      toast.error("Delete failed", err.message);
    },
  });

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    addSlotMutation.mutate({ dayOfWeek: Number(newDayOfWeek), time: newTime });
  };

  return (
    <div className="space-y-6">
      {/* Banner / Info Card */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Postinger Automated Posting Schedule
            </span>
          </div>
          <h3 className="text-base font-bold text-zinc-900 mt-1">
            Automate your queue dispatch times
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Posts added to your queue without a specific date will automatically occupy the next available slot.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Posting Time
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-zinc-400">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        /* Weekday Grid */
        <div className="space-y-4">
          {WEEKDAYS.map((w) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === w.dayOfWeek);
            return (
              <div
                key={w.dayOfWeek}
                className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900">{w.name}</span>
                    <span className="text-xs text-zinc-400">
                      ({daySlots.length} {daySlots.length === 1 ? "slot" : "slots"})
                    </span>
                  </div>
                  {w.name === "Wednesday" && (
                    <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      🔥 Peak Engagement Day
                    </span>
                  )}
                </div>

                {daySlots.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic py-2">
                    No posting times set for {w.name}.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          slot.isActive
                            ? "bg-blue-50/60 border-blue-200 text-blue-800"
                            : "bg-zinc-50 border-zinc-200 text-zinc-400 line-through"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{formatSlotTime(slot.time)}</span>
                        <button
                          type="button"
                          onClick={() => toggleSlotMutation.mutate({ id: slot.id, isActive: !slot.isActive })}
                          className="text-[10px] text-zinc-400 hover:text-blue-600 ml-1"
                          title={slot.isActive ? "Pause slot" : "Activate slot"}
                        >
                          {slot.isActive ? "Pause" : "Resume"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSlotMutation.mutate(slot.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity ml-1"
                          title="Delete slot"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-base text-zinc-900 mb-1">
              Add New Posting Time Slot
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Select the day and time when you want queued posts to automatically publish.
            </p>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                  Weekday
                </label>
                <select
                  value={newDayOfWeek}
                  onChange={(e) => setNewDayOfWeek(Number(e.target.value))}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {WEEKDAYS.map((w) => (
                    <option key={w.dayOfWeek} value={w.dayOfWeek}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                  Publish Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
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
                <Button type="submit" variant="primary" size="sm">
                  Save Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
