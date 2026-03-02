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
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentReference,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Feedback, StructuredFeedback } from "@/lib/domain/feedback";

const feedbackPayload = (
  sessionId: string,
  userId: string,
  data: StructuredFeedback
) => ({
  sessionId,
  userId,
  title: data.title,
  description: data.description,
  suggestion: data.suggestion ?? "",
  type: data.type,
  status: "open" as const,
  createdAt: serverTimestamp(),

  contextSummary: data.contextSummary ?? null,
  actionSteps: data.actionSteps ?? null,
  suggestedTags: data.suggestedTags ?? null,

  url: data.url ?? null,
  viewportWidth: data.viewportWidth ?? null,
  viewportHeight: data.viewportHeight ?? null,
  userAgent: data.userAgent ?? null,
  clientTimestamp: data.timestamp ?? null,

  screenshotUrl: data.screenshotUrl ?? null,
});

export async function addFeedbackRepo(
  sessionId: string,
  userId: string,
  data: StructuredFeedback,
  feedbackId?: string
): Promise<DocumentReference> {
  const payload = feedbackPayload(sessionId, userId, data);

  if (feedbackId != null && feedbackId !== "") {
    const docRef = doc(db, "feedback", feedbackId);
    await setDoc(docRef, payload);
    return docRef;
  }

  const docRef = await addDoc(collection(db, "feedback"), payload);
  return docRef;
}

type FeedbackUpdate = Partial<{
  title: string;
  description: string;
  type: string;
  status: "open" | "resolved";
  screenshotUrl: string | null;
  actionSteps: string[] | null;
  suggestedTags: string[] | null;
}>;

export async function updateFeedbackRepo(
  feedbackId: string,
  data: Partial<{
    title: string;
    description: string;
    type: string;
    isResolved: boolean;
    screenshotUrl: string | null;
    actionSteps: string[] | null;
    suggestedTags: string[] | null;
  }>
): Promise<void> {
  const updates: FeedbackUpdate = {};
  if (typeof data.title === "string") updates.title = data.title;
  if (typeof data.description === "string") updates.description = data.description;
  if (typeof data.type === "string") updates.type = data.type;
  if (data.screenshotUrl !== undefined) updates.screenshotUrl = data.screenshotUrl;
  if (data.actionSteps !== undefined) updates.actionSteps = data.actionSteps;
  if (data.suggestedTags !== undefined) updates.suggestedTags = data.suggestedTags;
  if (typeof (data as { isResolved?: boolean }).isResolved === "boolean") {
    updates.status = (data as { isResolved: boolean }).isResolved ? "resolved" : "open";
  }
  if (Object.keys(updates).length === 0) return;
  await updateDoc(doc(db, "feedback", feedbackId), updates);
}

/** Cursor for server-side pagination. Opaque to callers; only repo uses it. */
export type FeedbackPageCursor = QueryDocumentSnapshot;

/** Result of a single paginated feedback page. */
export interface FeedbackPageResult {
  feedback: Feedback[];
  lastVisibleDoc: FeedbackPageCursor | null;
  hasMore: boolean;
}

const FEEDBACK_PAGE_SIZE_DEFAULT = 20;

/** Maps a Firestore doc snapshot to domain Feedback. Backward compat: actionItems → actionSteps. */
function docToFeedback(docSnap: QueryDocumentSnapshot): Feedback {
  const data = docSnap.data();
  const status = data.status ?? "open";
  const isResolved =
    data.isResolved === true ||
    status === "resolved" ||
    status === "done";
  return {
    id: docSnap.id,
    sessionId: data.sessionId,
    userId: data.userId,
    title: data.title,
    description: data.description,
    suggestion: data.suggestion ?? "",
    type: data.type,
    isResolved,
    createdAt: (data.createdAt ?? null) as Timestamp | null,
    contextSummary: data.contextSummary ?? null,
    actionSteps: data.actionSteps ?? data.actionItems ?? null,
    suggestedTags: data.suggestedTags ?? null,
    url: data.url ?? null,
    viewportWidth: data.viewportWidth ?? null,
    viewportHeight: data.viewportHeight ?? null,
    userAgent: data.userAgent ?? null,
    clientTimestamp: data.clientTimestamp ?? null,
    screenshotUrl: data.screenshotUrl ?? null,
  };
}

/**
 * Fetches one page of feedback for a session using cursor pagination.
 * Composite index required: feedback (sessionId ASC, createdAt DESC).
 * Cost protection: never fetches unbounded; use limit + startAfter only.
 */
export async function getSessionFeedbackPageRepo(
  sessionId: string,
  pageSize: number = FEEDBACK_PAGE_SIZE_DEFAULT,
  startAfterDoc?: FeedbackPageCursor | null
): Promise<FeedbackPageResult> {
  assertQueryLimit(pageSize, "getSessionFeedbackPageRepo");
  const coll = collection(db, "feedback");
  const q =
    startAfterDoc != null
      ? query(
          coll,
          where("sessionId", "==", sessionId),
          orderBy("createdAt", "desc"),
          limit(pageSize),
          startAfter(startAfterDoc)
        )
      : query(
          coll,
          where("sessionId", "==", sessionId),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  const feedback = docs.map(docToFeedback);
  const lastVisibleDoc =
    docs.length > 0 ? (docs[docs.length - 1] as FeedbackPageCursor) : null;
  const hasMore = docs.length === pageSize;
  return { feedback, lastVisibleDoc, hasMore };
}

/** Cursor-based page for API: cursor is last document ID (opaque string). Returns nextCursor as last doc id or null. */
export async function getSessionFeedbackPageWithStringCursorRepo(
  sessionId: string,
  pageSize: number = FEEDBACK_PAGE_SIZE_DEFAULT,
  cursorDocId?: string | null
): Promise<{ feedback: Feedback[]; nextCursor: string | null; hasMore: boolean }> {
  assertQueryLimit(pageSize, "getSessionFeedbackPageWithStringCursorRepo");
  const coll = collection(db, "feedback");
  let startAfterDoc: QueryDocumentSnapshot | null = null;
  if (cursorDocId && cursorDocId.trim() !== "") {
    const cursorSnap = await getDoc(doc(db, "feedback", cursorDocId));
    if (cursorSnap.exists()) startAfterDoc = cursorSnap as QueryDocumentSnapshot;
  }
  const q =
    startAfterDoc != null
      ? query(
          coll,
          where("sessionId", "==", sessionId),
          orderBy("createdAt", "desc"),
          limit(pageSize),
          startAfter(startAfterDoc)
        )
      : query(
          coll,
          where("sessionId", "==", sessionId),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  const feedback = docs.map(docToFeedback);
  const lastDoc = docs.length > 0 ? docs[docs.length - 1] : null;
  const nextCursor = lastDoc ? lastDoc.id : null;
  const hasMore = docs.length === pageSize;
  return { feedback, nextCursor, hasMore };
}

/** Total count of feedback for a session (for sidebar display). */
export async function getSessionFeedbackCountRepo(sessionId: string): Promise<number> {
  const coll = collection(db, "feedback");
  const q = query(coll, where("sessionId", "==", sessionId));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function deleteFeedbackRepo(feedbackId: string): Promise<void> {
  await deleteDoc(doc(db, "feedback", feedbackId));
}

export async function resolveFeedbackRepo(feedbackId: string): Promise<void> {
  await updateDoc(doc(db, "feedback", feedbackId), { status: "resolved" });
}

/** Counts by resolution for one session. Each count uses aggregation (no unbounded reads). */
export interface SessionFeedbackCounts {
  open: number;
  resolved: number;
}

export async function getSessionFeedbackCountsRepo(
  sessionId: string
): Promise<SessionFeedbackCounts> {
  const coll = collection(db, "feedback");
  const [resolvedSnap, totalSnap] = await Promise.all([
    getCountFromServer(
      query(coll, where("sessionId", "==", sessionId), where("status", "==", "resolved"))
    ),
    getSessionFeedbackTotalCountRepo(sessionId),
  ]);
  const resolved = resolvedSnap.data().count;
  return {
    resolved,
    open: totalSnap - resolved,
  };
}

export async function getSessionFeedbackTotalCountRepo(
  sessionId: string
): Promise<number> {
  const q = query(
    collection(db, "feedback"),
    where("sessionId", "==", sessionId)
  );
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

const DELETE_SESSION_FEEDBACK_LIMIT = 500;

/**
 * Deletes all feedback (tickets) for a session. Used when deleting a session.
 * Screenshot URLs in Storage are not removed here (TODO: optional cleanup).
 */
export async function deleteAllFeedbackForSessionRepo(
  sessionId: string
): Promise<void> {
  const q = query(
    collection(db, "feedback"),
    where("sessionId", "==", sessionId),
    limit(DELETE_SESSION_FEEDBACK_LIMIT)
  );
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
}

const OVERVIEW_PREVIEW_PER_RESOLVED_LIMIT = 3;

/**
 * Fetches up to N feedback items for a session filtered by resolution, newest first.
 * Composite index: feedback (sessionId ASC, status ASC, createdAt DESC).
 */
export async function getSessionFeedbackByResolvedRepo(
  sessionId: string,
  isResolved: boolean,
  max: number = OVERVIEW_PREVIEW_PER_RESOLVED_LIMIT
): Promise<Feedback[]> {
  assertQueryLimit(max, "getSessionFeedbackByResolvedRepo");
  const status = isResolved ? "resolved" : "open";
  const q = query(
    collection(db, "feedback"),
    where("sessionId", "==", sessionId),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToFeedback);
}

const OVERVIEW_FEEDBACK_BY_IDS_LIMIT = 10;

/** Fetches a single feedback doc by ID. Returns null if not found. */
export async function getFeedbackByIdRepo(
  feedbackId: string
): Promise<Feedback | null> {
  const snap = await getDoc(doc(db, "feedback", feedbackId));
  if (!snap.exists()) return null;
  return docToFeedback(snap as QueryDocumentSnapshot);
}

/** Fetches feedback docs by IDs (e.g. for activity titles). Limited for cost safety. */
export async function getFeedbackByIdsRepo(
  feedbackIds: string[],
  max: number = OVERVIEW_FEEDBACK_BY_IDS_LIMIT
): Promise<Feedback[]> {
  if (feedbackIds.length === 0) return [];
  const limited = feedbackIds.slice(0, max);
  assertQueryLimit(limited.length, "getFeedbackByIdsRepo");
  const snaps = await Promise.all(
    limited.map((id) => getDoc(doc(db, "feedback", id)))
  );
  return snaps
    .filter((s) => s.exists())
    .map((s) => docToFeedback(s as QueryDocumentSnapshot));
}

