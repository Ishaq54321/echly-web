/**
 * Shared cache for GET /api/sessions in the extension content script.
 * Dedupes: hasPreviousSessions check and fetchSessions preload share one request per TTL.
 */

import { sessionsArrayFromApiPayload } from "@/lib/domain/session";
import type { SessionOption } from "@/lib/capture-engine/core/ResumeSessionModal";

/** Session row for picker UI; `counts.total` comes from session document fields on `/api/sessions`. */
export type SessionListItem = SessionOption & { counts: { total: number } };

let cachedData: SessionListItem[] | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 30_000;

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
  if (cachedData && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedData;
  }
  const res = await fetchFn("/api/sessions");
  if (!res.ok) {
    console.error("[ECHLY] getSessionsCached /api/sessions failed", res.status);
    return [];
  }
  const data: unknown = await res.json();
  const baseSessions = sessionsArrayFromApiPayload(data);
  const result = baseSessions.map((session) => ({
    ...session,
    counts: { total: totalTicketsFromSession(session) },
  }));
  cachedData = result;
  cachedAt = Date.now();
  return result;
}

export function invalidateSessionsCache(): void {
  cachedData = null;
  cachedAt = 0;
}
