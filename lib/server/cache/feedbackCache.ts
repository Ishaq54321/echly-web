type CacheEntry = {
  data: {
    feedback: any[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount?: number;
    openCount?: number;
    resolvedCount?: number;
    skippedCount?: number;
  };
  cachedAt: number;
};

const cache = new Map<string, CacheEntry>();

const TTL = 30 * 1000; // 30 seconds

function getKey(workspaceId: string, sessionId: string) {
  return `${workspaceId}:${sessionId}`;
}

/** Cache key for cursor-based pages: first page = "FIRST", next pages = actual cursor. */
function getPageKey(workspaceId: string, sessionId: string, cursor: string) {
  return `${workspaceId}:${sessionId}:${cursor}`;
}

const PAGE_TTL = 45 * 1000; // 45s for cursor pages (30–60s)

/**
 * Returns cached first page only if it has the expected size (e.g. 25).
 * Do not reuse cache when shape/size is mismatched.
 */
export function getCachedFeedback(
  workspaceId: string,
  sessionId: string,
  expectedFirstPageSize?: number
) {
  const key = getKey(workspaceId, sessionId);
  const entry = cache.get(key);

  if (!entry) {
    console.log("[CACHE CHECK]", { hit: false, key, hasCursor: false });
    console.log("[FEEDBACK CACHE] MISS", { key });
    return null;
  }

  if (Date.now() - entry.cachedAt > TTL) {
    cache.delete(key);
    console.log("[FEEDBACK CACHE] EXPIRED", { key });
    return null;
  }

  if (
    expectedFirstPageSize != null &&
    (entry.data.feedback?.length ?? 0) !== expectedFirstPageSize
  ) {
    console.log("[FEEDBACK CACHE] SKIP (size mismatch)", {
      key,
      expected: expectedFirstPageSize,
      got: entry.data.feedback?.length ?? 0,
    });
    return null;
  }

  console.log("[CACHE CHECK]", { hit: true, key, hasCursor: false });
  console.log("[FEEDBACK CACHE] HIT", { key });
  return entry.data;
}

export function setCachedFeedback(
  workspaceId: string,
  sessionId: string,
  data: CacheEntry["data"]
) {
  const key = getKey(workspaceId, sessionId);

  cache.set(key, {
    data,
    cachedAt: Date.now(),
  });

  console.log("[FEEDBACK CACHE] SET", { key });
}

/**
 * Invalidate only the first page so pagination cache stays intact.
 * Do NOT delete other cursor keys (e.g. `${workspaceId}:${sessionId}:${cursor}`)
 * so scroll performance is preserved after mutations.
 */
export function invalidateFeedbackCache(workspaceId: string, sessionId: string) {
  const firstPageKey = getPageKey(workspaceId, sessionId, "FIRST");
  cache.delete(firstPageKey);
  console.log("[FEEDBACK CACHE] INVALIDATED (first page only)", { firstPageKey });
}

export type CachedFeedbackPageData = CacheEntry["data"];

/**
 * Returns cached feedback page for the given cursor.
 * First page: cursor = "FIRST". Next pages: cursor = actual cursor string.
 */
export function getCachedFeedbackPage(
  workspaceId: string,
  sessionId: string,
  cursor: string
): CachedFeedbackPageData | null {
  const key = getPageKey(workspaceId, sessionId, cursor);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > PAGE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Caches a feedback page. First page: cursor = "FIRST". Next pages: cursor = actual cursor.
 */
export function setCachedFeedbackPage(
  workspaceId: string,
  sessionId: string,
  cursor: string,
  data: CachedFeedbackPageData
) {
  const key = getPageKey(workspaceId, sessionId, cursor);
  cache.set(key, { data, cachedAt: Date.now() });
}

