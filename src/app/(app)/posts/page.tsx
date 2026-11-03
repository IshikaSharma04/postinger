"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Copy,
} from "lucide-react";
import { PageHeader, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Spinner, EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toaster";
import { formatDate, truncate, cn } from "@/lib/utils/helpers";

const PLATFORM_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  TWITTER: { bg: "bg-[#1da1f2]/10", text: "text-[#1da1f2]", icon: "𝕏" },
  INSTAGRAM: { bg: "bg-[#e1306c]/10", text: "text-[#e1306c]", icon: "IG" },
  LINKEDIN: { bg: "bg-[#0077b5]/10", text: "text-[#0077b5]", icon: "in" },
  FACEBOOK: { bg: "bg-[#1877f2]/10", text: "text-[#1877f2]", icon: "f" },
  TIKTOK: { bg: "bg-[#000000]/10", text: "text-[#000000]", icon: "TT" },
};

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
  const toast = useToast();
  const qc = useQueryClient();
  const { data: workspace, isLoading: wsLoading } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Modals state
  const [viewingPost, setViewingPost] = useState<any | null>(null);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");

  const limit = 10;

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["posts", workspace?.id, statusFilter, platformFilter, search, page],
    queryFn: async () => {
      if (!workspace?.id) return { posts: [], total: 0, pages: 1 };
      const params = new URLSearchParams({
        workspaceId: workspace.id,
        page: page.toString(),
        limit: limit.toString(),
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (platformFilter !== "ALL") params.append("platform", platformFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/posts?${params.toString()}`);
      const json = await res.json();
      return json.data ?? { posts: [], total: 0, pages: 1 };
    },
    enabled: !!workspace?.id,
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete post");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted", "The post has been removed successfully.");
      setViewingPost(null);
    },
    onError: (err: any) => {
      toast.error("Delete failed", err.message);
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, body, scheduledAt }: { id: string; body: string; scheduledAt?: string }) => {
      const payload: Record<string, any> = { body };
      if (scheduledAt) {
        payload.scheduledAt = new Date(scheduledAt).toISOString();
        payload.action = "SCHEDULE";
        payload.status = "SCHEDULED";
      }
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update post");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post updated & rescheduled", "Your changes have been saved to your workspace.");
      setEditingPost(null);
    },
    onError: (err: any) => {
      toast.error("Update failed", err.message);
    },
  });


  const posts = postsData?.posts ?? [];
  const total = postsData?.total ?? 0;
  const totalPages = postsData?.pages ?? 1;

  const approveMutation = useMutation({
    mutationFn: async ({
      postId,
      decision,
      notes,
    }: {
      postId: string;
      decision: "APPROVE" | "REJECT";
      notes?: string;
    }) => {
      const res = await fetch(`/api/posts/${postId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to process approval");
      return json.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success(data.message ?? "Approval processed");
      setViewingPost(null);
    },
    onError: (err: any) => {
      toast.error("Approval action failed", err.message);
    },
  });

  const statusTabs = [
    { key: "ALL", label: "All Posts" },
    { key: "NEEDS_APPROVAL", label: "Needs Approval" },
    { key: "DRAFT", label: "Drafts" },
    { key: "SCHEDULED", label: "Scheduled" },
    { key: "PUBLISHED", label: "Published" },
    { key: "FAILED", label: "Failed" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Header ── */}
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

      {/* ── Filter & Search Toolbar ── */}
      <div className="bg-surface border border-app rounded-2xl p-4 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-app pb-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
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

        {/* Search & Platform Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search posts by caption, title, or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-app bg-white text-xs text-app outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-secondary" />
            <select
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value);
                setPage(1);
              }}
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

      {/* ── Posts Table ── */}
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
              <Button variant="secondary" size="sm">
                Create First Post
              </Button>
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
                {posts.map((post: any) => (
                  <tr
                    key={post.id}
                    className="hover:bg-surface-subtle/70 transition-colors group"
                  >
                    {/* Post Content */}
                    <td className="py-3.5 px-5 max-w-sm">
                      <div className="space-y-1">
                        {post.title && (
                          <p className="font-semibold text-app truncate">{post.title}</p>
                        )}
                        <p className="text-secondary line-clamp-2 leading-relaxed">
                          {post.body}
                        </p>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {post.hashtags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="text-[10px] text-blue-600 font-medium"
                              >
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
                        {post.postAccounts?.length > 0 ? (
                          post.postAccounts.map((pa: any) => {
                            const p = pa.socialAccount.platform;
                            const meta = PLATFORM_COLORS[p] ?? {
                              bg: "bg-gray-100",
                              text: "text-gray-700",
                              icon: "?",
                            };
                            return (
                              <span
                                key={pa.socialAccount.id}
                                title={`@${pa.socialAccount.handle} (${p})`}
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
                          onClick={() => setViewingPost(post)}
                          className="p-1.5 rounded-lg text-secondary hover:text-app hover:bg-white border border-transparent hover:border-app transition-all"
                          title="View Details & Analytics"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {post.status !== "PUBLISHED" && (
                          <Link
                            href={`/compose?edit=${post.id}`}
                            className="p-1.5 rounded-lg text-secondary hover:text-blue-600 hover:bg-white border border-transparent hover:border-app transition-all"
                            title="Open in Composer (Channel Customization)"
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
                              deletePostMutation.mutate(post.id);
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-app flex items-center justify-between bg-[#fcfcfb] text-xs">
            <span className="text-secondary">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} posts
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 rounded-lg border border-app bg-white disabled:opacity-40 hover:bg-surface-subtle transition-colors flex items-center gap-1 font-medium text-app"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <span className="px-2 font-medium text-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 rounded-lg border border-app bg-white disabled:opacity-40 hover:bg-surface-subtle transition-colors flex items-center gap-1 font-medium text-app"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── View Post Detail Drawer / Modal ── */}
      {viewingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-app rounded-2xl max-w-lg w-full p-6 shadow-xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <div className="flex items-center gap-2">
                <StatusBadge status={viewingPost.status} />
                <span className="text-xs text-secondary">
                  ID: {viewingPost.id.slice(0, 10)}...
                </span>
              </div>
              <button
                onClick={() => setViewingPost(null)}
                className="p-1 rounded-lg text-tertiary hover:text-app hover:bg-surface-subtle transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {viewingPost.title && (
              <h3 className="text-base font-bold text-app">{viewingPost.title}</h3>
            )}

            <div className="p-4 rounded-xl bg-surface-subtle border border-app">
              <p className="text-sm text-app whitespace-pre-wrap leading-relaxed">
                {viewingPost.body}
              </p>
              {viewingPost.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-app">
                  {viewingPost.hashtags.map((tag: string) => (
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

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-app bg-surface">
                <span className="text-secondary block mb-1">Target Networks</span>
                <div className="flex items-center gap-1">
                  {viewingPost.postAccounts?.map((pa: any) => (
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
                  {viewingPost.scheduledAt
                    ? formatDate(viewingPost.scheduledAt, "MMM d, h:mm a")
                    : "Draft"}
                </span>
              </div>
            </div>

            {viewingPost.status === "NEEDS_APPROVAL" && (
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-bold text-purple-900 block">Needs Your Approval</span>
                  <span className="text-purple-700 text-[11px]">Submitted by {viewingPost.author?.name ?? "Team member"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => approveMutation.mutate({ postId: viewingPost.id, decision: "REJECT" })}
                    disabled={approveMutation.isPending}
                    className="px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 text-xs font-bold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => approveMutation.mutate({ postId: viewingPost.id, decision: "APPROVE" })}
                    disabled={approveMutation.isPending}
                    className="btn-buffer-lime px-3.5 py-1.5 text-xs font-bold shadow-xs"
                  >
                    Approve Post
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingPost(null)}
              >
                Close
              </Button>
              {viewingPost.status !== "PUBLISHED" && (
                <Link href={`/compose?edit=${viewingPost.id}`}>
                  <Button variant="primary" size="sm">
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Open in Composer
                  </Button>
                </Link>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Edit / Reschedule Modal ── */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-app rounded-2xl max-w-lg w-full p-6 shadow-xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-sm font-bold text-app">Edit &amp; Reschedule Post</h3>
              <button
                onClick={() => setEditingPost(null)}
                className="p-1 rounded-lg text-tertiary hover:text-app hover:bg-surface-subtle transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Post Caption
                </label>
                <textarea
                  rows={4}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full p-3 rounded-xl border border-app bg-white text-xs text-app outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Reschedule Publish Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={editScheduledAt}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setEditScheduledAt(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-app bg-white text-xs text-app outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingPost(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={updatePostMutation.isPending}
                onClick={() => {
                  if (!editBody.trim()) {
                    toast.warning("Body cannot be empty");
                    return;
                  }
                  updatePostMutation.mutate({
                    id: editingPost.id,
                    body: editBody.trim(),
                    scheduledAt: editScheduledAt || undefined,
                  });
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
