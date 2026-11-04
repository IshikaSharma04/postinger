import { Platform } from "@prisma/client";
import { blueskyProvider } from "./bluesky";

export interface PublishResult {
  success: boolean;
  externalId?: string;
  error?: string;
  platformData?: Record<string, unknown>;
}

export interface ProviderAdapter {
  platform: Platform;
  name: string;
  description: string;
  isSimulated?: boolean;
  publish(params: {
    handle: string;
    body: string;
    hashtags: string[];
    mediaUrls: string[];
    credentials: Record<string, unknown>;
  }): Promise<PublishResult>;
}

export function simulatedProvider(platform: Platform, name: string): ProviderAdapter {
  return {
    platform,
    name,
    description: "SIMULATED — Simulated publishing adapter for development",
    isSimulated: true,
    async publish({ handle, body }) {
      if (process.env.NODE_ENV !== "test") {
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
      }

      if (process.env.SIMULATE_ERRORS === "true" && Math.random() < 0.05) {
        throw new Error(`[MOCK] ${name} API rate limit exceeded`);
      }

      const prefix = platform.toLowerCase().slice(0, 2);
      const fakeId = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return { success: true, externalId: fakeId };
    },
  };
}

export const providers: Record<Platform, ProviderAdapter> = {
  BLUESKY: blueskyProvider,
  TWITTER: simulatedProvider("TWITTER", "Twitter / X"),
  INSTAGRAM: simulatedProvider("INSTAGRAM", "Instagram"),
  LINKEDIN: simulatedProvider("LINKEDIN", "LinkedIn"),
  FACEBOOK: simulatedProvider("FACEBOOK", "Facebook"),
  TIKTOK: simulatedProvider("TIKTOK", "TikTok"),
  YOUTUBE: simulatedProvider("YOUTUBE", "YouTube Shorts"),
  PINTEREST: simulatedProvider("PINTEREST", "Pinterest"),
  THREADS: simulatedProvider("THREADS", "Threads"),
  MASTODON: simulatedProvider("MASTODON", "Mastodon"),
  GOOGLE_BUSINESS: simulatedProvider("GOOGLE_BUSINESS", "Google Business Profile"),
  SUBSTACK_NOTES: simulatedProvider("SUBSTACK_NOTES", "Substack Notes"),
};

export const AUTO_PUBLISH_PLATFORMS: Platform[] = [
  "BLUESKY",
  "TWITTER",
  "LINKEDIN",
  "FACEBOOK",
  "THREADS",
  "MASTODON",
  "PINTEREST",
  "GOOGLE_BUSINESS",
  "SUBSTACK_NOTES",
];

export const NOTIFICATION_REMINDER_PLATFORMS: Platform[] = [
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
];

export function isAutoPublishPlatform(platform: Platform): boolean {
  return AUTO_PUBLISH_PLATFORMS.includes(platform);
}

export function getProvider(platform: Platform): ProviderAdapter {
  const provider = providers[platform];
  if (!provider) throw new Error(`Unknown platform: ${platform}`);
  return provider;
}
