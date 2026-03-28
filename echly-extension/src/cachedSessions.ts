/**
 * Shared cache for GET /api/sessions in the extension content script.
 * Dedupes: hasPreviousSessions check and fetchSessions preload share one request per TTL.
 */

import { sessionsArrayFromApiPayload } from "@/lib/domain/session";
import type { SessionOption } from "@/lib/capture-engine/core/ResumeSessionModal";

/** Session row for picker UI; `counts.total` comes from session document fields on `/api/sessions`. */
export type SessionListItem = SessionOption & { counts: { total: number } };

function totalTicketsFromSession(session: {
  totalCount?: number;
  feedbackCount?: number;
}): number {
  if (typeof session.totalCount === "number") return session.totalCount;
  if (typeof session.feedbackCount === "number") return session.feedbackCount;
  return 0;
}

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
  return baseSessions.map((session) => ({
    ...session,
    counts: { total: totalTicketsFromSession(session) },
  }));
}

export function invalidateSessionsCache(): void {
  // No-op: extension session cache removed.
}
