import { apiError } from "@/lib/server/apiResponse";

/**
 * x-debug-uid is only honored when NODE_ENV is "development" AND ENABLE_DEBUG_UID === "true",
 * and the UID appears in ALLOWED_DEBUG_UIDS (comma-separated). Never enable in staging/production.
 */
export function parseAllowedDebugUids(): string[] {
  const raw = process.env.ALLOWED_DEBUG_UIDS;
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type DebugUidResult =
  | { status: "none" }
  | { status: "forbidden"; response: Response }
  | { status: "ok"; uid: string };

/**
 * If x-debug-uid is absent, returns { status: "none" } (caller should use normal auth).
 * If present, enforces dev + flag + whitelist; otherwise returns 403.
 */
export function resolveDebugUid(req: Request): DebugUidResult {
  const debugUid = req.headers.get("x-debug-uid");
  if (!debugUid) {
    return { status: "none" };
  }

  const isDebugMode =
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_DEBUG_UID === "true";

  if (!isDebugMode) {
    return {
      status: "forbidden",
      response: apiError({
        code: "FORBIDDEN",
        message: "Debug UID not allowed",
        status: 403,
      }),
    };
  }

  const allowedDebugUids = parseAllowedDebugUids();
  if (!allowedDebugUids.includes(debugUid)) {
    return {
      status: "forbidden",
      response: apiError({
        code: "FORBIDDEN",
        message: "Invalid debug UID",
        status: 403,
      }),
    };
  }

  console.warn("[SECURITY] Debug UID used", {
    uid: debugUid,
    route: req.url,
  });

  return { status: "ok", uid: debugUid };
}
