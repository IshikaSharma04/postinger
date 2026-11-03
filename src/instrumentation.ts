export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { startPublishWorker } = await import("@/lib/queue/worker");
      startPublishWorker();
    } catch (err: any) {
      console.warn("[Instrumentation] Publish worker initialization deferred:", err?.message);
    }
  }
}
