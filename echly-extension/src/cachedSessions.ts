/**
 * Shared cache for GET /api/sessions in the extension content script.
 * Dedupes: hasPreviousSessions check and fetchSessions preload share one request per TTL.
 */

import { sessionsArrayFromApiPayload } from "@/lib/domain/session";
import type { SessionOption } from "@/lib/capture-engine/core/ResumeSessionModal";
import { fetchCountsDedup } from "./countsRequestStore";

const TTL_MS = 30_000; // 30 seconds
const COUNTS_TTL_MS = 5 * 60_000; // 5 minutes

/** Session row for picker UI; `counts.total` is sourced only from /api/feedback/counts. */
export type SessionListItem = SessionOption & { counts: { total: number } };

let cached: { sessions: SessionListItem[]; at: number } | null = null;
let inFlight: Promise<SessionListItem[]> | null = null;
let countsCache: Map<string, { total: number; at: number }> = new Map();

function getCounts(sessionId: string): { total: number } | null {
  const cachedEntry = countsCache.get(sessionId);
  if (!cachedEntry) return null;
  if (Date.now() - cachedEntry.at > COUNTS_TTL_MS) {
    countsCache.delete(sessionId);
    return null;
  }
  return { total: cachedEntry.total };
}

function setCounts(sessionId: string, total: number): void {
  countsCache.set(sessionId, { total, at: Date.now() });
}

export async function getSessionsCached(
  fetchFn: (url: string, init?: RequestInit) => Promise<Response>
): Promise<SessionListItem[]> {
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) {
    return cached.sessions;
  }
  if (inFlight) {
    return inFlight;
  }
  const promise = (async () => {
    try {
      const res = await fetchFn("/api/sessions");
      if (!res.ok) {
        console.error("[ECHLY] getSessionsCached /api/sessions failed", res.status);
        return [];
      }
      const data: unknown = await res.json();
      const baseSessions = sessionsArrayFromApiPayload(data);
      const sessions = await Promise.all(
        baseSessions.map(async (session) => {
          const sessionId = session.id;
          const cached = getCounts(sessionId);
          if (cached) {
            return {
              ...session,
              counts: { total: cached.total },
            };
          }
          try {
            const countsJson = (await fetchCountsDedup(sessionId, () =>
              fetchFn(
                `/api/feedback/counts?sessionId=${encodeURIComponent(sessionId)}`
              )
            )) as { total?: number };
            const total = typeof countsJson.total === "number" ? countsJson.total : 0;
            setCounts(sessionId, total);
            return {
              ...session,
              counts: { total },
            };
          } catch (countsErr) {
            console.error("[ECHLY] getSessionsCached counts for session failed", sessionId, countsErr);
            return { ...session, counts: { total: 0 } };
          }
        })
      );
      cached = { sessions, at: Date.now() };
      return sessions;
    } finally {
      inFlight = null;
    }
  })();
  inFlight = promise;
  return promise;
}

export function invalidateSessionsCache(): void {
  cached = null;
  inFlight = null;
  countsCache = new Map();
}
