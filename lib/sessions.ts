export type { Session } from "@/lib/domain/session";
import type { Session } from "@/lib/domain/session";
import {
  createSessionRepo,
  getSessionByIdRepo,
  getUserSessionsRepo,
  updateSessionTitleRepo,
} from "@/lib/repositories/sessionsRepository";

/* ================================
   SESSION TYPE
================================ */

/* ================================
   CREATE SESSION
================================ */

export async function createSession(userId: string) {
  return await createSessionRepo(userId);
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