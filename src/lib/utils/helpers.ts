import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatRelative, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatRelative(d, new Date());
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function bytesToMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    TWITTER: "#1DA1F2",
    INSTAGRAM: "#E1306C",
    LINKEDIN: "#0077B5",
    FACEBOOK: "#4267B2",
    TIKTOK: "#69C9D0",
  };
  return colors[platform] ?? "#6B7280";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "text-gray-500 bg-gray-100",
    SCHEDULED: "text-violet-700 bg-violet-100",
    PROCESSING: "text-amber-700 bg-amber-100",
    PUBLISHED: "text-green-700 bg-green-100",
    FAILED: "text-red-700 bg-red-100",
    CANCELLED: "text-gray-500 bg-gray-100",
  };
  return colors[status] ?? "text-gray-500 bg-gray-100";
}
