"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, Search, Image as ImageIcon, Film, FileImage } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/Card";
import { Spinner, EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toaster";
import { bytesToMb, formatDate, cn } from "@/lib/utils/helpers";

function useWorkspaceId() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      const json = await res.json();
      return (json.data ?? [])[0]?.id ?? null;
    },
  });
}

export default function MediaPage() {
  const { data: workspaceId } = useWorkspaceId();
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["media", workspaceId, search],
    queryFn: async () => {
      if (!workspaceId) return { assets: [], total: 0 };
      const params = new URLSearchParams({ workspaceId });
      if (search) params.set("search", search);
      const res = await fetch(`/api/media?${params}`);
      const json = await res.json();
      return json.data ?? { assets: [], total: 0 };
    },
    enabled: !!workspaceId,
  });

  async function uploadFiles(files: FileList | File[]) {
    if (!workspaceId) return;
    const fileArray = Array.from(files);
    setUploading(true);

    let successCount = 0;
    let failCount = 0;

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", workspaceId);

      const res = await fetch("/api/media", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        successCount++;
      } else {
        failCount++;
        console.error("Upload failed:", json.error);
      }
    }

    setUploading(false);
    qc.invalidateQueries({ queryKey: ["media"] });

    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? "s" : ""} uploaded`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} file${failCount > 1 ? "s" : ""} failed to upload`);
    }
  }

  async function deleteAsset(assetId: string) {
    // For demo, just invalidate — real implementation would call DELETE /api/media/:id
    toast.info("Delete functionality available in the full API");
  }

  const assets: Record<string, unknown>[] = data?.assets ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Media Library"
        description={`${data?.total ?? 0} assets uploaded`}
        action={
          <Button onClick={() => fileInputRef.current?.click()} loading={uploading} size="md">
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        aria-label="Upload media files"
      />

      {/* Upload Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center mb-5 transition-all cursor-pointer",
          dragOver
            ? "border-violet-400 bg-violet-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Spinner className="w-5 h-5" />
            <span className="text-sm text-gray-500">Uploading…</span>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-charcoal">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, WebM) — max 50 MB each
            </p>
          </>
        )}
      </div>

      {/* Search */}
      <div className="mb-5">
        <Input
          id="media-search"
          type="search"
          placeholder="Search media files…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="max-w-sm"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner />
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-6 h-6" />}
          title="No media assets yet"
          description="Upload images and videos to use in your posts."
          action={
            <Button onClick={() => fileInputRef.current?.click()} size="sm">
              <Upload className="w-3.5 h-3.5" />
              Upload your first file
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {assets.map((asset) => {
            const isVideo = (asset.mimeType as string)?.startsWith("video/");
            return (
              <div
                key={asset.id as string}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <Film className="w-6 h-6" />
                      <span className="text-[10px]">Video</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.url as string}
                      alt={asset.originalName as string}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-[11px] font-medium text-charcoal truncate" title={asset.originalName as string}>
                    {asset.originalName as string}
                  </p>
                  <p className="text-[10px] text-gray-400">{bytesToMb(asset.size as number)}</p>
                </div>

                {/* Delete overlay */}
                <button
                  onClick={() => deleteAsset(asset.id as string)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-400"
                  aria-label="Delete asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
