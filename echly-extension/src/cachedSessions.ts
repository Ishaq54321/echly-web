/**
 * Shared cache for GET /api/sessions in the extension content script.
 * Dedupes: hasPreviousSessions check and fetchSessions preload share one request per TTL.
 */

const TTL_MS = 30_000; // 30 seconds

export type SessionListItem = {
  id: string;
  title: string;
  updatedAt?: string;
  openCount?: number;
  resolvedCount?: number;
  feedbackCount?: number;
};

let cached: { sessions: SessionListItem[]; at: number } | null = null;
let inFlight: Promise<SessionListItem[]> | null = null;

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
      const json = (await res.json()) as {
        sessions?: SessionListItem[];
      };
      const sessions = json.sessions ?? [];
      if (res.ok) {
        cached = { sessions, at: Date.now() };
        return sessions;
      }
      return [];
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
}
