"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toaster";
import type { PostsApiResponse } from "./types";

interface UsePostsParams {
  workspaceId: string | undefined;
  statusFilter: string;
  platformFilter: string;
  search: string;
  page: number;
  limit?: number;
}

export function usePosts({
  workspaceId,
  statusFilter,
  platformFilter,
  search,
  page,
  limit = 10,
}: UsePostsParams) {
  return useQuery<PostsApiResponse>({
    queryKey: ["posts", workspaceId, statusFilter, platformFilter, search, page],
    queryFn: async () => {
      if (!workspaceId) return { posts: [], total: 0, page, limit, pages: 1 };
      const params = new URLSearchParams({
        workspaceId,
        page: page.toString(),
        limit: limit.toString(),
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (platformFilter !== "ALL") params.append("platform", platformFilter);
      if (search.trim()) params.append("search", search.trim());
      const res = await fetch(`/api/posts?${params.toString()}`);
      const json = await res.json();
      return json.data ?? { posts: [], total: 0, page, limit, pages: 1 };
    },
    enabled: !!workspaceId,
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete post");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted", "The post has been removed successfully.");
    },
    onError: (err: Error) => toast.error("Delete failed", err.message),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async ({
      id,
      body,
      scheduledAt,
    }: {
      id: string;
      body: string;
      scheduledAt?: string;
    }) => {
      const payload: Record<string, unknown> = { body };
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
      toast.success("Post updated & rescheduled", "Your changes have been saved.");
    },
    onError: (err: Error) => toast.error("Update failed", err.message),
  });
}

export function useApprovePost() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
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
    onSuccess: (data: { message?: string }) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success(data.message ?? "Approval processed");
    },
    onError: (err: Error) => toast.error("Approval action failed", err.message),
  });
}
