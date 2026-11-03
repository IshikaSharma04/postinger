import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getRedisConnection } from "@/lib/queue/worker";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let dbStatus = "healthy";
  let redisStatus = "healthy";
  let dbLatencyMs = 0;
  let redisLatencyMs = 0;

  // 1. Check PostgreSQL Database
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
  } catch (error) {
    dbStatus = "unhealthy";
    console.error("[HealthCheck] Database check failed:", error);
  }

  // 2. Check Redis / BullMQ Connection
  try {
    const t0 = Date.now();
    if (process.env.REDIS_URL) {
      const redis = getRedisConnection();
      await Promise.race([
        redis.ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis ping timeout")), 2500)
        ),
      ]);
      redisLatencyMs = Date.now() - t0;
    } else {
      redisStatus = "unconfigured";
    }
  } catch (error) {
    redisStatus = "unhealthy";
    console.error("[HealthCheck] Redis check failed:", error);
  }

  const isHealthy = dbStatus === "healthy" && (redisStatus === "healthy" || redisStatus === "unconfigured");

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      totalLatencyMs: Date.now() - startedAt,
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        redis: {
          status: redisStatus,
          latencyMs: redisLatencyMs,
        },
      },
      environment: process.env.NODE_ENV || "development",
    },
    { status: isHealthy ? 200 : 503 }
  );
}
