const isDev = process.env.NODE_ENV !== "production";

type LogLevel = "debug" | "info" | "warn" | "error";

function log(level: LogLevel, scope: string, message: string, data?: any) {
  if (level === "debug" && !isDev) return;

  const prefix = `[ECHLY:${scope.toUpperCase()}]`;

  if (data !== undefined) {
    console[level](`${prefix} ${message}`, data);
  } else {
    console[level](`${prefix} ${message}`);
  }
}

export const logger = {
  debug: (scope: string, msg: string, data?: any) => log("debug", scope, msg, data),
  info: (scope: string, msg: string, data?: any) => log("info", scope, msg, data),
  warn: (scope: string, msg: string, data?: any) => log("warn", scope, msg, data),
  error: (scope: string, msg: string, data?: any) => log("error", scope, msg, data),
};
