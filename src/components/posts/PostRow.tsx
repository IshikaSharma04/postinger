"use client";

import Link from "next/link";
import { Clock, Copy, Edit2, Eye, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, cn } from "@/lib/utils/helpers";
import type { PostListItem } from "./types";

const PLATFORM_META: Record<string, { bg: string; text: string; icon: string }> = {
  TWITTER:   { bg: "bg-[#1da1f2]/10", text: "text-[#1da1f2]", icon: "𝕏" },
  INSTAGRAM: { bg: "bg-[#e1306c]/10", text: "text-[#e1306c]", icon: "IG" },
  LINKEDIN:  { bg: "bg-[#0077b5]/10", text: "text-[#0077b5]", icon: "in" },
  FACEBOOK:  { bg: "bg-[#1877f2]/10", text: "text-[#1877f2]", icon: "f" },
  TIKTOK:    { bg: "bg-[#000000]/10", text: "text-[#000000]", icon: "TT" },
};

interface PostRowProps {
  post: PostListItem;
  onView: (post: PostListItem) => void;
  onDelete: (postId: string) => void;
}

export function PostRow({ post, onView, onDelete }: PostRowProps) {
  return (
    <tr className="hover:bg-surface-subtle/70 transition-colors group">
      {/* Content */}
      <td className="py-3.5 px-5 max-w-sm">
        <div className="space-y-1">
          {post.title && (
            <p className="font-semibold text-app truncate">{post.title}</p>
          )}
          <p className="text-secondary line-clamp-2 leading-relaxed">{post.body}</p>
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {post.hashtags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] text-blue-600 font-medium">
                  #{tag}
                </span>
              ))}
              {post.hashtags.length > 3 && (
                <span className="text-[10px] text-tertiary">
                  +{post.hashtags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* Platforms */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          {post.postAccounts.length > 0 ? (
            post.postAccounts.map((pa) => {
              const meta = PLATFORM_META[pa.socialAccount.platform] ?? {
                bg: "bg-gray-100",
                text: "text-gray-700",
                icon: "?",
              };
              return (
                <span
                  key={pa.socialAccount.id}
                  title={`@${pa.socialAccount.handle} (${pa.socialAccount.platform})`}
                  className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] border border-black/5",
                    meta.bg,
                    meta.text
                  )}
                >
                  {meta.icon}
                </span>
              );
            })
          ) : (
            <span className="text-tertiary italic">None</span>
          )}
        </div>
      </td>

      {/* Timing */}
      <td className="py-3.5 px-4 whitespace-nowrap text-secondary">
        {post.status === "SCHEDULED" && post.scheduledAt ? (
          <div className="flex items-center gap-1.5 font-medium text-blue-700">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{formatDate(post.scheduledAt, "MMM d, h:mm a")}</span>
          </div>
        ) : post.status === "PUBLISHED" && post.publishedAt ? (
          <span className="text-emerald-700">
            {formatDate(post.publishedAt, "MMM d, h:mm a")}
          </span>
        ) : (
          <span className="text-tertiary">
            Created {formatDate(post.createdAt, "MMM d")}
          </span>
        )}
      </td>

      {/* Author */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="font-medium text-app">
          {post.author?.name ?? "Team member"}
        </span>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <StatusBadge status={post.status} />
      </td>

      {/* Actions */}
      <td className="py-3.5 px-5 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onView(post)}
            className="p-1.5 rounded-lg text-secondary hover:text-app hover:bg-white border border-transparent hover:border-app transition-all"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {post.status !== "PUBLISHED" && (
            <Link
              href={`/compose?edit=${post.id}`}
              className="p-1.5 rounded-lg text-secondary hover:text-blue-600 hover:bg-white border border-transparent hover:border-app transition-all"
              title="Open in Composer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            href={`/compose?duplicate=${post.id}`}
            className="p-1.5 rounded-lg text-secondary hover:text-purple-600 hover:bg-white border border-transparent hover:border-app transition-all"
            title="Duplicate as New Draft"
          >
            <Copy className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this post?")) {
                onDelete(post.id);
              }
            }}
            className="p-1.5 rounded-lg text-secondary hover:text-red-600 hover:bg-white border border-transparent hover:border-app transition-all"
            title="Delete Post"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
