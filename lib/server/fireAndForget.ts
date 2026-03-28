import "server-only";

/**
 * Schedules async work without blocking the handler response.
 * Failures are logged only; they never reject the caller or become unhandled rejections.
 */
export function fireAndForget(label: string, task: () => Promise<unknown>): void {
  void (async () => {
    try {
      await task();
    } catch (e) {
      console.error(`[echly] fireAndForget failed: ${label}`, e);
    }
  })();
}
