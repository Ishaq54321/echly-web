import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  increment,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Session, SessionCreatedBy } from "@/lib/domain/session";
import { deleteAllCommentsForSessionRepo } from "@/lib/repositories/commentsRepository";
import { deleteAllFeedbackForSessionRepo } from "@/lib/repositories/feedbackRepository";

type SessionDoc = Omit<Session, "id"> & { createdAt?: Timestamp | null; updatedAt?: Timestamp | null };

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
  const sessionRef = doc(collection(db, "sessions"));
  const workspaceRef = doc(db, "workspaces", workspaceId);
  const sessionData = {
    workspaceId,
    userId,
    title: "Untitled Session",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: createdBy ?? null,
    viewCount: 0,
    commentCount: 0,
    openCount: 0,
    resolvedCount: 0,
    feedbackCount: 0,
  };

  await runTransaction(db, async (tx) => {
    tx.set(sessionRef, sessionData);
    tx.update(workspaceRef, {
      "usage.sessionsCreated": increment(1),
      updatedAt: serverTimestamp(),
    });
  });

  return sessionRef.id;
}

/**
 * Returns the number of *active* sessions in a workspace.
 * Excludes archived sessions so that plan limits apply only to active sessions.
 * Permanently deleted sessions are naturally excluded because their documents
 * are removed from Firestore.
 * Used only to enforce maxSessions at creation (POST /api/sessions). Must never
 * be used to delete or prune sessions when the limit is reduced.
 */
export async function getWorkspaceSessionCountRepo(workspaceId: string): Promise<number> {
  const baseQuery = query(
    collection(db, "sessions"),
    where("workspaceId", "==", workspaceId)
  );

  // Count all sessions for the workspace and subtract archived ones to derive
  // the active session count. This avoids relying on archived:false, which
  // would exclude older documents that predate the archived field.
  const [allSnap, archivedSnap] = await Promise.all([
    getCountFromServer(baseQuery),
    getCountFromServer(
      query(
        collection(db, "sessions"),
        where("workspaceId", "==", workspaceId),
        where("archived", "==", true)
      )
    ),
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
  const q = query(
    collection(db, "sessions"),
    where("workspaceId", "==", workspaceId),
    ...(archivedOnly === true
      ? [where("archived", "==", true) as ReturnType<typeof where>]
      : []),
    orderBy("updatedAt", "desc"),
    limit(max)
  );

  const snapshot = await getDocs(q);

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
  const q = query(
    collection(db, "sessions"),
    where("userId", "==", userId),
    ...(archivedOnly === true
      ? [where("archived", "==", true) as ReturnType<typeof where>]
      : []),
    orderBy("updatedAt", "desc"),
    limit(max)
  );

  const snapshot = await getDocs(q);

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

export async function getSessionByIdRepo(
  sessionId: string
): Promise<Session | null> {
  const snap = await getDoc(doc(db, "sessions", sessionId));
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as SessionDoc),
  };
}

export async function updateSessionTitleRepo(
  sessionId: string,
  title: string
): Promise<void> {
  await updateDoc(doc(db, "sessions", sessionId), {
    title,
    updatedAt: serverTimestamp(),
  });
}

export async function updateSessionArchivedRepo(
  sessionId: string,
  archived: boolean
): Promise<void> {
  await updateDoc(doc(db, "sessions", sessionId), {
    archived,
    updatedAt: serverTimestamp(),
  });
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
  await updateDoc(doc(db, "sessions", sessionId), {
    updatedAt: serverTimestamp(),
  });
}

/**
 * Saves a lightweight AI insight summary for a session.
 * Non-intrusive: does NOT change session.updatedAt (avoid reordering session lists).
 */
export async function updateSessionAiInsightSummaryRepo(
  sessionId: string,
  summary: string,
  feedbackCount: number
): Promise<void> {
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") return;
  const trimmed = typeof summary === "string" ? summary.trim() : "";
  if (!trimmed) return;
  await updateDoc(doc(db, "sessions", sessionId), {
    aiInsightSummary: trimmed,
    aiInsightSummaryFeedbackCount: feedbackCount,
    aiInsightSummaryUpdatedAt: serverTimestamp(),
  });
}

/**
 * Atomically increment session.commentCount. Call when a comment is created.
 */
export async function incrementSessionCommentCountRepo(sessionId: string): Promise<void> {
  await updateDoc(doc(db, "sessions", sessionId), {
    commentCount: increment(1),
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
  const viewerRef = doc(db, "sessionViews", sessionId, "views", viewerId);
  const sessionRef = doc(db, "sessions", sessionId);

  await runTransaction(db, async (tx) => {
    const viewerSnap = await tx.get(viewerRef);
    if (viewerSnap.exists()) return;

    tx.set(viewerRef, { viewedAt: serverTimestamp() });
    tx.update(sessionRef, { viewCount: increment(1) });
  });
}

/**
 * Permanently deletes a session and all associated data: feedback (tickets),
 * comments, view records. Screenshots in Storage are left as-is (TODO: optional cleanup).
 */
export async function deleteSessionRepo(sessionId: string): Promise<void> {
  await deleteAllFeedbackForSessionRepo(sessionId);
  await deleteAllCommentsForSessionRepo(sessionId);
  const viewsRef = collection(db, "sessionViews", sessionId, "views");
  const viewsSnap = await getDocs(viewsRef);
  await Promise.all(viewsSnap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, "sessions", sessionId));
}

