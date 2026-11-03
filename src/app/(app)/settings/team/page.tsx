"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Mail, Shield, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("CONTRIBUTOR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const wsRes = await fetch("/api/workspace");
        const wsData = await wsRes.json();
        const ws = wsData?.data?.workspaces?.[0] || wsData?.data;
        if (!ws?.id) {
          setIsLoading(false);
          return;
        }
        setWorkspaceId(ws.id);

        const teamRes = await fetch(`/api/team?workspaceId=${ws.id}`);
        const teamData = await teamRes.json();
        if (teamData?.data) {
          setMembers(teamData.data);
        }
      } catch (err) {
        console.error("Failed to load team", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !workspaceId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          email: inviteEmail,
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to invite member");
      }
      toast.success(`Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail("");

      // Refresh list
      const teamRes = await fetch(`/api/team?workspaceId=${workspaceId}`);
      const teamData = await teamRes.json();
      if (teamData?.data) {
        setMembers(teamData.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the workspace?")) return;

    try {
      const res = await fetch(`/api/team?workspaceId=${workspaceId}&memberId=${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to remove member");
      }
      toast.success("Member removed successfully");
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Team & Collaboration</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your workspace members, assign publishing roles, and control access permissions.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Role explanation banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-xs font-bold text-purple-400 block mb-1">OWNER / ADMIN</span>
          <p className="text-xs text-zinc-400">Full control over billing, channels, team seats, and settings.</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-xs font-bold text-emerald-400 block mb-1">MANAGER</span>
          <p className="text-xs text-zinc-400">Can approve post drafts and schedule directly to live queues.</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-xs font-bold text-blue-400 block mb-1">CONTRIBUTOR</span>
          <p className="text-xs text-zinc-400">Can write and draft posts that require approval before publishing.</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-xs font-bold text-zinc-400 block mb-1">VIEWER</span>
          <p className="text-xs text-zinc-400">Read-only access to published posts, ideas, and analytics.</p>
        </div>
      </div>

      {/* Members list */}
      <div className="rounded-2xl border border-white/5 bg-[#14171d] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Active Workspace Members ({members.length})</h2>
          <span className="text-xs text-zinc-400">Seats included in current plan</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 text-sm">Loading workspace team...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">No members found</div>
        ) : (
          <div className="divide-y divide-white/5">
            {members.map((member) => (
              <div key={member.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm">
                    {member.user.name?.[0] || member.user.email?.[0] || "U"}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">
                      {member.user.name || "Team Member"}
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-zinc-500" />
                      <span>{member.user.email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      member.role === "OWNER"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : member.role === "ADMIN"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {member.role}
                  </span>

                  {member.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181b22] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Invite Colleague</span>
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Role & Permissions
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ADMIN">Admin (Full channel & team control)</option>
                  <option value="MANAGER">Manager (Can approve & publish drafts)</option>
                  <option value="CONTRIBUTOR">Contributor (Can draft posts for review)</option>
                  <option value="VIEWER">Viewer (Read-only analytics & posts)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  {isSubmitting ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
