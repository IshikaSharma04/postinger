export interface ImportedMediaItem {
  id: string;
  source: "unsplash" | "google_drive" | "dropbox" | "onedrive" | "canva" | "local";
  url: string;
  thumbnailUrl: string;
  title: string;
  author?: string;
  width?: number;
  height?: number;
}

export interface MediaSourceAdapter {
  id: string;
  name: string;
  description: string;
  isConfigured: boolean;
  search(query: string, page?: number): Promise<ImportedMediaItem[]>;
}

// ── Working Unsplash Adapter ──────────────────────────────────────────────────

export const unsplashAdapter: MediaSourceAdapter = {
  id: "unsplash",
  name: "Unsplash",
  description: "Millions of free high-resolution commercial images",
  isConfigured: true,
  async search(query: string, page = 1): Promise<ImportedMediaItem[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (accessKey) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query || "minimal social")}&page=${page}&per_page=12`,
          { headers: { Authorization: `Client-ID ${accessKey}` } }
        );
        const data = await res.json();
        if (Array.isArray(data.results)) {
          return data.results.map((r: any) => ({
            id: r.id,
            source: "unsplash",
            url: r.urls.regular,
            thumbnailUrl: r.urls.small,
            title: r.alt_description || "Unsplash Photo",
            author: r.user?.name || "Unsplash Creator",
            width: r.width,
            height: r.height,
          }));
        }
      } catch (err) {
        console.error("[Unsplash API error]:", err);
      }
    }

    // Curated high-res Unsplash stock library fallback
    const curated = [
      { id: "cur_1", q: "workspace", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80", title: "Modern Studio Desk" },
      { id: "cur_2", q: "creator", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80", title: "Creator Portrait" },
      { id: "cur_3", q: "design", url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80", title: "Abstract Architecture" },
      { id: "cur_4", q: "coffee", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80", title: "Coffee & Planning" },
      { id: "cur_5", q: "launch", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80", title: "Team Strategy" },
      { id: "cur_6", q: "growth", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80", title: "Analytics & Growth" },
    ];

    return curated.map((item) => ({
      id: item.id,
      source: "unsplash",
      url: item.url,
      thumbnailUrl: item.url.replace("w=1200", "w=400"),
      title: item.title,
      author: "Verified Unsplash Photographer",
    }));
  },
};

// ── Clean Stubs for Cloud Storage Adapters ────────────────────────────────────

function createCloudStub(id: string, name: string, description: string): MediaSourceAdapter {
  return {
    id,
    name,
    description,
    isConfigured: false,
    async search(): Promise<ImportedMediaItem[]> {
      return [];
    },
  };
}

export const mediaSources: Record<string, MediaSourceAdapter> = {
  unsplash: unsplashAdapter,
  google_drive: createCloudStub("google_drive", "Google Drive", "Connect your Google Workspace drive to pick assets"),
  dropbox: createCloudStub("dropbox", "Dropbox", "Import high-res photos and video assets from Dropbox"),
  onedrive: createCloudStub("onedrive", "Microsoft OneDrive", "Browse your OneDrive folders for approved brand media"),
  google_photos: createCloudStub("google_photos", "Google Photos", "Sync photos directly from your phone camera roll"),
  canva: createCloudStub("canva", "Canva", "Export designs from your Canva projects into Postinger"),
};
