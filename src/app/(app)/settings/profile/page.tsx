"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, Check, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function SettingsProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [saving, setSaving] = useState(false);

  // Sync session state once loaded
  React.useEffect(() => {
    if (session?.user) {
      if (!name) setName(session.user.name ?? "");
      if (!email) setEmail(session.user.email ?? "");
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      toast.success(data.data?.message || "Profile updated successfully!");
      if (update) update({ name, email });
    } catch (err: any) {
      toast.error(err.message || "Could not save profile changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-6 text-xs font-bold text-zinc-500">
        <Link href="/settings/profile" className="py-3 text-blue-600 border-b-2 border-blue-600">
          Profile
        </Link>
        <Link href="/settings/billing" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          Plans & Billing
        </Link>
        <Link href="/team" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          Team Members
        </Link>
        <Link href="/settings/api-keys" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          API Keys & Webhooks
        </Link>
        <Link href="/settings/security" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
          Security
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-black text-zinc-900">Personal Profile</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage your personal details and communication preferences.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-zinc-100 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
            {name?.[0]?.toUpperCase() ?? "P"}
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900">{name || "Your Name"}</h3>
            <p className="text-xs text-zinc-400">{email || "your.email@example.com"}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="max-w-md space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Used for account login and notifications.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
