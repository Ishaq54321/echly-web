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
import type {
  Feedback,
  FeedbackPriority,
  FeedbackStatus,
  StructuredFeedback,
} from "@/lib/domain/feedback";

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
  status: "open",
  priority: data.priority ?? "medium",
  createdAt: serverTimestamp(),

  contextSummary: data.contextSummary ?? null,
  actionItems: data.actionItems ?? null,
  impact: data.impact ?? null,
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

export async function updateFeedbackRepo(
  feedbackId: string,
  data: Partial<{
    title: string;
    description: string;
    type: string;
    status: FeedbackStatus;
    priority: FeedbackPriority;
    screenshotUrl: string | null;
  }>
): Promise<void> {
  await updateDoc(doc(db, "feedback", feedbackId), data);
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

/** Maps a Firestore doc snapshot to domain Feedback. */
function docToFeedback(docSnap: QueryDocumentSnapshot): Feedback {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    sessionId: data.sessionId,
    userId: data.userId,
    title: data.title,
    description: data.description,
    suggestion: data.suggestion ?? "",
    type: data.type,
    status: data.status ?? "open",
    priority: data.priority ?? "medium",
    createdAt: (data.createdAt ?? null) as Timestamp | null,
    contextSummary: data.contextSummary ?? null,
    actionItems: data.actionItems ?? null,
    impact: data.impact ?? null,
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

export async function deleteFeedbackRepo(feedbackId: string): Promise<void> {
  await deleteDoc(doc(db, "feedback", feedbackId));
}

export async function resolveFeedbackRepo(feedbackId: string): Promise<void> {
  await updateDoc(doc(db, "feedback", feedbackId), { status: "resolved" });
}

/** Counts by status for one session. Each count uses aggregation (no unbounded reads). */
export interface SessionFeedbackCounts {
  open: number;
  in_progress: number;
  resolved: number;
}

export async function getSessionFeedbackCountsByStatusRepo(
  sessionId: string
): Promise<SessionFeedbackCounts> {
  const coll = collection(db, "feedback");
  const base = (status: string) =>
    query(coll, where("sessionId", "==", sessionId), where("status", "==", status));
  const [openSnap, inProgressSnap, resolvedSnap] = await Promise.all([
    getCountFromServer(base("open")),
    getCountFromServer(base("in_progress")),
    getCountFromServer(base("resolved")),
  ]);
  return {
    open: openSnap.data().count,
    in_progress: inProgressSnap.data().count,
    resolved: resolvedSnap.data().count,
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

const OVERVIEW_HIGH_IMPACT_LIMIT = 5;

const OVERVIEW_PREVIEW_PER_STATUS_LIMIT = 3;

/**
 * Fetches up to N feedback items for a session filtered by status, newest first.
 * Composite index: feedback (sessionId ASC, status ASC, createdAt DESC).
 */
export async function getSessionFeedbackByStatusRepo(
  sessionId: string,
  status: FeedbackStatus,
  max: number = OVERVIEW_PREVIEW_PER_STATUS_LIMIT
): Promise<Feedback[]> {
  assertQueryLimit(max, "getSessionFeedbackByStatusRepo");
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

/**
 * Fetches up to N feedback items with impact === "high" for a session, newest first.
 * Composite index required: feedback (sessionId ASC, impact ASC, createdAt DESC).
 */
export async function getSessionFeedbackHighImpactRepo(
  sessionId: string,
  max: number = OVERVIEW_HIGH_IMPACT_LIMIT
): Promise<Feedback[]> {
  assertQueryLimit(max, "getSessionFeedbackHighImpactRepo");
  const q = query(
    collection(db, "feedback"),
    where("sessionId", "==", sessionId),
    where("impact", "==", "high"),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToFeedback);
}

const OVERVIEW_FEEDBACK_BY_IDS_LIMIT = 10;

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

