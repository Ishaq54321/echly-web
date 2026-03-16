export type { Session, SessionCreatedBy } from "@/lib/domain/session";
import type { Session } from "@/lib/domain/session";
import {
  deleteSessionRepo,
  getSessionByIdRepo,
  getUserSessionsRepo,
  getWorkspaceSessionsRepo,
  updateSessionArchivedRepo,
  updateSessionTitleRepo,
  recordSessionViewIfNewRepo,
} from "@/lib/repositories/sessionsRepository";

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
  await recordSessionViewIfNewRepo(sessionId, viewerId);
}

/* ================================
   GET USER SESSIONS
================================ */

export async function getWorkspaceSessions(
  workspaceId: string,
  max?: number,
  options?: { archivedOnly?: boolean; includeArchived?: boolean }
): Promise<Session[]> {
  return await getWorkspaceSessionsRepo(
    workspaceId,
    max ?? 50,
    options?.archivedOnly,
    options?.includeArchived
  );
}

/** Legacy: pre-workspaces sessions list (fallback only). */
export async function getUserSessions(
  userId: string,
  max?: number,
  options?: { archivedOnly?: boolean; includeArchived?: boolean }
): Promise<Session[]> {
  return await getUserSessionsRepo(
    userId,
    max ?? 50,
    options?.archivedOnly,
    options?.includeArchived
  );
}

/* ================================
   UPDATE SESSION TITLE
================================ */

export async function updateSessionTitle(
  sessionId: string,
  title: string
) {
  await updateSessionTitleRepo(sessionId, title);
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
  await updateSessionArchivedRepo(sessionId, archived);
}

/* ================================
   DELETE SESSION
================================ */

export async function deleteSession(sessionId: string): Promise<void> {
  await deleteSessionRepo(sessionId);
}