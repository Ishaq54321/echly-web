/**
 * Strict client parsing for JSON bodies emitted by {@link apiSuccess} / {@link apiError}
 * in `lib/server/apiResponse.ts`. Callers that handle HTTP errors separately should use
 * {@link requireApiSuccessData} only after verifying `response.ok`.
 */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export function requireApiSuccessData<T>(json: unknown): T {
  if (typeof json !== "object" || json === null) {
    throw new Error("Invalid API response: missing data envelope");
  }
  const o = json as { success?: unknown; data?: unknown };
  if (o.success !== true) {
    throw new Error("Invalid API response: missing data envelope");
  }
  if (o.data === null || o.data === undefined) {
    throw new Error("Invalid API response: missing data envelope");
  }
  return o.data as T;
}
