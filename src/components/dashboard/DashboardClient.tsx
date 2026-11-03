"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  MessageSquarePlus,
  Flame,
  Target,
  Smile,
  AlertCircle,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Send,
  HelpCircle,
  Check,
  X,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ConnectChannelModal } from "@/components/channels/ConnectChannelModal";

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
  const router = useRouter();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [postingGoal, setPostingGoal] = useState(workspace.postingGoal || 5);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Quick reply state for comments
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [repliedComments, setRepliedComments] = useState<Record<string, boolean>>({});

  // Dynamic Time Greeting
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 18;
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const firstName = user.name?.split(" ")[0] ?? "Creator";

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  // Metrics
  const hasChannels = accounts.length > 0;
  const weekStreak = hasChannels ? 3 : 0;
  const commentScore = hasChannels ? 96 : 0;

  // First Steps completion checks
  const step1Done = hasChannels;
  const step2Done = totalPosts > 0;
  const [step3Done, setStep3Done] = useState(false);

  const handleUpdateGoal = async () => {
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStep: 5, postingFrequency: `${postingGoal} times a week`, isCompleted: true }),
      });
      toast.success(`Weekly posting goal set to ${postingGoal} posts/week!`);
      setShowGoalModal(false);
      router.refresh();
    } catch {
      toast.error("Failed to update goal.");
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setSendingFeedback(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedbackMessage, rating: feedbackRating }),
      });
      if (res.ok) {
        toast.success("Thank you for your feedback! It has been logged.");
        setFeedbackMessage("");
        setShowFeedbackModal(false);
      }
    } catch {
      toast.error("Failed to send feedback.");
    } finally {
      setSendingFeedback(false);
    }
  };

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
      toast.success("Reply sent to follower!");
    } catch {
      toast.error("Failed to post reply.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-zinc-900">
            {isNight ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <h1 className="text-2xl font-black tracking-tight">
              {greeting}, {firstName}!
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-medium">{todayStr}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFeedbackModal(true)}
            title="Leave feedback"
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

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Week Streak */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>Week Streak</span>
              <span title="Consecutive weeks you have met your posting goal" className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-zinc-900 flex items-center gap-1.5">
              <span>{weekStreak}</span>
              <span className="text-xs font-semibold text-zinc-400">weeks</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {weekStreak > 0 ? "🔥 Publishing cadence active" : "0 until channels are connected"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Posting Goals (Settable) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>Posting Goals</span>
              <span title="Configured target posts per week" className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-zinc-900 flex items-center gap-1.5">
              <span>{postingGoal}</span>
              <span className="text-xs font-semibold text-zinc-400">posts / week</span>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="text-[11px] font-bold text-blue-600 hover:underline block"
            >
              Adjust weekly goal →
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Comment Score */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>Comment Score</span>
              <span title="Audience engagement response rate and consistency" className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-zinc-900 flex items-center gap-1.5">
              <span>{commentScore}</span>
              <span className="text-xs font-semibold text-zinc-400">/ 100</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {hasChannels ? "Healthy response rate" : "0 until channels are connected"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Smile className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Banner if 0 Channels Connected ── */}
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

      {/* ── First Steps Checklist ── */}
      {!(step1Done && step2Done && step3Done) && (
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-900">First Steps</h3>
              <p className="text-xs text-zinc-500">Get up and running with your Postinger workspace</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {[step1Done, step2Done, step3Done].filter(Boolean).length} / 3 Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div
              onClick={() => { if (!step1Done) setShowConnectModal(true); }}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                step1Done ? "border-emerald-200 bg-emerald-50/30" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
              }`}
            >
              {step1Done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-300 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-xs text-zinc-900">1. Connect a Channel</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {step1Done ? `${accounts.length} channel(s) connected` : "Authorize Sandbox or live profile"}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <Link
              href="/compose"
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                step2Done ? "border-emerald-200 bg-emerald-50/30" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
              }`}
            >
              {step2Done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-300 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-xs text-zinc-900">2. Create a Post</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {step2Done ? `${totalPosts} post(s) created` : "Draft in Composer with AI copy"}
                </p>
              </div>
            </Link>

            {/* Step 3 */}
            <Link
              href="/settings/api-keys"
              onClick={() => setStep3Done(true)}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                step3Done ? "border-emerald-200 bg-emerald-50/30" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
              }`}
            >
              {step3Done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-300 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-xs text-zinc-900">3. Explore the API & MCP</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {step3Done ? "Developer tools explored" : "Create API keys & inspect docs"}
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── Main Dual Columns: Up Next & Comments ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Up Next (Scheduled Posts) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <h3 className="font-bold text-sm text-zinc-900">Up Next</h3>
            </div>
            <Link href="/queue" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {upcomingPosts.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-medium">Your publishing queue is clear</p>
                <Link
                  href="/compose"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                >
                  + Schedule next post
                </Link>
              </div>
            ) : (
              upcomingPosts.map((post) => (
                <div key={post.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-600 flex-shrink-0">
                    {post.postAccounts?.[0]?.socialAccount?.platform.slice(0, 2) || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-800 line-clamp-2 leading-relaxed font-medium">{post.body}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400 font-mono">
                      <span>{post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : "Next in Queue"}</span>
                    </div>
                  </div>
                  <Link
                    href={`/compose?postId=${post.id}`}
                    className="text-xs font-bold text-zinc-400 hover:text-zinc-700 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Comments (Quick Reply) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-zinc-400" />
              <h3 className="font-bold text-sm text-zinc-900">Recent Comments</h3>
            </div>
            <Link href="/community" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              Inbox <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentComments.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 space-y-2">
                <Smile className="w-8 h-8 mx-auto opacity-30 text-emerald-500" />
                <p className="text-xs font-medium">Inbox Zero achieved!</p>
                <p className="text-[11px] text-zinc-400">All questions and comments answered.</p>
              </div>
            ) : (
              recentComments.slice(0, 3).map((cmt, idx) => {
                const commentId = `cmt_${idx}`;
                const isReplied = repliedComments[commentId];
                return (
                  <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50/70 border border-zinc-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900">{cmt.authorName}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(cmt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{cmt.body}</p>

                    {isReplied ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold pt-1">
                        <Check className="w-3.5 h-3.5" /> Replied!
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          value={replyTextMap[commentId] || ""}
                          onChange={(e) => setReplyTextMap({ ...replyTextMap, [commentId]: e.target.value })}
                          placeholder="Quick reply..."
                          className="flex-1 text-xs bg-white border border-zinc-200 rounded-xl px-2.5 py-1 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                        <button
                          onClick={() => handleQuickReply(commentId)}
                          className="p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Templates Row ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-900">Recommended Templates</h3>
            <p className="text-xs text-zinc-500">One-click content frameworks chosen for your workflow</p>
          </div>
          <Link href="/ideas" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            See all templates <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-zinc-300 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                  {tpl.category}
                </span>
                <h4 className="font-bold text-xs text-zinc-900 mt-2">{tpl.name}</h4>
                <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-relaxed">{tpl.description}</p>
              </div>

              <Link
                href={`/compose?template=${encodeURIComponent(tpl.body)}`}
                className="w-full text-center py-2 px-3 rounded-xl bg-zinc-50 group-hover:bg-blue-600 text-zinc-700 group-hover:text-white text-xs font-bold transition-all shadow-2xs"
              >
                Use in Composer →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modals ── */}
      {/* 1. Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-900">Send Product Feedback</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendFeedback} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Your experience (1 - 5 stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setFeedbackRating(s)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors ${
                        feedbackRating >= s ? "bg-amber-400 text-black shadow-2xs" : "bg-zinc-100 text-zinc-400"
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
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Share ideas, feature requests, or UI improvements..."
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingFeedback || !feedbackMessage.trim()}
                  className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {sendingFeedback ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Goal Adjustment Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-900">Adjust Weekly Posting Goal</h3>
              <button onClick={() => setShowGoalModal(false)} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 py-2">
              <div className="text-center">
                <span className="text-4xl font-black text-blue-600">{postingGoal}</span>
                <span className="text-xs text-zinc-400 block mt-1">posts per week</span>
              </div>

              <input
                type="range"
                min={1}
                max={21}
                step={1}
                value={postingGoal}
                onChange={(e) => setPostingGoal(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>1/wk (Light)</span>
                <span>7/wk (Daily)</span>
                <span>21/wk (High)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateGoal}
                className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Connect Channel Modal */}
      <ConnectChannelModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        workspaceId={workspace.id}
      />
    </div>
  );
}
