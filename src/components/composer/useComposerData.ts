import { useQuery } from "@tanstack/react-query";

export interface ComposerAccount {
  id: string;
  platform: string;
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface MediaAssetItem {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface EditPostData {
  id: string;
  body: string;
  hashtags?: string[];
  scheduledAt?: string | null;
  postAccounts?: { socialAccountId: string }[];
  mediaAttachments?: { assetId: string }[];
}

export function useComposerData(editId: string | null) {
  const workspaceQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      const json = await res.json();
      return (json.data ?? [])[0] ?? null;
    },
  });

  const workspace = workspaceQuery.data;

  const accountsQuery = useQuery({
    queryKey: ["accounts", workspace?.id],
    queryFn: async (): Promise<ComposerAccount[]> => {
      if (!workspace?.id) return [];
      const res = await fetch(`/api/accounts?workspaceId=${workspace.id}`);
      const json = await res.json();
      return (json.data ?? []) as ComposerAccount[];
    },
    enabled: !!workspace?.id,
  });

  const mediaQuery = useQuery({
    queryKey: ["media", workspace?.id],
    queryFn: async (): Promise<MediaAssetItem[]> => {
      if (!workspace?.id) return [];
      const res = await fetch(`/api/media?workspaceId=${workspace.id}&limit=50`);
      const json = await res.json();
      return (json.data?.assets ?? []) as MediaAssetItem[];
    },
    enabled: !!workspace?.id,
  });

  const editPostQuery = useQuery({
    queryKey: ["post", editId],
    queryFn: async (): Promise<EditPostData | null> => {
      if (!editId) return null;
      const res = await fetch(`/api/posts/${editId}`);
      const json = await res.json();
      return (json.data ?? null) as EditPostData | null;
    },
    enabled: !!editId,
  });

  return {
    workspace,
    accounts: accountsQuery.data ?? [],
    mediaAssets: mediaQuery.data ?? [],
    editPost: editPostQuery.data,
    isLoading: workspaceQuery.isLoading || (Boolean(editId) && editPostQuery.isLoading),
    refetchMedia: mediaQuery.refetch,
  };
}
