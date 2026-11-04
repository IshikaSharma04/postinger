import { logger } from "@/lib/utils/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.START_WORKER === "true") {
      try {
        const { startPublishWorker } = await import("@/lib/queue/worker");
        startPublishWorker();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        logger.warn(`[Instrumentation] Worker initialization deferred: ${msg}`);
      }
    }
  }
}
