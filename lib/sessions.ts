export type { Session, SessionCreatedBy } from "@/lib/domain/session";
import type { Session, SessionCreatedBy } from "@/lib/domain/session";
import {
  createSessionRepo,
  deleteSessionRepo,
  getSessionByIdRepo,
  getUserSessionsRepo,
  updateSessionArchivedRepo,
  updateSessionTitleRepo,
  recordSessionViewIfNewRepo,
} from "@/lib/repositories/sessionsRepository";

/* ================================
   SESSION TYPE
================================ */

/* ================================
   CREATE SESSION
================================ */

export async function createSession(
  userId: string,
  createdBy?: SessionCreatedBy | null
): Promise<string> {
  return await createSessionRepo(userId, createdBy);
}

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

export async function getUserSessions(
  userId: string,
  max?: number
): Promise<Session[]> {
  return await getUserSessionsRepo(userId, max);
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