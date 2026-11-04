import { startPublishWorker } from "@/lib/queue/worker";
import { logger } from "@/lib/utils/logger";

logger.info("[Worker] Starting standalone publishing worker process...");
startPublishWorker();

process.on("SIGTERM", () => {
  logger.info("[Worker] Received SIGTERM, shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("[Worker] Received SIGINT, shutting down...");
  process.exit(0);
});
