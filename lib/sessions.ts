export type { Session, SessionCreatedBy } from "@/lib/domain/session";
import type { Session } from "@/lib/domain/session";
import { authFetch } from "@/lib/authFetch";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";

/**
 * Session creation is only allowed via POST /api/sessions (plan limits enforced there).
 * Do not add a createSession() helper here; clients must call the API.
 */

/* ================================
   RECORD SESSION VIEW (Loom-style)
================================ */

export async function recordSessionViewIfNew(
  sessionId: string,
  viewerId: string
): Promise<void> {
  const res = await authFetch(`/api/sessions/${encodeURIComponent(sessionId)}/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ viewerId }),
  });
  if (!res) return;
  if (res.status === 401) {
    // anonymous viewer — skip silently
    return;
  }
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.warn("recordSessionView failed:", msg);
  }
}

/* ================================
   UPDATE SESSION TITLE
================================ */

export async function updateSessionTitle(
  sessionId: string,
  title: string
) {
  const res = await authFetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to update session title");
  }
}

/* ================================
   GET SESSION BY ID
================================ */

export async function getSessionById(sessionId: string): Promise<Session | null> {
  return await getSessionByIdRepo(sessionId);
}

/* ================================
   ARCHIVE SESSION
================================ */

export async function updateSessionArchived(
  sessionId: string,
  archived: boolean
): Promise<void> {
  const res = await authFetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archived }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to update session archived state");
  }
}

/* ================================
   DELETE SESSION
================================ */

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await authFetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to delete session");
  }
}