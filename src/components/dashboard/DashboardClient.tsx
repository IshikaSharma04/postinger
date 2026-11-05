"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sun, Moon, MessageSquarePlus, AlertCircle,
  Plus, Clock,
  ArrowRight, Send, Check, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ConnectChannelModal } from "@/components/channels/ConnectChannelModal";
import { DashboardKPIStrip } from "./DashboardKPIStrip";
import { FeedbackModal, GoalModal } from "./DashboardModals";
import { FirstStepsChecklist } from "./FirstStepsChecklist";
import { DashboardUpNextPanel } from "./DashboardUpNextPanel";

interface DashboardClientProps {
  user: { name?: string | null; email?: string | null };
  workspace: { id: string; name: string; plan: string; postingGoal: number };
  accounts: Array<{ id: string; platform: string; handle: string; displayName?: string | null }>;
  upcomingPosts: Array<{
    id: string;
    body: string;
    scheduledAt: string | null;
    postAccounts: Array<{ socialAccount: { platform: string; handle: string } }>;
  }>;
  recentComments: Array<{
    id: string;
    authorName: string;
    authorHandle: string;
    body: string;
    platform: string;
    createdAt: string;
    replied: boolean;
  }>;
  templates: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    body: string;
  }>;
  totalPosts: number;
}

export function DashboardClient({
  user,
  workspace,
  accounts,
  upcomingPosts,
  recentComments,
  templates,
  totalPosts,
}: DashboardClientProps) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [postingGoal, setPostingGoal] = useState(workspace.postingGoal || 5);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [repliedComments, setRepliedComments] = useState<Record<string, boolean>>({});
  const [step3Done, setStep3Done] = useState(false);

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 18;
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const firstName = user.name?.split(" ")[0] ?? "Creator";
  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric",
  }).format(new Date());

  const hasChannels = accounts.length > 0;
  const weekStreak = hasChannels ? 3 : 0;
  const commentScore = hasChannels ? 96 : 0;
  const step1Done = hasChannels;
  const step2Done = totalPosts > 0;

  const handleQuickReply = async (commentId: string) => {
    const text = replyTextMap[commentId];
    if (!text?.trim()) return;
    try {
      await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, replyBody: text }),
      });
      setRepliedComments((prev) => ({ ...prev, [commentId]: true }));
      toast.success("Reply sent!");
    } catch {
      toast.error("Failed to post reply.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-zinc-900">
            {isNight ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <h1 className="text-2xl font-black tracking-tight">{greeting}, {firstName}!</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-medium">{todayStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-2xs"
          >
            <MessageSquarePlus className="w-4 h-4 text-zinc-500" />
            <span>Give Feedback</span>
          </button>
          <Link
            href="/compose"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Post</span>
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <DashboardKPIStrip
        hasChannels={hasChannels}
        weekStreak={weekStreak}
        postingGoal={postingGoal}
        commentScore={commentScore}
        onAdjustGoal={() => setShowGoalModal(true)}
      />

      {/* No-channels banner */}
      {!hasChannels && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-950">No social channels connected yet</h4>
              <p className="text-xs text-blue-800">
                Connect a channel to start tracking your posting streak, set weekly goals, and schedule content.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex-shrink-0 transition-colors shadow-xs"
          >
            Connect Channel Now
          </button>
        </div>
      )}

      {/* First Steps Checklist */}
      <FirstStepsChecklist
        steps={[
          {
            done: step1Done,
            label: "1. Connect a Channel",
            sub: step1Done ? `${accounts.length} channel(s) connected` : "Authorize Sandbox or live profile",
            onClick: () => { if (!step1Done) setShowConnectModal(true); },
          },
          {
            done: step2Done,
            label: "2. Create a Post",
            sub: step2Done ? `${totalPosts} post(s) created` : "Draft in Composer with AI copy",
            href: "/compose",
          },
          {
            done: step3Done,
            label: "3. Explore the API",
            sub: step3Done ? "Developer tools explored" : "Create API keys & inspect docs",
            href: "/settings/api-keys",
            onClick: () => setStep3Done(true),
          },
        ]}
      />

      {/* Up Next & Comments */}
      <DashboardUpNextPanel
        upcomingPosts={upcomingPosts}
        recentComments={recentComments}
        replyTextMap={replyTextMap}
        repliedComments={repliedComments}
        onReplyChange={(id, text) => setReplyTextMap((m) => ({ ...m, [id]: text }))}
        onQuickReply={handleQuickReply}
      />

      {/* Templates */}
      {templates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-900">Recommended Templates</h3>
              <p className="text-xs text-zinc-500">One-click content frameworks chosen for your workflow</p>
            </div>
            <Link href="/ideas" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-zinc-300 transition-all flex flex-col justify-between space-y-3 group">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">{tpl.category}</span>
                  <h4 className="font-bold text-xs text-zinc-900 mt-2">{tpl.name}</h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-relaxed">{tpl.description}</p>
                </div>
                <Link href={`/compose?template=${encodeURIComponent(tpl.body)}`} className="w-full text-center py-2 px-3 rounded-xl bg-zinc-50 group-hover:bg-blue-600 text-zinc-700 group-hover:text-white text-xs font-bold transition-all shadow-2xs">
                  Use in Composer →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
      {showGoalModal && (
        <GoalModal
          initialGoal={postingGoal}
          workspaceId={workspace.id}
          onClose={() => { setShowGoalModal(false); setPostingGoal(postingGoal); }}
        />
      )}
      <ConnectChannelModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        workspaceId={workspace.id}
      />
    </div>
  );
}
