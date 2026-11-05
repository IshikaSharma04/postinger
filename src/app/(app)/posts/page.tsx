"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, Filter, Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/States";
import { cn } from "@/lib/utils/helpers";
import { usePosts, useDeletePost, useUpdatePost, useApprovePost } from "@/components/posts/usePosts";
import { PostRow } from "@/components/posts/PostRow";
import { PostDetailModal } from "@/components/posts/PostDetailModal";
import { PostEditModal } from "@/components/posts/PostEditModal";
import type { PostListItem } from "@/components/posts/types";

const STATUS_TABS = [
  { key: "ALL", label: "All Posts" },
  { key: "NEEDS_APPROVAL", label: "Needs Approval" },
  { key: "DRAFT", label: "Drafts" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "PUBLISHED", label: "Published" },
  { key: "FAILED", label: "Failed" },
];

function useWorkspace() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      const json = await res.json();
      return (json.data ?? [])[0] ?? null;
    },
  });
}

export default function AllPostsPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewingPost, setViewingPost] = useState<PostListItem | null>(null);
  const [editingPost, setEditingPost] = useState<PostListItem | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");

  const LIMIT = 10;

  const { data: postsData, isLoading: postsLoading } = usePosts({
    workspaceId: workspace?.id,
    statusFilter,
    platformFilter,
    search,
    page,
    limit: LIMIT,
  });

  const deleteMutation = useDeletePost();
  const updateMutation = useUpdatePost();
  const approveMutation = useApprovePost();

  const posts = postsData?.posts ?? [];
  const total = postsData?.total ?? 0;
  const totalPages = postsData?.pages ?? 1;

  function openEdit(post: PostListItem) {
    setEditingPost(post);
    setEditBody(post.body);
    setEditScheduledAt(post.scheduledAt ? post.scheduledAt.slice(0, 16) : "");
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app">Content Library</h1>
          <p className="text-sm text-secondary mt-0.5">
            Manage, filter, and track all social media posts across your workspace.
          </p>
        </div>
        <Link href="/compose">
          <Button variant="primary">
            <Plus className="w-4 h-4 text-blue-400" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface border border-app rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-app pb-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
                statusFilter === tab.key
                  ? "bg-[#0d0d0e] text-white shadow-xs"
                  : "text-secondary hover:text-app hover:bg-surface-subtle"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search posts by caption, title, or keyword..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-app bg-white text-xs text-app outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-secondary" />
            <select
              value={platformFilter}
              onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
              aria-label="Filter by social platform"
              className="h-9 px-3 rounded-xl border border-app bg-white text-xs font-medium text-app outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
            >
              <option value="ALL">All Networks</option>
              <option value="TWITTER">Twitter / X</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="TIKTOK">TikTok</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-surface border border-app rounded-2xl overflow-hidden shadow-xs">
        {postsLoading || wsLoading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Spinner className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-xs text-secondary">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center mx-auto mb-3 border border-app">
              <Calendar className="w-5 h-5 text-tertiary" />
            </div>
            <h3 className="text-sm font-semibold text-app mb-1">No posts found</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto mb-4">
              {search || statusFilter !== "ALL" || platformFilter !== "ALL"
                ? "Try adjusting your filters or search terms."
                : "You haven't created any posts in this workspace yet."}
            </p>
            <Link href="/compose">
              <Button variant="secondary" size="sm">Create First Post</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fcfcfb] border-b border-app text-[11px] font-semibold text-secondary uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Content</th>
                  <th className="py-3 px-4">Destinations</th>
                  <th className="py-3 px-4">Timing</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {posts.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onView={setViewingPost}
                    onDelete={(id) => deleteMutation.mutate(id, { onSuccess: () => setViewingPost(null) })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-app flex items-center justify-between bg-[#fcfcfb] text-xs">
            <span className="text-secondary">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} posts
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 rounded-lg border border-app bg-white disabled:opacity-40 hover:bg-surface-subtle transition-colors flex items-center gap-1 font-medium text-app"
              >
                <ChevronLeft className="w-3.5 h-3.5" />Previous
              </button>
              <span className="px-2 font-medium text-secondary">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 rounded-lg border border-app bg-white disabled:opacity-40 hover:bg-surface-subtle transition-colors flex items-center gap-1 font-medium text-app"
              >
                Next<ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {viewingPost && (
        <PostDetailModal
          post={viewingPost}
          onClose={() => setViewingPost(null)}
          onApprove={(postId, decision) =>
            approveMutation.mutate({ postId, decision }, { onSuccess: () => setViewingPost(null) })
          }
          approvalPending={approveMutation.isPending}
        />
      )}

      {editingPost && (
        <PostEditModal
          post={editingPost}
          body={editBody}
          scheduledAt={editScheduledAt}
          onBodyChange={setEditBody}
          onScheduledAtChange={setEditScheduledAt}
          onClose={() => setEditingPost(null)}
          onSave={(id, body, scheduledAt) =>
            updateMutation.mutate({ id, body, scheduledAt }, { onSuccess: () => setEditingPost(null) })
          }
          saving={updateMutation.isPending}
        />
      )}
    </div>
  );
}
