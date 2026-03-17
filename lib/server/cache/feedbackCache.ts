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

function getKey(workspaceId: string, sessionId: string) {
  return `${workspaceId}:${sessionId}`;
}

export function getCachedFeedback(workspaceId: string, sessionId: string) {
  const key = getKey(workspaceId, sessionId);
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
  data: CacheEntry["data"]
) {
  const key = getKey(workspaceId, sessionId);

  cache.set(key, {
    data,
    cachedAt: Date.now(),
  });

  console.log("[FEEDBACK CACHE] SET", { key });
}

export function invalidateFeedbackCache(workspaceId: string, sessionId: string) {
  const key = getKey(workspaceId, sessionId);
  cache.delete(key);
  console.log("[FEEDBACK CACHE] INVALIDATED", { key });
}

