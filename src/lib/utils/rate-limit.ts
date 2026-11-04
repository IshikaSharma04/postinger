import { getRedisClient } from "@/lib/redis/client";
import type { NextRequest } from "next/server";

interface RateLimitStore {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  identifier: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[0];
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export function checkRateLimitMemory(opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const key = opts.identifier;
  const existing = memoryStore.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + opts.windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: opts.max - 1, resetAt };
  }

  if (existing.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return { allowed: true, remaining: opts.max - existing.count, resetAt: existing.resetAt };
}

export async function checkRateLimitAsync(opts: RateLimitOptions): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) {
    return checkRateLimitMemory(opts);
  }

  const key = `ratelimit:${opts.identifier}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.pexpire(key, opts.windowMs);
    }
    const pttl = await redis.pttl(key);
    const resetAt = Date.now() + (pttl > 0 ? pttl : opts.windowMs);

    if (count > opts.max) {
      return { allowed: false, remaining: 0, resetAt };
    }

    return { allowed: true, remaining: Math.max(0, opts.max - count), resetAt };
  } catch {
    return checkRateLimitMemory(opts);
  }
}

export function checkRateLimit(opts: RateLimitOptions): RateLimitResult {
  return checkRateLimitMemory(opts);
}

export function isRateLimited(
  identifier: string,
  max = 100,
  windowMs = 60000
): boolean {
  const result = checkRateLimit({ identifier, max, windowMs });
  return !result.allowed;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetAt) memoryStore.delete(key);
  }
}, 5 * 60 * 1000).unref();
