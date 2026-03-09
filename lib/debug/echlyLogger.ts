import { ECHLY_DEBUG } from "@/lib/utils/logger";

export function echlyLog(category: string, message: string, data?: unknown): void {
  if (!ECHLY_DEBUG) return;
  const prefix = `[ECHLY][${category}]`;
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}
