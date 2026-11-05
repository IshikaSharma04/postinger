export interface SocialAccountItem {
  id: string;
  platform: string;
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  isConnected?: boolean;
}

export const PLATFORMS = [
  { value: "TWITTER", label: "Twitter / X", color: "#1DA1F2", icon: "𝕏" },
  { value: "INSTAGRAM", label: "Instagram", color: "#E1306C", icon: "IG" },
  { value: "LINKEDIN", label: "LinkedIn", color: "#0077B5", icon: "in" },
  { value: "FACEBOOK", label: "Facebook", color: "#4267B2", icon: "f" },
  { value: "TIKTOK", label: "TikTok", color: "#010101", icon: "TT" },
  { value: "YOUTUBE", label: "YouTube", color: "#FF0000", icon: "YT" },
  { value: "PINTEREST", label: "Pinterest", color: "#BD081C", icon: "P" },
  { value: "THREADS", label: "Threads", color: "#000000", icon: "@" },
  { value: "BLUESKY", label: "Bluesky", color: "#0085FF", icon: "🦋" },
  { value: "MASTODON", label: "Mastodon", color: "#6364FF", icon: "M" },
] as const;
