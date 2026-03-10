import {
  addDoc,
  collection,
  deleteDoc,
  doc,
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
 * Creates a single new session. Only writes ONE document; never modifies
 * existing session documents. Sets createdBy, viewCount, commentCount.
 */
export async function createSessionRepo(
  userId: string,
  createdBy?: SessionCreatedBy | null
): Promise<string> {
  const docRef = await addDoc(collection(db, "sessions"), {
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
  });

  return docRef.id;
}

/**
 * Lists user sessions. Sorted by most recent activity (updatedAt desc).
 * Composite index required: (userId Ascending, updatedAt Descending).
 * When archivedOnly is true: (userId Ascending, archived Ascending, updatedAt Descending).
 * When includeArchived is true, returns both active and archived sessions.
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

