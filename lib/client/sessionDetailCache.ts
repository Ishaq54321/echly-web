// PERF R-006: in-memory cache for session detail bundle
// Prevents re-fetching the same session on back-navigation (the bundle endpoint
// costs 2 Firestore reads on every navigation to /dashboard/[sessionId]).
// TTL: 60 seconds — balances freshness with navigation latency savings.
// Invalidated immediately on any mutation that changes feedback status.

import type { Session } from "@/lib/domain/session";
import type { AccessCapabilities } from "@/lib/access/resolveAccess";

const SESSION_DETAIL_CACHE_TTL_MS = 60_000;

export interface SessionDetailCacheData {
  session: Session;
  sessionAccess: AccessCapabilities | null;
  pendingResolveRequest: boolean;
  bundledFirstFeedbackPage: {
    feedback: Record<string, unknown>[];
    nextCursor?: string | null;
    hasMore?: boolean;
  };
}

interface SessionDetailCacheEntry {
  data: SessionDetailCacheData;
  fetchedAt: number;
}

// Module-level Map — survives React re-renders and soft navigation
const cache = new Map<string, SessionDetailCacheEntry>();

export function getSessionDetailCache(
  sessionId: string
): SessionDetailCacheData | null {
  const entry = cache.get(sessionId);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > SESSION_DETAIL_CACHE_TTL_MS) {
    cache.delete(sessionId);
    return null;
  }
  return entry.data;
}

export function setSessionDetailCache(
  sessionId: string,
  data: SessionDetailCacheData
): void {
  cache.set(sessionId, { data, fetchedAt: Date.now() });
}

/** Call this on any mutation that changes session-level feedback counters. */
export function invalidateSessionDetailCache(sessionId: string): void {
  cache.delete(sessionId);
}
