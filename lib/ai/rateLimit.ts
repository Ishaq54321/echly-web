const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

type Bucket = { count: number; resetAt: number };
const userBuckets = new Map<string, Bucket>();

let cleanupTimer: ReturnType<typeof setInterval> | null = null;
function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [userId, bucket] of userBuckets.entries()) {
      if (bucket.resetAt <= now) userBuckets.delete(userId);
    }
  }, 5 * 60_000);
  if (typeof cleanupTimer === "object" && cleanupTimer && "unref" in cleanupTimer) {
    (cleanupTimer as { unref: () => void }).unref();
  }
}

export interface AiImproveRateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkAiImproveRateLimit(userId: string): AiImproveRateLimitResult {
  return checkRateLimitForKey(`improve:${userId}`);
}

/**
 * Per-user rate limit for AI Analysis. Separate bucket from the improve feature
 * so exhausting one does not block the other (they are unrelated AI operations).
 */
export function checkAiAnalyzeRateLimit(userId: string): AiImproveRateLimitResult {
  return checkRateLimitForKey(`analyze:${userId}`);
}

/** Shared fixed-window limiter, keyed so distinct features get distinct buckets. */
function checkRateLimitForKey(key: string): AiImproveRateLimitResult {
  ensureCleanup();
  const now = Date.now();
  const bucket = userBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    userBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}
