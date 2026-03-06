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
  setDoc,
  startAfter,
  updateDoc,
  where,
  increment,
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

  clarityScore: data.clarityScore ?? null,
  clarityStatus: data.clarityStatus ?? null,
  clarityIssues: data.clarityIssues ?? null,
  clarityConfidence: data.clarityConfidence ?? null,
  clarityCheckedAt:
    data.clarityScore != null || data.clarityStatus != null
      ? serverTimestamp()
      : (data.clarityCheckedAt ?? null),
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

/**
 * Creates feedback and updates session denormalized counters in one transaction.
 * Use for feedback create to avoid race conditions. Migration-safe: uses increment(1).
 */
export async function addFeedbackWithSessionCountersRepo(
  sessionId: string,
  userId: string,
  data: StructuredFeedback,
  feedbackId?: string
): Promise<DocumentReference> {
  const payload = feedbackPayload(sessionId, userId, data);
  const sessionRef = doc(db, "sessions", sessionId);

  return await runTransaction(db, async (tx) => {
    const feedbackRef =
      feedbackId != null && feedbackId !== ""
        ? doc(db, "feedback", feedbackId)
        : doc(collection(db, "feedback"));
    tx.set(feedbackRef, payload);
    tx.update(sessionRef, {
      openCount: increment(1),
      feedbackCount: increment(1),
      updatedAt: serverTimestamp(),
    });
    return feedbackRef;
  });
}

type FeedbackUpdate = Partial<{
  title: string;
  description: string;
  type: string;
  status: "open" | "resolved" | "skipped";
  screenshotUrl: string | null;
  actionSteps: string[] | null;
  suggestedTags: string[] | null;
}>;

function statusFromResolveAndSkip(isResolved: boolean, isSkipped: boolean): "open" | "resolved" | "skipped" {
  if (isSkipped) return "skipped";
  if (isResolved) return "resolved";
  return "open";
}

export async function updateFeedbackRepo(
  feedbackId: string,
  data: Partial<{
    title: string;
    description: string;
    type: string;
    isResolved: boolean;
    isSkipped: boolean;
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
  const isResolved = (data as { isResolved?: boolean }).isResolved;
  const isSkipped = (data as { isSkipped?: boolean }).isSkipped;
  if (typeof isSkipped === "boolean") {
    updates.status = statusFromResolveAndSkip(isResolved === true, isSkipped);
  } else if (typeof isResolved === "boolean") {
    updates.status = statusFromResolveAndSkip(isResolved, false);
  }
  if (Object.keys(updates).length === 0) return;
  await updateDoc(doc(db, "feedback", feedbackId), updates);
}

type FeedbackStatus = "open" | "resolved" | "skipped";

/**
 * Updates feedback (including status: resolve/skip) and session denormalized counters in one transaction.
 * Use when isResolved or isSkipped may change. Migration-safe: floors session counters at 0.
 */
export async function updateFeedbackResolveAndSessionCountersRepo(
  feedbackId: string,
  data: Partial<{
    title: string;
    description: string;
    type: string;
    screenshotUrl: string | null;
    actionSteps: string[] | null;
    suggestedTags: string[] | null;
    isResolved: boolean;
    isSkipped: boolean;
  }>
): Promise<void> {
  const feedbackRef = doc(db, "feedback", feedbackId);
  const isResolved = (data as { isResolved?: boolean }).isResolved === true;
  const isSkipped = (data as { isSkipped?: boolean }).isSkipped === true;
  const toStatus: FeedbackStatus = statusFromResolveAndSkip(isResolved, isSkipped);

  const updates: FeedbackUpdate = {};
  if (typeof data.title === "string") updates.title = data.title;
  if (typeof data.description === "string") updates.description = data.description;
  if (typeof data.type === "string") updates.type = data.type;
  if (data.screenshotUrl !== undefined) updates.screenshotUrl = data.screenshotUrl;
  if (data.actionSteps !== undefined) updates.actionSteps = data.actionSteps;
  if (data.suggestedTags !== undefined) updates.suggestedTags = data.suggestedTags;
  if (typeof (data as { isResolved?: boolean }).isResolved === "boolean" || typeof (data as { isSkipped?: boolean }).isSkipped === "boolean") {
    updates.status = toStatus;
  }

  await runTransaction(db, async (tx) => {
    const feedbackSnap = await tx.get(feedbackRef);
    if (!feedbackSnap.exists()) return;
    const fd = feedbackSnap.data();
    const sessionId = fd.sessionId as string;
    const wasStatus = ((s: string): FeedbackStatus => (s === "resolved" || s === "skipped" ? s : "open"))(fd.status as string);

    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const s = sessionSnap.data() || {};
    let openCount = (s.openCount as number) ?? 0;
    let resolvedCount = (s.resolvedCount as number) ?? 0;
    let skippedCount = (s.skippedCount as number) ?? 0;

    // Important: Firestore transactions require *all reads* to happen before *any writes*.
    // We read both feedback + session above, then perform writes below.
    if (Object.keys(updates).length > 0) {
      tx.update(feedbackRef, updates);
    }

    if (wasStatus !== toStatus) {
      if (wasStatus === "open") openCount = Math.max(0, openCount - 1);
      else if (wasStatus === "resolved") resolvedCount = Math.max(0, resolvedCount - 1);
      else if (wasStatus === "skipped") skippedCount = Math.max(0, skippedCount - 1);
      if (toStatus === "open") openCount += 1;
      else if (toStatus === "resolved") resolvedCount += 1;
      else if (toStatus === "skipped") skippedCount += 1;
    }

    tx.update(sessionRef, {
      openCount,
      resolvedCount,
      skippedCount,
      updatedAt: serverTimestamp(),
    });
  });
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
  const status = (data.status ?? "open") as string;
  const isResolved =
    data.isResolved === true ||
    status === "resolved" ||
    status === "done";
  const isSkipped = status === "skipped";
  return {
    id: docSnap.id,
    sessionId: data.sessionId,
    userId: data.userId,
    title: data.title,
    description: data.description,
    suggestion: data.suggestion ?? "",
    type: data.type,
    isResolved,
    isSkipped: isSkipped || undefined,
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
    clarityScore: data.clarityScore ?? null,
    clarityStatus: data.clarityStatus ?? null,
    clarityIssues: data.clarityIssues ?? null,
    clarityConfidence: data.clarityConfidence ?? null,
    clarityCheckedAt: data.clarityCheckedAt ?? null,
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
  const start = Date.now();
  const snapshot = await getDocs(q);
  const duration = Date.now() - start;
  console.log(`[FIRESTORE] query duration: ${duration}ms`);
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
    const cursorStart = Date.now();
    const cursorSnap = await getDoc(doc(db, "feedback", cursorDocId));
    console.log(`[FIRESTORE] query duration: ${Date.now() - cursorStart}ms`);
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
  const start = Date.now();
  const snapshot = await getDocs(q);
  console.log(`[FIRESTORE] query duration: ${Date.now() - start}ms`);
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
  const start = Date.now();
  const snapshot = await getCountFromServer(q);
  console.log(`[FIRESTORE] query duration: ${Date.now() - start}ms`);
  return snapshot.data().count;
}

export async function deleteFeedbackRepo(feedbackId: string): Promise<void> {
  await deleteDoc(doc(db, "feedback", feedbackId));
}

/**
 * Deletes feedback and updates session denormalized counters in one transaction.
 * Migration-safe: reads session and floors counters at 0.
 */
export async function deleteFeedbackWithSessionCountersRepo(
  feedbackId: string
): Promise<void> {
  const feedbackRef = doc(db, "feedback", feedbackId);

  await runTransaction(db, async (tx) => {
    const feedbackSnap = await tx.get(feedbackRef);
    if (!feedbackSnap.exists()) return;
    const data = feedbackSnap.data();
    const sessionId = data.sessionId as string;
    const status = (data.status as string) ?? "open";
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const s = sessionSnap.data() || {};
    const openCount = Math.max(0, ((s.openCount as number) ?? 0) - (status === "open" ? 1 : 0));
    const resolvedCount = Math.max(
      0,
      ((s.resolvedCount as number) ?? 0) - (status === "resolved" ? 1 : 0)
    );
    const skippedCount = Math.max(
      0,
      ((s.skippedCount as number) ?? 0) - (status === "skipped" ? 1 : 0)
    );
    const feedbackCount = Math.max(0, ((s.feedbackCount as number) ?? 0) - 1);

    tx.delete(feedbackRef);
    tx.update(sessionRef, {
      openCount,
      resolvedCount,
      skippedCount,
      feedbackCount,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function resolveFeedbackRepo(feedbackId: string): Promise<void> {
  await updateDoc(doc(db, "feedback", feedbackId), { status: "resolved" });
}

/** Counts by status for one session. Each count uses aggregation (no unbounded reads). */
export interface SessionFeedbackCounts {
  open: number;
  resolved: number;
  skipped: number;
}

export async function getSessionFeedbackCountsRepo(
  sessionId: string
): Promise<SessionFeedbackCounts> {
  const coll = collection(db, "feedback");
  const start = Date.now();
  const [resolvedSnap, skippedSnap, totalSnap] = await Promise.all([
    getCountFromServer(
      query(coll, where("sessionId", "==", sessionId), where("status", "==", "resolved"))
    ),
    getCountFromServer(
      query(coll, where("sessionId", "==", sessionId), where("status", "==", "skipped"))
    ),
    getSessionFeedbackTotalCountRepo(sessionId),
  ]);
  console.log(`[FIRESTORE] query duration: ${Date.now() - start}ms`);
  const resolved = resolvedSnap.data().count;
  const skipped = skippedSnap.data().count;
  const total = totalSnap;
  return {
    open: Math.max(0, total - resolved - skipped),
    resolved,
    skipped,
  };
}

export async function getSessionFeedbackTotalCountRepo(
  sessionId: string
): Promise<number> {
  const q = query(
    collection(db, "feedback"),
    where("sessionId", "==", sessionId)
  );
  const start = Date.now();
  const snap = await getCountFromServer(q);
  console.log(`[FIRESTORE] query duration: ${Date.now() - start}ms`);
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
  const start = Date.now();
  const snapshot = await getDocs(q);
  console.log(`[FIRESTORE] query duration: ${Date.now() - start}ms`);
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
  const start = Date.now();
  const snapshot = await getDocs(q);
  console.log(`[FIRESTORE] query duration: ${Date.now() - start}ms`);
  return snapshot.docs.map(docToFeedback);
}

const OVERVIEW_FEEDBACK_BY_IDS_LIMIT = 10;

/** Fetches a single feedback doc by ID. Returns null if not found. */
export async function getFeedbackByIdRepo(
  feedbackId: string
): Promise<Feedback | null> {
  const start = Date.now();
  const snap = await getDoc(doc(db, "feedback", feedbackId));
  console.log(`[FIRESTORE] query duration: ${Date.now() - start}ms`);
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
  const start = Date.now();
  const snaps = await Promise.all(
    limited.map((id) => getDoc(doc(db, "feedback", id)))
  );
  console.log(`[FIRESTORE] query duration: ${Date.now() - start}ms`);
  return snaps
    .filter((s) => s.exists())
    .map((s) => docToFeedback(s as QueryDocumentSnapshot));
}

