import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Session, SessionCreatedBy } from "@/lib/domain/session";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import type { Workspace } from "@/lib/domain/workspace";
import { deleteAllCommentsForSessionRepo } from "@/lib/repositories/commentsRepository.server";
import { deleteAllFeedbackForSessionRepo } from "@/lib/repositories/feedbackRepository.server";

type SessionDoc = Omit<Session, "id"> & {
  createdAt?: FirebaseFirestore.Timestamp | Date | null;
  updatedAt?: FirebaseFirestore.Timestamp | Date | null;
};

/**
 * Creates a single new session and increments workspace usage in one transaction.
 * Only writes ONE session document; never modifies existing session documents.
 *
 * SERVER-ONLY: Import and use only from API routes (e.g. POST /api/sessions).
 * Client code must create sessions via POST /api/sessions so plan limits are enforced.
 */
export async function createSessionRepo(
  workspaceId: string,
  userId: string,
  createdBy?: SessionCreatedBy | null
): Promise<string> {
  const sessionRef = adminDb.collection("sessions").doc();
  const workspaceRef = adminDb.doc(`workspaces/${workspaceId}`);
  const sessionData = {
    workspaceId,
    userId,
    title: "Untitled Session",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: createdBy ?? null,
    viewCount: 0,
    commentCount: 0,
    openCount: 0,
    resolvedCount: 0,
    totalCount: 0,
    feedbackCount: 0,
    accessLevel: "view",
  };

  await adminDb.runTransaction(async (tx) => {
    tx.set(sessionRef, sessionData);
    tx.update(workspaceRef, {
      sessionCount: FieldValue.increment(1),
      "usage.sessionsCreated": FieldValue.increment(1),
      "stats.totalSessions": FieldValue.increment(1),
      "stats.updatedAt": FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return sessionRef.id;
}

/**
 * Returns the number of *active* sessions in a workspace (active = sessionCount - archivedCount).
 * When workspace is provided and has sessionCount/archivedCount, uses those (instant).
 * Otherwise falls back to Firestore count queries (slow; temporary until workspaces are backfilled).
 */
export async function getWorkspaceSessionCountRepo(
  workspaceId: string,
  workspace?: Workspace | null
): Promise<number> {
  if (
    workspace &&
    typeof workspace.sessionCount === "number" &&
    typeof workspace.archivedCount === "number"
  ) {
    const active = Math.max(0, workspace.sessionCount - workspace.archivedCount);
    return active;
  }

  // Fallback: count queries (temporary until workspace.sessionCount/archivedCount are backfilled)
  const [allSnap, archivedSnap] = await Promise.all([
    adminDb.collection("sessions").where("workspaceId", "==", workspaceId).count().get(),
    adminDb
      .collection("sessions")
      .where("workspaceId", "==", workspaceId)
      .where("archived", "==", true)
      .count()
      .get(),
  ]);

  const total = allSnap.data().count;
  const archived = archivedSnap.data().count;
  return Math.max(0, total - archived);
}

/**
 * Lists workspace sessions. Sorted by most recent activity (updatedAt desc).
 * Composite index required: (workspaceId Ascending, updatedAt Descending).
 * When archivedOnly is true: (workspaceId Ascending, archived Ascending, updatedAt Descending).
 * When includeArchived is true, returns both active and archived sessions.
 */
export async function getWorkspaceSessionsRepo(
  workspaceId: string,
  max: number = 50,
  archivedOnly?: boolean,
  includeArchived?: boolean
): Promise<Session[]> {
  assertQueryLimit(max, "getWorkspaceSessionsRepo");
  console.log("USING COLLECTION TYPE:", "collection");
  let q: FirebaseFirestore.Query = adminDb
    .collection("sessions")
    .where("workspaceId", "==", workspaceId);
  if (archivedOnly === true) q = q.where("archived", "==", true);
  q = q.orderBy("updatedAt", "desc").limit(max);
  const snapshot = await q.get();

  return snapshot.docs
    .filter((docSnap) => {
      if (includeArchived) return true;
      const archived = (docSnap.data() as { archived?: boolean }).archived === true;
      return archivedOnly ? archived : !archived;
    })
    .map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as SessionDoc),
    }));
}

/**
 * Legacy listing: sessions were previously scoped by userId. Keep this for backward compatibility
 * and migration fallback. Prefer getWorkspaceSessionsRepo going forward.
 */
export async function getUserSessionsRepo(
  userId: string,
  max: number = 50,
  archivedOnly?: boolean,
  includeArchived?: boolean
): Promise<Session[]> {
  assertQueryLimit(max, "getUserSessionsRepo");
  console.log("USING COLLECTION TYPE:", "collection");
  let q: FirebaseFirestore.Query = adminDb.collection("sessions").where("userId", "==", userId);
  if (archivedOnly === true) q = q.where("archived", "==", true);
  q = q.orderBy("updatedAt", "desc").limit(max);
  const snapshot = await q.get();

  return snapshot.docs
    .filter((docSnap) => {
      if (includeArchived) return true;
      const archived = (docSnap.data() as { archived?: boolean }).archived === true;
      return archivedOnly ? archived : !archived;
    })
    .map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as SessionDoc),
    }));
}

/** Limit for insights top sessions query. NEVER increase. */
const INSIGHTS_TOP_SESSIONS_LIMIT = 10;

/**
 * Bounded sessions fetch for /api/insights "most active sessions" chart.
 * Returns top sessions by feedbackCount. Composite index required: sessions (workspaceId ASC, feedbackCount DESC).
 */
export async function getWorkspaceSessionsByFeedbackCountRepo(
  workspaceId: string
): Promise<Session[]> {
  assertQueryLimit(INSIGHTS_TOP_SESSIONS_LIMIT, "getWorkspaceSessionsByFeedbackCountRepo");
  console.log("USING COLLECTION TYPE:", "collection");
  const isSimple = process.env.INSIGHTS_SIMPLE_QUERY === "1";
  const limitValue = isSimple ? 10 : INSIGHTS_TOP_SESSIONS_LIMIT;
  console.log("INSIGHTS QUERY:", {
    workspaceId,
    hasWhere: !isSimple,
    hasOrderBy: isSimple ? false : "feedbackCount desc",
    limit: limitValue,
    simpleMode: isSimple,
  });

  const q = isSimple
    ? adminDb.collection("sessions").limit(10)
    : adminDb
        .collection("sessions")
        .where("workspaceId", "==", workspaceId)
        .orderBy("feedbackCount", "desc")
        .limit(INSIGHTS_TOP_SESSIONS_LIMIT);

  const snapshot = await q.get();
  console.log("QUERY METRICS:", {
    collection: "sessions",
    count: snapshot.docs.length,
    limit: limitValue,
  });
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as SessionDoc),
  }));
}

export async function getSessionByIdRepo(
  sessionId: string
): Promise<Session | null> {
  const snap = await adminDb.doc(`sessions/${sessionId}`).get();
  if (!snap.exists) return null;

  return {
    id: snap.id,
    ...(snap.data() as SessionDoc),
  };
}

export async function updateSessionTitleRepo(
  sessionId: string,
  title: string
): Promise<void> {
  await adminDb.doc(`sessions/${sessionId}`).update({
    title,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function updateSessionAccessLevelRepo(
  sessionId: string,
  accessLevel: AccessLevel
): Promise<void> {
  await adminDb.doc(`sessions/${sessionId}`).update({
    accessLevel,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Updates session.archived and, when workspaceId is provided (or resolved from session),
 * updates workspace.archivedCount (increment on archive, decrement on unarchive).
 */
export async function updateSessionArchivedRepo(
  sessionId: string,
  archived: boolean,
  workspaceId?: string | null
): Promise<void> {
  let wsId = workspaceId ?? null;
  if (wsId === undefined || wsId === null) {
    const session = await getSessionByIdRepo(sessionId);
    wsId = session?.workspaceId ?? null;
  }

  if (wsId) {
    const sessionRef = adminDb.doc(`sessions/${sessionId}`);
    const workspaceRef = adminDb.doc(`workspaces/${wsId}`);
    await adminDb.runTransaction(async (tx) => {
      tx.update(sessionRef, {
        archived,
        updatedAt: FieldValue.serverTimestamp(),
      });
      tx.update(workspaceRef, {
        archivedCount: FieldValue.increment(archived ? 1 : -1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
  } else {
    await adminDb.doc(`sessions/${sessionId}`).update({
      archived,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Updates only the given session's updatedAt (last activity). Call only when
 * activity occurred inside that session (ticket create/edit/delete, comment,
 * title change). Never call for other sessions or when creating a new session.
 * Do not batch update multiple sessions.
 */
export async function updateSessionUpdatedAtRepo(sessionId: string): Promise<void> {
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    return;
  }
  await adminDb.doc(`sessions/${sessionId}`).update({
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Atomically increment session.commentCount. Call when a comment is created.
 */
export async function incrementSessionCommentCountRepo(sessionId: string): Promise<void> {
  await adminDb.doc(`sessions/${sessionId}`).update({
    commentCount: FieldValue.increment(1),
  });
}

/**
 * Loom-style view tracking: sessionViews/{sessionId}/views/{viewerId}.
 * If viewer has not viewed this session, creates the viewer doc and atomically
 * increments session.viewCount. Only counts once per viewer per session.
 */
export async function recordSessionViewIfNewRepo(
  sessionId: string,
  viewerId: string
): Promise<void> {
  const viewerRef = adminDb.doc(`sessionViews/${sessionId}/views/${viewerId}`);
  const sessionRef = adminDb.doc(`sessions/${sessionId}`);

  await adminDb.runTransaction(async (tx) => {
    const viewerSnap = await tx.get(viewerRef);
    if (viewerSnap.exists) return;

    tx.set(viewerRef, { viewedAt: FieldValue.serverTimestamp() });
    tx.update(sessionRef, { viewCount: FieldValue.increment(1) });
  });
}

/**
 * Permanently deletes a session and all associated data: feedback (tickets),
 * comments, view records. Screenshots in Storage are left as-is (TODO: optional cleanup).
 * Decrements workspace.sessionCount, stats.totalSessions, stats.totalFeedback, stats.totalComments,
 * and if session was archived, workspace.archivedCount.
 */
export async function deleteSessionRepo(sessionId: string): Promise<void> {
  const session = await getSessionByIdRepo(sessionId);
  const workspaceId = session?.workspaceId ?? null;

  const [feedbackDeleted, commentsDeleted] = await Promise.all([
    deleteAllFeedbackForSessionRepo(sessionId),
    deleteAllCommentsForSessionRepo(sessionId),
  ]);

  console.log("USING COLLECTION TYPE:", "collection");
  const viewsSnap = await adminDb.collection(`sessionViews/${sessionId}/views`).get();
  await Promise.all(viewsSnap.docs.map((d) => d.ref.delete()));
  await adminDb.doc(`sessions/${sessionId}`).delete();

  if (workspaceId) {
    const workspaceRef = adminDb.doc(`workspaces/${workspaceId}`);
    await workspaceRef.update({
      sessionCount: FieldValue.increment(-1),
      ...(session?.archived === true ? { archivedCount: FieldValue.increment(-1) } : {}),
      "stats.totalSessions": FieldValue.increment(-1),
      ...(commentsDeleted > 0
        ? { "stats.totalComments": FieldValue.increment(-commentsDeleted) }
        : {}),
      "stats.updatedAt": FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

