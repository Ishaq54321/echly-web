/**
 * Session helpers for extension: recent IDs storage, session detail cache for lazy hydration.
 * Session list is always loaded via paginated API (fetchSessionsPage) only.
 */

import { API_BASE } from "../config";

const HYDRATED_TTL_MS = 60_000; // 60 seconds — avoid refetch on modal reopen
const STORAGE_KEY_RECENT_IDS = "echlyRecentSessionIds";
const MAX_RECENT_IDS = 50;

export type SessionListItem = {
  id: string;
  title: string;
  updatedAt?: string;
  openCount?: number;
  resolvedCount?: number;
  feedbackCount?: number;
};

/** In-memory cache for single-session detail (feedbackCount, updatedAt, etc.). Used by lazy hydration. */
const hydratedCache = new Map<string, { data: SessionListItem; at: number }>();

function sessionFromApiJson(json: { session?: { id?: string; title?: string; updatedAt?: string; openCount?: number; resolvedCount?: number; feedbackCount?: number } }): SessionListItem | null {
  const s = json?.session;
  if (!s?.id) return null;
  return {
    id: s.id,
    title: s.title ?? "Untitled Session",
    updatedAt: s.updatedAt,
    openCount: s.openCount,
    resolvedCount: s.resolvedCount,
    feedbackCount: s.feedbackCount,
  };
}

/** Call when user creates or selects a session so it appears in "Previous Sessions" without ever calling GET /api/sessions list. */
export async function addRecentSessionId(sessionId: string): Promise<void> {
  if (!sessionId || typeof chrome === "undefined" || !chrome.storage?.local?.get) return;
  const stored = await new Promise<string[]>((resolve) => {
    chrome.storage.local.get(STORAGE_KEY_RECENT_IDS, (result: { [key: string]: unknown }) => {
      const ids = result[STORAGE_KEY_RECENT_IDS];
      resolve(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : []);
    });
  });
  const next = [sessionId, ...stored.filter((id) => id !== sessionId)].slice(0, MAX_RECENT_IDS);
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY_RECENT_IDS]: next }, () => resolve());
  });
  invalidateSessionsCache();
}

/** No-op for backward compat (legacy list cache removed; only hydration cache exists). */
export function invalidateSessionsCache(): void {
  hydratedCache.clear();
}

/**
 * Fetch a single session's detail (feedbackCount, updatedAt, etc.) for lazy hydration.
 * Uses in-memory cache with TTL to avoid refetch on modal reopen.
 */
export async function getSessionDetailCached(
  fetchFn: (url: string, init?: RequestInit) => Promise<Response>,
  sessionId: string
): Promise<SessionListItem | null> {
  const now = Date.now();
  const entry = hydratedCache.get(sessionId);
  if (entry && now - entry.at < HYDRATED_TTL_MS) {
    return entry.data;
  }
  try {
    const res = await fetchFn(`/api/sessions/${sessionId}`);
    const json = (await res.json()) as { success?: boolean; session?: Record<string, unknown> };
    if (!res.ok || !json.success) return null;
    const item = sessionFromApiJson(json as { session?: { id?: string; title?: string; updatedAt?: string; openCount?: number; resolvedCount?: number; feedbackCount?: number } });
    if (item) {
      hydratedCache.set(sessionId, { data: item, at: Date.now() });
    }
    return item;
  } catch {
    return null;
  }
}
