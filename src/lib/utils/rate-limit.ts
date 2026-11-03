// Simple in-memory rate limiter for API routes
// In production, use a Redis-backed store

interface RateLimitStore {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  identifier: string;
}

export function checkRateLimit(opts: RateLimitOptions): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const key = opts.identifier;
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + opts.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: opts.max - 1, resetAt };
  }

  if (existing.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return { allowed: true, remaining: opts.max - existing.count, resetAt: existing.resetAt };
}

export function isRateLimited(
  identifier: string,
  max: number = 100,
  windowMs: number = 60000
): boolean {
  const result = checkRateLimit({ identifier, max, windowMs });
  return !result.allowed;
}

// Cleanup stale entries every 5 minutes (unref so it doesn't prevent process exit)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000).unref();
