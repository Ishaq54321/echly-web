type CacheEntry = {
  data: {
    feedback: any[];
    nextCursor: string | null;
    hasMore: boolean;
  };
  cachedAt: number;
};

const cache = new Map<string, CacheEntry>();

const TTL = 30 * 1000; // 30 seconds

export type FeedbackListKind = "all" | "open" | "resolved";

function getKey(workspaceId: string, sessionId: string, listKind: FeedbackListKind = "all") {
  return `${workspaceId}:${sessionId}:${listKind}`;
}

export function getCachedFeedback(
  workspaceId: string,
  sessionId: string,
  listKind: FeedbackListKind = "all"
) {
  const key = getKey(workspaceId, sessionId, listKind);
  const entry = cache.get(key);

  if (!entry) {
    console.log("[FEEDBACK CACHE] MISS", { key });
    return null;
  }

  if (Date.now() - entry.cachedAt > TTL) {
    cache.delete(key);
    console.log("[FEEDBACK CACHE] EXPIRED", { key });
    return null;
  }

  console.log("[FEEDBACK CACHE] HIT", { key });
  return entry.data;
}

export function setCachedFeedback(
  workspaceId: string,
  sessionId: string,
  data: CacheEntry["data"],
  listKind: FeedbackListKind = "all"
) {
  const key = getKey(workspaceId, sessionId, listKind);

  cache.set(key, {
    data,
    cachedAt: Date.now(),
  });

  console.log("[FEEDBACK CACHE] SET", { key });
}

/**
 * Drops every cached first-page variant for this session (`all`, `open`, `resolved`).
 * Call after creates/updates so list snapshots cannot cross-contaminate.
 */
export function invalidateFeedbackCache(workspaceId: string, sessionId: string) {
  for (const kind of ["all", "open", "resolved"] as const) {
    const key = getKey(workspaceId, sessionId, kind);
    cache.delete(key);
    console.log("[FEEDBACK CACHE] INVALIDATED", { key });
  }
}

/** @alias {@link invalidateFeedbackCache} — same behavior; clears all/open/resolved keys. */
export const invalidateSessionFeedbackCache = invalidateFeedbackCache;
