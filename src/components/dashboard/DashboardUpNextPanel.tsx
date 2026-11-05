"use client";

import Link from "next/link";
import { Clock, ArrowRight, MessageCircle, Send, Check } from "lucide-react";

type UpcomingPost = {
  id: string;
  body: string;
  scheduledAt: string | null;
  postAccounts: Array<{ socialAccount: { platform: string; handle: string } }>;
};

type Comment = {
  id: string;
  authorName: string;
  authorHandle: string;
  body: string;
  platform: string;
  createdAt: string;
  replied: boolean;
};

interface DashboardUpNextPanelProps {
  upcomingPosts: UpcomingPost[];
  recentComments: Comment[];
  replyTextMap: Record<string, string>;
  repliedComments: Record<string, boolean>;
  onReplyChange: (id: string, text: string) => void;
  onQuickReply: (id: string) => void;
}

export function DashboardUpNextPanel({
  upcomingPosts,
  recentComments,
  replyTextMap,
  repliedComments,
  onReplyChange,
  onQuickReply,
}: DashboardUpNextPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Up Next */}
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
              <Link href="/compose" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline">
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
                <Link href={`/compose?postId=${post.id}`} className="text-xs font-bold text-zinc-400 hover:text-zinc-700 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors">
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Comments */}
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
              <p className="text-xs font-medium">Inbox Zero achieved!</p>
              <p className="text-[11px] text-zinc-400">All comments answered.</p>
            </div>
          ) : (
            recentComments.slice(0, 3).map((cmt, idx) => {
              const cid = `cmt_${idx}`;
              const isReplied = repliedComments[cid];
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50/70 border border-zinc-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900">{cmt.authorName}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{new Date(cmt.createdAt).toLocaleDateString()}</span>
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
                        value={replyTextMap[cid] || ""}
                        onChange={(e) => onReplyChange(cid, e.target.value)}
                        placeholder="Quick reply..."
                        className="flex-1 text-xs bg-white border border-zinc-200 rounded-xl px-2.5 py-1 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <button onClick={() => onQuickReply(cid)} className="p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
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
  );
}
