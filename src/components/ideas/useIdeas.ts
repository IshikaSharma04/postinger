import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toaster";

export interface TagItem {
  text: string;
  bg: string;
  color: string;
}

export interface IdeaCard {
  id: string;
  title: string;
  notes: string;
  imageUrl?: string;
  tags: TagItem[];
  status: "UNASSIGNED" | "REVIEW" | "DONE";
  createdAt: string;
}

export interface CreateIdeaPayload {
  title: string;
  content?: string;
  mediaUrl?: string;
  tags?: string[];
  status?: string;
}

const TAG_PALETTE = [
  { bg: "bg-purple-50", color: "text-purple-700" },
  { bg: "bg-blue-50", color: "text-blue-700" },
  { bg: "bg-orange-50", color: "text-orange-700" },
  { bg: "bg-amber-50", color: "text-amber-700" },
  { bg: "bg-emerald-50", color: "text-emerald-700" },
  { bg: "bg-pink-50", color: "text-pink-700" },
];

export function formatTags(tagList: string[]): TagItem[] {
  return tagList.map((t, idx) => {
    const palette = TAG_PALETTE[idx % TAG_PALETTE.length];
    return {
      text: t,
      bg: palette.bg,
      color: palette.color,
    };
  });
}

export function useIdeas(workspaceId: string | null) {
  const qc = useQueryClient();
  const toast = useToast();

  const ideasQuery = useQuery({
    queryKey: ["ideas", workspaceId],
    queryFn: async (): Promise<IdeaCard[]> => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/ideas?workspaceId=${workspaceId}`);
      const json = await res.json();
      if (!json.success || !json.data?.ideas) return [];

      interface RawIdea {
        id: string;
        title: string;
        content?: string | null;
        mediaUrl?: string | null;
        tags?: string[];
        status: "UNASSIGNED" | "REVIEW" | "DONE";
        createdAt: string;
      }

      return (json.data.ideas as RawIdea[]).map((item) => ({
        id: item.id,
        title: item.title,
        notes: item.content || "",
        imageUrl: item.mediaUrl || undefined,
        tags: formatTags(item.tags || []),
        status: item.status,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      }));
    },
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateIdeaPayload) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: payload.title,
          content: payload.content || "",
          mediaUrl: payload.mediaUrl,
          tags: payload.tags || [],
          status: payload.status || "UNASSIGNED",
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create idea");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ideas", workspaceId] });
      toast.success("New idea added to your scratchpad!");
    },
    onError: (err: Error) => {
      toast.error("Could not save idea", err.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "UNASSIGNED" | "REVIEW" | "DONE" }) => {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update status");
      return json.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["ideas", workspaceId] });
      toast.success(`Idea moved to ${vars.status.toLowerCase()}!`);
    },
    onError: (err: Error) => {
      toast.error("Could not move idea", err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete idea");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ideas", workspaceId] });
      toast.success("Idea removed");
    },
    onError: (err: Error) => {
      toast.error("Could not delete idea", err.message);
    },
  });

  return {
    ideas: ideasQuery.data ?? [],
    isLoading: ideasQuery.isLoading,
    createIdea: createMutation.mutateAsync,
    updateStatus: (id: string, status: "UNASSIGNED" | "REVIEW" | "DONE") =>
      updateStatusMutation.mutate({ id, status }),
    deleteIdea: deleteMutation.mutate,
  };
}
