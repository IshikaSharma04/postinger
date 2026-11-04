type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, message: string, meta?: unknown): void {
  if (process.env.NODE_ENV === "test" && level !== "error") {
    return;
  }
  const prefix = `[${level.toUpperCase()}]`;
  if (meta !== undefined) {
    console[level](`${prefix} ${message}`, meta);
  } else {
    console[level](`${prefix} ${message}`);
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => log("info", msg, meta),
  warn: (msg: string, meta?: unknown) => log("warn", msg, meta),
  error: (msg: string, meta?: unknown) => log("error", msg, meta),
  debug: (msg: string, meta?: unknown) => log("debug", msg, meta),
};
