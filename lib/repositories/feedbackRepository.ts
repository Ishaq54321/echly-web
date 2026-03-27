import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Feedback, StructuredFeedback } from "@/lib/domain/feedback";

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
  return {
    id: docSnap.id,
    sessionId: data.sessionId,
    userId: data.userId,
    title: data.title,
    instruction:
      typeof data.instruction === "string"
        ? data.instruction
        : typeof data.description === "string"
          ? data.description
          : undefined,
    description:
      typeof data.description === "string"
        ? data.description
        : typeof data.instruction === "string"
          ? data.instruction
          : undefined,
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
    screenshotStatus:
      (data.screenshotStatus as Feedback["screenshotStatus"] | undefined) ?? null,
    commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
    lastCommentPreview: typeof data.lastCommentPreview === "string" ? data.lastCommentPreview : undefined,
    lastCommentAt: (data.lastCommentAt ?? null) as Timestamp | null,
    isDeleted: data.isDeleted ?? false,
  };
}

function omitSoftDeletedFeedback(items: Feedback[]): Feedback[] {
  return items.filter((f) => f.isDeleted !== true);
}

/**
 * Fetches one page of feedback for a session using cursor pagination.
 * Composite index required: feedback (sessionId ASC, status ASC, createdAt DESC).
 */
export async function getSessionFeedbackPageRepo(
  workspaceId: string,
  sessionId: string,
  opts: {
    status?: "open" | "resolved" | "all";
    limit?: number;
    cursor?: FeedbackPageCursor | null;
  } = {}
): Promise<FeedbackPageResult> {
  const status = opts.status ?? "all";
  const pageSize = opts.limit ?? FEEDBACK_PAGE_SIZE_DEFAULT;
  assertQueryLimit(pageSize, "getSessionFeedbackPageRepo");

  const coll = collection(db, "feedback");
  const baseConstraints = [
    where("workspaceId", "==", workspaceId),
    where("sessionId", "==", sessionId),
    orderBy("status", "asc"),
    orderBy("createdAt", "desc"),
  ];

  const constraintsBase =
    status === "all"
      ? baseConstraints
      : [where("status", "==", status), ...baseConstraints];

  const q = query(
    coll,
    ...constraintsBase,
    ...(opts.cursor ? [startAfter(opts.cursor)] : []),
    limit(pageSize + 1)
  );
  const snapshot = await getDocs(q);
  const docs = omitSoftDeletedFeedback(snapshot.docs.map(docToFeedback));
  const hasMore = docs.length > pageSize;
  const feedback = hasMore ? docs.slice(0, pageSize) : docs;
  const lastVisibleDoc =
    hasMore && feedback.length > 0
      ? (snapshot.docs.find((d) => d.id === feedback[feedback.length - 1].id) as
          | FeedbackPageCursor
          | undefined) ?? null
      : null;

  return { feedback, lastVisibleDoc, hasMore };
}

/**
 * String-cursor wrapper around getSessionFeedbackPageRepo.
 * Used by API routes so cursors can be serialized as simple strings.
 */
export async function getSessionFeedbackPageWithStringCursorRepo(
  workspaceId: string,
  sessionId: string,
  limit: number,
  cursor?: string
): Promise<{ feedback: Feedback[]; nextCursor: string | null; hasMore: boolean }> {
  const trimmed = cursor?.trim();
  const cursorSnap =
    trimmed && trimmed.length > 0
      ? await getDoc(doc(db, "feedback", trimmed))
      : null;

  const { feedback, lastVisibleDoc, hasMore } = await getSessionFeedbackPageRepo(
    workspaceId,
    sessionId,
    {
      status: "all",
      limit,
      cursor: cursorSnap && cursorSnap.exists()
        ? (cursorSnap as QueryDocumentSnapshot)
        : null,
    }
  );

  return {
    feedback,
    nextCursor: lastVisibleDoc ? lastVisibleDoc.id : null,
    hasMore,
  };
}

/**
 * Workspace-scoped session feedback page.
 * Composite index required: feedback (workspaceId ASC, sessionId ASC, createdAt DESC).
 *
 * NOTE: This is intentionally separate from getSessionFeedbackPageRepo to avoid
 * changing ordering/constraints for other callers.
 */
export async function getSessionFeedbackPageForUserWithStringCursorRepo(
  args: {
    workspaceId: string;
    sessionId: string;
    limit: number;
    cursor?: string;
    /** When set, only returns tickets with this Firestore `status` (open or resolved). */
    statusFilter?: "open" | "resolved";
  }
): Promise<{ feedback: Feedback[]; nextCursor: string | null; hasMore: boolean }> {
  const { workspaceId, sessionId, limit: pageSize, cursor, statusFilter } = args;
  assertQueryLimit(pageSize, "getSessionFeedbackPageForUserWithStringCursorRepo");
  const trimmed = cursor?.trim();
  const cursorSnap: DocumentSnapshot | null =
    trimmed && trimmed.length > 0 ? await getDoc(doc(db, "feedback", trimmed)) : null;

  // Scope: workspaceId + sessionId.
  // Exclude soft-deleted rows by skipping `isDeleted === true`. We do not use
  // Firestore `where("isDeleted","!=",true)` here because it drops legacy docs
  // that omit the field; semantic is identical once all rows have `isDeleted`.
  let startAfterDoc: QueryDocumentSnapshot | null =
    cursorSnap && cursorSnap.exists() ? (cursorSnap as QueryDocumentSnapshot) : null;
  const collected: QueryDocumentSnapshot[] = [];
  let hasMore = false;

  const indexHint =
    statusFilter != null
      ? statusFilter === "open"
        ? "feedback(workspaceId ASC, sessionId ASC, status ASC, createdAt DESC) — open uses status in [open, null]"
        : "feedback(workspaceId ASC, sessionId ASC, status ASC, createdAt DESC)"
      : "feedback(workspaceId ASC, sessionId ASC, createdAt DESC)";

  /** Open list: include legacy rows with `status == null` (missing field still needs one-time backfill script). */
  const statusConstraints =
    statusFilter === "open"
      ? [where("status", "in", ["open", null])]
      : statusFilter === "resolved"
        ? [where("status", "==", "resolved")]
        : [];

  const runQuery = () =>
    query(
      collection(db, "feedback"),
      where("workspaceId", "==", workspaceId),
      where("sessionId", "==", sessionId),
      ...statusConstraints,
      orderBy("createdAt", "desc"),
      limit(pageSize),
      ...(startAfterDoc ? [startAfter(startAfterDoc)] : [])
    );

  try {
    while (collected.length < pageSize) {
      let snapshot;
      try {
        snapshot = await getDocs(runQuery());
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("requires an index")) {
          console.warn(`[FIRESTORE] Missing composite index: ${indexHint}`, {
            workspaceId,
            sessionId,
            statusFilter,
          });
        }
        throw err;
      }

      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      let filledPage = false;
      for (let i = 0; i < snapshot.docs.length; i++) {
        const d = snapshot.docs[i] as QueryDocumentSnapshot;
        if (d.data().isDeleted === true) continue;
        collected.push(d);
        if (collected.length >= pageSize) {
          const moreInBatch = i < snapshot.docs.length - 1;
          hasMore = moreInBatch || snapshot.size === pageSize;
          filledPage = true;
          break;
        }
      }

      if (filledPage) break;

      startAfterDoc = snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot;
      if (snapshot.size < pageSize) {
        hasMore = false;
        break;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("requires an index")) {
      console.warn(`[FIRESTORE] Missing composite index: ${indexHint}`, {
        workspaceId,
        sessionId,
        statusFilter,
      });
    }
    throw err;
  }

  const pageDocs = collected.slice(0, pageSize);
  const feedback = pageDocs.map((d) => docToFeedback(d));
  const lastVisibleDoc = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null;

  return {
    feedback,
    nextCursor: lastVisibleDoc ? lastVisibleDoc.id : null,
    hasMore,
  };
}

/** Max docs loaded into memory for sidebar search (no pagination of results). */
const SESSION_SEARCH_CORPUS_MAX = 200;

/**
 * Loads up to {@link SESSION_SEARCH_CORPUS_MAX} non-deleted feedback docs for a session
 * (mixed status, newest first) for server-side search. Uses the same access path as list pagination.
 */
export async function getSessionFeedbackSearchCorpusForUserRepo(args: {
  workspaceId: string;
  sessionId: string;
}): Promise<Feedback[]> {
  const { workspaceId, sessionId } = args;
  const maxDocs = SESSION_SEARCH_CORPUS_MAX;
  const batchLimit = 50;
  const out: Feedback[] = [];
  let cursor: string | undefined;

  while (out.length < maxDocs) {
    const { feedback, nextCursor, hasMore } = await getSessionFeedbackPageForUserWithStringCursorRepo({
      workspaceId,
      sessionId,
      limit: batchLimit,
      cursor,
    });
    for (const item of feedback) {
      if (out.length >= maxDocs) break;
      out.push(item);
    }
    if (!hasMore || !nextCursor) break;
    cursor = nextCursor;
  }

  return out;
}

/** Total count of feedback within a session (for sidebar display). */
export async function getSessionFeedbackCountRepo(
  workspaceId: string,
  sessionId: string
): Promise<number> {
  const coll = collection(db, "feedback");
  const q = query(
    coll,
    where("workspaceId", "==", workspaceId),
    where("sessionId", "==", sessionId)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

/** Counts by status for one session (aligned with session doc + /api/feedback/counts). */
export interface SessionFeedbackCounts {
  total: number;
  open: number;
  resolved: number;
}

/**
 * Returns the total number of feedback items in a workspace. Used for usage/billing.
 */
export async function getWorkspaceFeedbackCountRepo(workspaceId: string): Promise<number> {
  const q = query(
    collection(db, "feedback"),
    where("workspaceId", "==", workspaceId)
  );
  const snap = await getCountFromServer(q);
  return snap.data().count;
}


const OVERVIEW_PREVIEW_PER_RESOLVED_LIMIT = 3;

/**
 * Fetches up to N feedback items for a session filtered by resolution, newest first.
 * Composite index: feedback (workspaceId ASC, sessionId ASC, status ASC, createdAt DESC).
 */
export async function getSessionFeedbackByResolvedRepo(
  workspaceId: string,
  sessionId: string,
  isResolved: boolean,
  max: number = OVERVIEW_PREVIEW_PER_RESOLVED_LIMIT
): Promise<Feedback[]> {
  assertQueryLimit(max, "getSessionFeedbackByResolvedRepo");
  const status = isResolved ? "resolved" : "open";
  const q = query(
    collection(db, "feedback"),
    where("workspaceId", "==", workspaceId),
    where("sessionId", "==", sessionId),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return omitSoftDeletedFeedback(snapshot.docs.map(docToFeedback));
}

const OVERVIEW_FEEDBACK_BY_IDS_LIMIT = 10;

/** Fetches a single feedback doc by ID. Returns null if not found. */
export async function getFeedbackByIdRepo(
  feedbackId: string
): Promise<Feedback | null> {
  const snap = await getDoc(doc(db, "feedback", feedbackId));
  if (!snap.exists()) return null;
  if (snap.data().isDeleted === true) return null;
  return docToFeedback(snap as QueryDocumentSnapshot);
}

const USER_FEEDBACK_ALL_LIMIT = 100;

/**
 * Workspace-scoped Discussion inbox.
 * Composite index required: feedback (workspaceId ASC, createdAt DESC).
 */
export async function getWorkspaceFeedbackAllRepo(
  workspaceId: string,
  max: number = USER_FEEDBACK_ALL_LIMIT
): Promise<Feedback[]> {
  assertQueryLimit(max, "getWorkspaceFeedbackAllRepo");
  const coll = collection(db, "feedback");
  const q = query(
    coll,
    where("workspaceId", "==", workspaceId),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return omitSoftDeletedFeedback(snapshot.docs.map(docToFeedback));
}

/** Limit for insights feedback query. NEVER increase. */
const INSIGHTS_FEEDBACK_LIMIT = 150;

/**
 * Bounded feedback fetch for /api/insights charts.
 * Composite index required: feedback (workspaceId ASC, createdAt DESC).
 */
export async function getWorkspaceFeedbackForInsightsRepo(
  workspaceId: string
): Promise<Feedback[]> {
  assertQueryLimit(INSIGHTS_FEEDBACK_LIMIT, "getWorkspaceFeedbackForInsightsRepo");
  const isSimple = process.env.INSIGHTS_SIMPLE_QUERY === "1";
  const limitValue = isSimple ? 10 : INSIGHTS_FEEDBACK_LIMIT;

  const q = isSimple
    ? query(
        collection(db, "feedback"),
        where("workspaceId", "==", workspaceId),
        limit(10)
      )
    : query(
        collection(db, "feedback"),
        where("workspaceId", "==", workspaceId),
        orderBy("createdAt", "desc"),
        limit(INSIGHTS_FEEDBACK_LIMIT)
      );

  const snapshot = await getDocs(q);
  return omitSoftDeletedFeedback(snapshot.docs.map(docToFeedback));
}


/**
 * Workspace-scoped conversations only (commentCount > 0).
 * Composite index required: feedback (workspaceId ASC, commentCount DESC).
 */
export async function getWorkspaceFeedbackWithCommentsRepo(
  args: {
    workspaceId: string;
    limit: number;
    cursor?: string;
  }
): Promise<Feedback[]> {
  const { workspaceId, limit: pageSize, cursor } = args;
  assertQueryLimit(pageSize, "getWorkspaceFeedbackWithCommentsRepo");
  const coll = collection(db, "feedback");
  const trimmedCursor = cursor?.trim();
  const cursorSnap: DocumentSnapshot | null =
    trimmedCursor && trimmedCursor.length > 0
      ? await getDoc(doc(db, "feedback", trimmedCursor))
      : null;

  const q = query(
    coll,
    where("workspaceId", "==", workspaceId),
    where("commentCount", ">", 0),
    orderBy("commentCount", "desc"),
    ...(cursorSnap && cursorSnap.exists() ? [startAfter(cursorSnap)] : []),
    limit(pageSize)
  );
  const snapshot = await getDocs(q);
  return omitSoftDeletedFeedback(snapshot.docs.map(docToFeedback));
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
  return omitSoftDeletedFeedback(
    snaps
      .filter((s) => s.exists())
      .map((s) => docToFeedback(s as QueryDocumentSnapshot))
  );
}