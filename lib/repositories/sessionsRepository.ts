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
import type { Workspace } from "@/lib/domain/workspace";
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
  const t_create_start = performance.now();
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
    skippedCount: 0,
    totalCount: 0,
    feedbackCount: 0,
  };

  const t_tx_start = performance.now();
  await runTransaction(db, async (tx) => {
    tx.set(sessionRef, sessionData);
    tx.update(workspaceRef, {
      sessionCount: increment(1),
      "usage.sessionsCreated": increment(1),
      "stats.totalSessions": increment(1),
      "stats.updatedAt": serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  console.log("[ECHLY PERF] createSessionRepo.runTransaction:", performance.now() - t_tx_start);

  console.log("[ECHLY PERF] createSessionRepo TOTAL:", performance.now() - t_create_start);
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
  const t_count_start = performance.now();
  if (
    workspace &&
    typeof workspace.sessionCount === "number" &&
    typeof workspace.archivedCount === "number"
  ) {
    const active = Math.max(0, workspace.sessionCount - workspace.archivedCount);
    console.log("[ECHLY PERF] getWorkspaceSessionCountRepo (workspace fields):", performance.now() - t_count_start);
    return active;
  }

  // Fallback: count queries (temporary until workspace.sessionCount/archivedCount are backfilled)
  console.log("USING COLLECTION TYPE:", "collection");
  const baseQuery = query(
    collection(db, "sessions"),
    where("workspaceId", "==", workspaceId)
  );
  const t_counts_start = performance.now();
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
  console.log("[ECHLY PERF] getWorkspaceSessionCountRepo.getCountFromServer (fallback):", performance.now() - t_counts_start);

  const total = allSnap.data().count;
  const archived = archivedSnap.data().count;
  console.log("[ECHLY PERF] getWorkspaceSessionCountRepo TOTAL:", performance.now() - t_count_start);
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
  console.log("USING COLLECTION TYPE:", "collection");
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
    ? query(collection(db, "sessions"), limit(10))
    : query(
        collection(db, "sessions"),
        where("workspaceId", "==", workspaceId),
        orderBy("feedbackCount", "desc"),
        limit(INSIGHTS_TOP_SESSIONS_LIMIT)
      );

  const snapshot = await getDocs(q);
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
    const sessionRef = doc(db, "sessions", sessionId);
    const workspaceRef = doc(db, "workspaces", wsId);
    await runTransaction(db, async (tx) => {
      tx.update(sessionRef, {
        archived,
        updatedAt: serverTimestamp(),
      });
      tx.update(workspaceRef, {
        archivedCount: increment(archived ? 1 : -1),
        updatedAt: serverTimestamp(),
      });
    });
  } else {
    await updateDoc(doc(db, "sessions", sessionId), {
      archived,
      updatedAt: serverTimestamp(),
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
  const viewsRef = collection(db, "sessionViews", sessionId, "views");
  const viewsSnap = await getDocs(viewsRef);
  await Promise.all(viewsSnap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, "sessions", sessionId));

  if (workspaceId) {
    const workspaceRef = doc(db, "workspaces", workspaceId);
    await updateDoc(workspaceRef, {
      sessionCount: increment(-1),
      ...(session?.archived === true ? { archivedCount: increment(-1) } : {}),
      "stats.totalSessions": increment(-1),
      ...(commentsDeleted > 0 ? { "stats.totalComments": increment(-commentsDeleted) } : {}),
      "stats.updatedAt": serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

