import { Platform } from "@prisma/client";

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
  publish(params: {
    handle: string;
    body: string;
    hashtags: string[];
    mediaUrls: string[];
    credentials: Record<string, unknown>;
  }): Promise<PublishResult>;
}

// ── Mock Twitter Provider ─────────────────────────────────────────────────────

const twitterProvider: ProviderAdapter = {
  platform: "TWITTER",
  name: "Twitter / X",
  description: "SIMULATED — No real tweets are posted.",
  async publish({ handle, body }) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));

    // Simulate failure only if explicitly enabled via SIMULATE_ERRORS
    if (process.env.SIMULATE_ERRORS === "true" && Math.random() < 0.05) {
      throw new Error("[MOCK] Twitter API rate limit exceeded");
    }

    const fakeId = `tw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(
      `[MOCK:TWITTER] Would post to @${handle}: "${body.slice(0, 60)}..." (id: ${fakeId})`
    );
    return { success: true, externalId: fakeId };
  },
};

// ── Mock Instagram Provider ───────────────────────────────────────────────────

const instagramProvider: ProviderAdapter = {
  platform: "INSTAGRAM",
  name: "Instagram",
  description: "SIMULATED — No real posts are published.",
  async publish({ handle, body }) {
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));

    if (process.env.SIMULATE_ERRORS === "true" && Math.random() < 0.05) {
      throw new Error("[MOCK] Instagram content policy violation (simulated)");
    }

    const fakeId = `ig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[MOCK:INSTAGRAM] Would post to @${handle}: "${body.slice(0, 60)}..." (id: ${fakeId})`);
    return { success: true, externalId: fakeId };
  },
};

// ── Mock LinkedIn Provider ────────────────────────────────────────────────────

const linkedinProvider: ProviderAdapter = {
  platform: "LINKEDIN",
  name: "LinkedIn",
  description: "SIMULATED — No real posts are published.",
  async publish({ handle, body }) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 300));
    const fakeId = `li_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[MOCK:LINKEDIN] Would post to ${handle}: "${body.slice(0, 60)}..." (id: ${fakeId})`);
    return { success: true, externalId: fakeId };
  },
};

// ── Mock Facebook Provider ────────────────────────────────────────────────────

const facebookProvider: ProviderAdapter = {
  platform: "FACEBOOK",
  name: "Facebook",
  description: "SIMULATED — No real posts are published.",
  async publish({ handle, body }) {
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 300));
    const fakeId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[MOCK:FACEBOOK] Would post to ${handle}: "${body.slice(0, 60)}..." (id: ${fakeId})`);
    return { success: true, externalId: fakeId };
  },
};

// ── Mock TikTok Provider ──────────────────────────────────────────────────────

const tiktokProvider: ProviderAdapter = {
  platform: "TIKTOK",
  name: "TikTok",
  description: "SIMULATED — No real videos are posted.",
  async publish({ handle, body }) {
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 600));
    const fakeId = `tt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[MOCK:TIKTOK] Would post to @${handle}: "${body.slice(0, 60)}..." (id: ${fakeId})`);
    return { success: true, externalId: fakeId };
  },
};

const createMockProvider = (platform: Platform, name: string): ProviderAdapter => ({
  platform,
  name,
  description: "SIMULATED — Development Sandbox Adapter",
  async publish({ handle, body }) {
    const prefix = platform.toLowerCase().slice(0, 3);
    const fakeId = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[MOCK:${platform}] Would post to @${handle}: "${body.slice(0, 60)}..." (id: ${fakeId})`);
    return { success: true, externalId: fakeId };
  },
});

// ── Provider Registry ─────────────────────────────────────────────────────────

export const providers: Record<Platform, ProviderAdapter> = {
  TWITTER: twitterProvider,
  INSTAGRAM: instagramProvider,
  LINKEDIN: linkedinProvider,
  FACEBOOK: facebookProvider,
  TIKTOK: tiktokProvider,
  YOUTUBE: createMockProvider("YOUTUBE", "YouTube Shorts"),
  PINTEREST: createMockProvider("PINTEREST", "Pinterest"),
  THREADS: createMockProvider("THREADS", "Threads"),
  BLUESKY: createMockProvider("BLUESKY", "Bluesky"),
  MASTODON: createMockProvider("MASTODON", "Mastodon"),
  GOOGLE_BUSINESS: createMockProvider("GOOGLE_BUSINESS", "Google Business Profile"),
  SUBSTACK_NOTES: createMockProvider("SUBSTACK_NOTES", "Substack Notes"),
};

export const AUTO_PUBLISH_PLATFORMS: Platform[] = [
  "TWITTER",
  "LINKEDIN",
  "FACEBOOK",
  "THREADS",
  "BLUESKY",
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
