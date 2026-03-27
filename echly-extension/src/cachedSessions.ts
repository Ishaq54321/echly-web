/**
 * Shared cache for GET /api/sessions in the extension content script.
 * Dedupes: hasPreviousSessions check and fetchSessions preload share one request per TTL.
 */

import { sessionsArrayFromApiPayload } from "@/lib/domain/session";
import type { SessionOption } from "@/lib/capture-engine/core/ResumeSessionModal";
import { fetchCountsDedup } from "./countsRequestStore";

/** Session row for picker UI; `counts.total` is sourced only from /api/feedback/counts. */
export type SessionListItem = SessionOption & { counts: { total: number } };

export async function getSessionsCached(
  fetchFn: (url: string, init?: RequestInit) => Promise<Response>
): Promise<SessionListItem[]> {
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
      try {
        const countsJson = (await fetchCountsDedup(sessionId, () =>
          fetchFn(`/api/feedback/counts?sessionId=${encodeURIComponent(sessionId)}`)
        )) as { total?: number };
        const total = typeof countsJson.total === "number" ? countsJson.total : 0;
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
  return sessions;
}

export function invalidateSessionsCache(): void {
  // No-op: extension session cache removed.
}
