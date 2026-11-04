import IORedis from "ioredis";
import { logger } from "@/lib/utils/logger";

let redisClient: IORedis | null = null;

export function getRedisClient(): IORedis | null {
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  if (!redisClient) {
    const url = process.env.REDIS_URL;
    if (!url) return null;

    try {
      redisClient = new IORedis(url, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy(times) {
          return Math.min(times * 100, 3000);
        },
      });

      redisClient.on("error", (err) => {
        logger.warn(`Redis connection error: ${err.message}`);
      });
    } catch {
      return null;
    }
  }

  return redisClient;
}
