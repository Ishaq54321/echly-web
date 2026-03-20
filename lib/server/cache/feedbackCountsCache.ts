type FeedbackCounts = {
  total: number;
  open: number;
  resolved: number;
  skipped: number;
};

const cache = new Map<
  string,
  {
    data: FeedbackCounts;
    timestamp: number;
  }
>();

const TTL = 5000; // 5 seconds

export function getCachedCounts(sessionId: string): FeedbackCounts | null {
  const entry = cache.get(sessionId);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > TTL;
  if (isExpired) {
    cache.delete(sessionId);
    return null;
  }

  return entry.data;
}

export function setCachedCounts(sessionId: string, data: FeedbackCounts): void {
  cache.set(sessionId, {
    data,
    timestamp: Date.now(),
  });
}

export function invalidateCounts(sessionId: string): void {
  cache.delete(sessionId);
}
