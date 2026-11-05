"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password update failed");

      toast.success(data.data?.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-6 text-xs font-bold text-zinc-500">
        <Link href="/settings/profile" className="py-3 hover:text-zinc-900 border-b-2 border-transparent">
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
        <Link href="/settings/security" className="py-3 text-blue-600 border-b-2 border-blue-600">
          Security
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-black text-zinc-900">Security & Authentication</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage your account credentials, session integrity, and authentication controls.
        </p>
      </div>

      {/* Change Password Card */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
          <Lock className="w-4 h-4 text-zinc-500" />
          <h3 className="font-bold text-sm text-zinc-900">Change Account Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="max-w-md space-y-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 chars, 1 uppercase, 1 number"
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="mt-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            {updating ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Security Status Overview */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-3">Session & Token Controls</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Cookie Strategy</span>
            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> httpOnly & SameSite
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Tokens at Rest</span>
            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> AES-256-GCM Encrypted
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Session Expiry</span>
            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 30-day sliding JWT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
