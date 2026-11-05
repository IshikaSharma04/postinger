"use client";

import Link from "next/link";
import { X, Edit2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/helpers";
import type { PostListItem } from "./types";

interface PostDetailModalProps {
  post: PostListItem;
  onClose: () => void;
  onApprove: (postId: string, decision: "APPROVE" | "REJECT") => void;
  approvalPending: boolean;
}

export function PostDetailModal({
  post,
  onClose,
  onApprove,
  approvalPending,
}: PostDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-app rounded-2xl max-w-lg w-full p-6 shadow-xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-app">
          <div className="flex items-center gap-2">
            <StatusBadge status={post.status} />
            <span className="text-xs text-secondary">ID: {post.id.slice(0, 10)}...</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-tertiary hover:text-app hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {post.title && (
          <h3 className="text-base font-bold text-app">{post.title}</h3>
        )}

        {/* Body */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-app">
          <p className="text-sm text-app whitespace-pre-wrap leading-relaxed">{post.body}</p>
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-app">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-app bg-surface">
            <span className="text-secondary block mb-1">Target Networks</span>
            <div className="flex items-center gap-1 flex-wrap">
              {post.postAccounts.map((pa) => (
                <span
                  key={pa.socialAccount.id}
                  className="px-2 py-0.5 rounded font-medium bg-surface-subtle border border-app text-[11px]"
                >
                  @{pa.socialAccount.handle}
                </span>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-app bg-surface">
            <span className="text-secondary block mb-1">Timing</span>
            <span className="font-medium text-app">
              {post.scheduledAt
                ? formatDate(post.scheduledAt, "MMM d, h:mm a")
                : "Draft"}
            </span>
          </div>
        </div>

        {/* Approval banner */}
        {post.status === "NEEDS_APPROVAL" && (
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-bold text-purple-900 block">Needs Your Approval</span>
              <span className="text-purple-700 text-[11px]">
                Submitted by {post.author?.name ?? "Team member"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onApprove(post.id, "REJECT")}
                disabled={approvalPending}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 text-xs font-bold transition-colors"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onApprove(post.id, "APPROVE")}
                disabled={approvalPending}
                className="btn-brand-lime px-3.5 py-1.5 text-xs font-bold shadow-xs"
              >
                Approve Post
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          {post.status !== "PUBLISHED" && (
            <Link href={`/compose?edit=${post.id}`}>
              <Button variant="primary" size="sm">
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                Open in Composer
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
