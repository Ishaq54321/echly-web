import {
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
  startAfter,
  updateDoc,
  where,
  increment,
  type DocumentReference,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Feedback, StructuredFeedback } from "@/lib/domain/feedback";
import { invalidateCounts } from "@/lib/server/cache/feedbackCountsCache";
import { invalidateFeedbackCache } from "@/lib/server/cache/feedbackCache";
import {
  emptyWorkspaceInsightsDoc,
  workspaceInsightsRef,
} from "@/lib/repositories/insightsRepository";

const feedbackPayload = (
  workspaceId: string,
  sessionId: string,
  userId: string,
  data: StructuredFeedback
) => ({
  workspaceId,
  sessionId,
  userId,
  title: data.title,
  instruction: data.instruction ?? data.description ?? null,
  suggestion: data.suggestion ?? "",
  type: data.type,
  status: data.status ?? ("open" as const),
  createdAt: serverTimestamp(),
  commentCount: 0,

  contextSummary: data.contextSummary ?? null,
  actionSteps: data.actionSteps ?? null,
  suggestedTags: data.suggestedTags ?? null,

  url: data.url ?? null,
  viewportWidth: data.viewportWidth ?? null,
  viewportHeight: data.viewportHeight ?? null,
  userAgent: data.userAgent ?? null,
  clientTimestamp: data.timestamp ?? null,

  screenshotUrl: data.screenshotUrl ?? null,
  screenshotStatus: data.screenshotStatus ?? null,
  isDeleted: false,
});

/**
 * Creates feedback and updates session denormalized counters in one transaction.
 * Use for feedback create to avoid race conditions. Migration-safe: uses increment(1).
 */
export async function addFeedbackWithSessionCountersRepo(
  workspaceId: string,
  sessionId: string,
  userId: string,
  data: StructuredFeedback,
  feedbackId?: string,
  screenshotId?: string
): Promise<DocumentReference> {
  const payload = feedbackPayload(workspaceId, sessionId, userId, data);
  const sessionRef = doc(db, "sessions", sessionId);

  const workspaceRef = doc(db, "workspaces", workspaceId);
  const insightsRef = workspaceInsightsRef(workspaceId);
  const feedbackRef = await runTransaction(db, async (tx) => {
    const feedbackRef =
      feedbackId != null && feedbackId !== ""
        ? doc(db, "feedback", feedbackId)
        : doc(collection(db, "feedback"));
    if (feedbackId) {
      const existing = await tx.get(feedbackRef);
      if (existing.exists()) {
        console.log("[idempotency] duplicate prevented", {
          feedbackId,
        });
        return feedbackRef;
      }
    }

    const workspaceSnap = await tx.get(workspaceRef);
    const insightsSnap = await tx.get(insightsRef);
    const stats = (workspaceSnap.data()?.stats ?? {}) as Record<string, unknown>;
    const totalFeedback = (stats.totalFeedback as number | undefined) ?? 0;
    const last30DaysFeedback = (stats.last30DaysFeedback as number | undefined) ?? 0;

    const issueType = (data.type ?? "").trim() || "general";
    const day = new Date().toISOString().slice(0, 10);
    if (!insightsSnap.exists()) {
      tx.set(insightsRef, emptyWorkspaceInsightsDoc());
    }
    tx.set(feedbackRef, payload);
    if (typeof screenshotId === "string" && screenshotId.trim() !== "") {
      tx.set(
        doc(db, "screenshots", screenshotId),
        { status: "ATTACHED", feedbackId: feedbackRef.id },
        { merge: true }
      );
    }
    console.log("[idempotency] created", { feedbackId: feedbackRef.id });
    tx.update(sessionRef, {
      openCount: increment(1),
      totalCount: increment(1),
      feedbackCount: increment(1),
      updatedAt: serverTimestamp(),
    });
    tx.update(workspaceRef, {
      "stats.totalFeedback": totalFeedback + 1,
      "stats.last30DaysFeedback": last30DaysFeedback + 1,
      "stats.updatedAt": serverTimestamp(),
    });
    tx.update(insightsRef, {
      totalFeedback: increment(1),
      timeSavedMinutes: increment(5),
      [`issueTypes.${issueType}`]: increment(1),
      [`sessionCounts.${sessionId}`]: increment(1),
      [`daily.${day}.feedback`]: increment(1),
      updatedAt: serverTimestamp(),
    } as Record<string, unknown>);
    return feedbackRef;
  });
  invalidateCounts(sessionId);
  return feedbackRef;
}

type FeedbackUpdate = Partial<{
  title: string;
  instruction: string;
  type: string;
  status: "processing" | "complete" | "open" | "resolved" | "failed";
  screenshotUrl: string | null;
  screenshotStatus: "attached" | "pending" | "none" | "failed" | null;
  actionSteps: string[] | null;
  suggestedTags: string[] | null;
}>;

function statusFromResolved(isResolved: boolean): "open" | "resolved" {
  if (isResolved) return "resolved";
  return "open";
}

export async function updateFeedbackRepo(
  feedbackId: string,
  data: Partial<{
    title: string;
    instruction: string;
    description: string;
    type: string;
    status: "processing" | "complete" | "open" | "resolved" | "failed";
    isResolved: boolean;
    screenshotUrl: string | null;
    screenshotStatus: "attached" | "pending" | "none" | "failed" | null;
    actionSteps: string[] | null;
    suggestedTags: string[] | null;
  }>
): Promise<void> {
  const updates: FeedbackUpdate = {};
  if (typeof data.title === "string") updates.title = data.title;
  if (typeof data.instruction === "string") updates.instruction = data.instruction;
  else if (typeof data.description === "string") updates.instruction = data.description;
  if (typeof data.type === "string") updates.type = data.type;
  if (typeof data.status === "string") updates.status = data.status;
  if (data.screenshotUrl !== undefined) updates.screenshotUrl = data.screenshotUrl;
  if (data.screenshotStatus !== undefined) updates.screenshotStatus = data.screenshotStatus;
  if (data.actionSteps !== undefined) updates.actionSteps = data.actionSteps;
  if (data.suggestedTags !== undefined) updates.suggestedTags = data.suggestedTags;
  const isResolved = (data as { isResolved?: boolean }).isResolved;
  if (typeof isResolved === "boolean") {
    updates.status = statusFromResolved(isResolved === true);
  }
  if (Object.keys(updates).length === 0) return;
  let sessionIdForInvalidation: string | null = null;
  if (updates.status !== undefined) {
    const feedbackSnap = await getDoc(doc(db, "feedback", feedbackId));
    if (feedbackSnap.exists()) {
      const sessionId = feedbackSnap.data().sessionId;
      if (typeof sessionId === "string" && sessionId.trim() !== "") {
        sessionIdForInvalidation = sessionId;
      }
    }
  }
  await updateDoc(doc(db, "feedback", feedbackId), updates);
  if (sessionIdForInvalidation) {
    invalidateCounts(sessionIdForInvalidation);
  }
}

type FeedbackStatus = "open" | "resolved";

/**
 * Updates feedback (resolve / reopen) and session denormalized counters in one transaction.
 * Use when isResolved may change. Migration-safe: floors session counters at 0.
 */
export async function updateFeedbackResolveAndSessionCountersRepo(
  feedbackId: string,
  data: Partial<{
    title: string;
    instruction: string;
    description: string;
    type: string;
    screenshotUrl: string | null;
    actionSteps: string[] | null;
    suggestedTags: string[] | null;
    isResolved: boolean;
  }>
): Promise<void> {
  const feedbackRef = doc(db, "feedback", feedbackId);
  const isResolved = (data as { isResolved?: boolean }).isResolved === true;
  const toStatus: FeedbackStatus = statusFromResolved(isResolved);

  const updates: FeedbackUpdate = {};
  if (typeof data.title === "string") updates.title = data.title;
  if (typeof data.instruction === "string") updates.instruction = data.instruction;
  else if (typeof data.description === "string") updates.instruction = data.description;
  if (typeof data.type === "string") updates.type = data.type;
  if (data.screenshotUrl !== undefined) updates.screenshotUrl = data.screenshotUrl;
  if (data.actionSteps !== undefined) updates.actionSteps = data.actionSteps;
  if (data.suggestedTags !== undefined) updates.suggestedTags = data.suggestedTags;
  if (typeof (data as { isResolved?: boolean }).isResolved === "boolean") {
    updates.status = toStatus;
  }

  const result = await runTransaction(db, async (tx) => {
    const feedbackSnap = await tx.get(feedbackRef);
    if (!feedbackSnap.exists()) return null;
    const fd = feedbackSnap.data();
    const sessionId = fd.sessionId as string;
    const workspaceId = (fd.workspaceId as string | undefined) ?? undefined;
    const raw = (fd.status as string) ?? "open";
    const wasStatus: FeedbackStatus = raw === "resolved" ? "resolved" : "open";

    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const s = sessionSnap.data() || {};
    let openCount = (s.openCount as number) ?? 0;
    let resolvedCount = (s.resolvedCount as number) ?? 0;

    const insightsRef = workspaceId ? workspaceInsightsRef(workspaceId) : null;
    const insightsSnap = insightsRef ? await tx.get(insightsRef) : null;
    if (insightsRef && insightsSnap && !insightsSnap.exists()) {
      tx.set(insightsRef, emptyWorkspaceInsightsDoc());
    }

    // Important: Firestore transactions require *all reads* to happen before *any writes*.
    // We read both feedback + session above, then perform writes below.
    if (Object.keys(updates).length > 0) {
      tx.update(feedbackRef, updates);
    }

    if (wasStatus !== toStatus) {
      if (wasStatus === "open") openCount = Math.max(0, openCount - 1);
      else if (wasStatus === "resolved") resolvedCount = Math.max(0, resolvedCount - 1);
      if (toStatus === "open") openCount += 1;
      else if (toStatus === "resolved") resolvedCount += 1;
    }

    tx.update(sessionRef, {
      openCount,
      resolvedCount,
      updatedAt: serverTimestamp(),
    });

    if (insightsRef && wasStatus !== toStatus) {
      const delta = (toStatus === "resolved" ? 1 : 0) - (wasStatus === "resolved" ? 1 : 0);
      if (delta !== 0) {
        const day = new Date().toISOString().slice(0, 10);
        tx.update(insightsRef, {
          totalResolved: increment(delta),
          [`daily.${day}.resolved`]: increment(delta),
          updatedAt: serverTimestamp(),
        } as Record<string, unknown>);
      }
    }
    return { sessionId };
  });
  if (result?.sessionId) {
    invalidateCounts(result.sessionId);
  }
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
  return {
    id: docSnap.id,
    workspaceId: typeof data.workspaceId === "string" ? data.workspaceId : undefined,
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
 * User-scoped session feedback page.
 * Composite index required: feedback (workspaceId ASC, sessionId ASC, createdAt DESC).
 *
 * NOTE: This is intentionally separate from getSessionFeedbackPageRepo to avoid
 * changing ordering/constraints for other callers.
 */
export async function getSessionFeedbackPageForUserWithStringCursorRepo(
  args: {
    workspaceId: string;
    sessionId: string;
    userId: string;
    limit: number;
    cursor?: string;
  }
): Promise<{ feedback: Feedback[]; nextCursor: string | null; hasMore: boolean }> {
  const { workspaceId, sessionId, userId, limit: pageSize, cursor } = args;
  assertQueryLimit(pageSize, "getSessionFeedbackPageForUserWithStringCursorRepo");
  void userId;
  const trimmed = cursor?.trim();
  const cursorSnap: DocumentSnapshot | null =
    trimmed && trimmed.length > 0 ? await getDoc(doc(db, "feedback", trimmed)) : null;

  // Same ordering as before: workspaceId + sessionId + createdAt desc.
  // Exclude soft-deleted rows by skipping `isDeleted === true`. We do not use
  // Firestore `where("isDeleted","!=",true)` here because it drops legacy docs
  // that omit the field; semantic is identical once all rows have `isDeleted`.
  let startAfterDoc: QueryDocumentSnapshot | null =
    cursorSnap && cursorSnap.exists() ? (cursorSnap as QueryDocumentSnapshot) : null;
  const collected: QueryDocumentSnapshot[] = [];
  let hasMore = false;

  const runQuery = () =>
    query(
      collection(db, "feedback"),
      where("workspaceId", "==", workspaceId),
      where("sessionId", "==", sessionId),
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
          console.warn(
            "[FIRESTORE] Missing composite index: feedback(workspaceId ASC, sessionId ASC, createdAt DESC)",
            { workspaceId, sessionId }
          );
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
      console.warn(
        "[FIRESTORE] Missing composite index: feedback(workspaceId ASC, sessionId ASC, createdAt DESC)",
        { workspaceId, sessionId }
      );
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

/** Total count of feedback for a session (for sidebar display). */
export async function getSessionFeedbackCountRepo(sessionId: string): Promise<number> {
  const coll = collection(db, "feedback");
  const q = query(coll, where("sessionId", "==", sessionId));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function deleteFeedbackRepo(feedbackId: string): Promise<void> {
  await deleteFeedbackWithSessionCountersRepo(feedbackId);
}

/**
 * Deletes feedback and updates session denormalized counters in one transaction.
 * Migration-safe: reads session and floors counters at 0.
 */
export async function deleteFeedbackWithSessionCountersRepo(
  feedbackId: string
): Promise<void> {
  const feedbackRef = doc(db, "feedback", feedbackId);

  const result = await runTransaction(db, async (tx) => {
    const feedbackSnap = await tx.get(feedbackRef);
    if (!feedbackSnap.exists()) return null;
    const data = feedbackSnap.data();
    if (data.isDeleted === true) return null;
    const sessionId = data.sessionId as string;
    const workspaceId = data.workspaceId as string | undefined;
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
    const currentTotalCount = (s.totalCount as number) ?? 0;
    const totalCountUpdate = currentTotalCount <= 0 ? 0 : increment(-1);
    const feedbackCount = Math.max(0, ((s.feedbackCount as number) ?? 0) - 1);

    tx.update(feedbackRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
    });
    tx.update(sessionRef, {
      openCount,
      resolvedCount,
      skippedCount,
      totalCount: totalCountUpdate,
      feedbackCount,
      updatedAt: serverTimestamp(),
    });
    if (workspaceId) {
      const workspaceRef = doc(db, "workspaces", workspaceId);
      tx.update(workspaceRef, {
        "stats.updatedAt": serverTimestamp(),
      });
    }
    return { sessionId, workspaceId };
  });
  if (result?.sessionId) {
    invalidateCounts(result.sessionId);
    if (typeof result.workspaceId === "string" && result.workspaceId.trim() !== "") {
      invalidateFeedbackCache(result.workspaceId, result.sessionId);
    }
  }
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

const DELETE_SESSION_FEEDBACK_LIMIT = 500;

/**
 * Deletes all feedback (tickets) for a session. Used when deleting a session.
 * Returns the number of docs deleted so callers can update workspace.stats.
 * Screenshot URLs in Storage are not removed here (TODO: optional cleanup).
 */
export async function deleteAllFeedbackForSessionRepo(
  sessionId: string
): Promise<number> {
  const q = query(
    collection(db, "feedback"),
    where("sessionId", "==", sessionId),
    limit(DELETE_SESSION_FEEDBACK_LIMIT)
  );
  const snapshot = await getDocs(q);
  const count = snapshot.docs.length;
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
  if (count > 0) {
    invalidateCounts(sessionId);
  }
  return count;
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
 * Fetches all feedback for a user across sessions (for Discussion inbox).
 * Composite index required: feedback (userId ASC, createdAt DESC).
 */
export async function getUserFeedbackAllRepo(
  userId: string,
  max: number = USER_FEEDBACK_ALL_LIMIT
): Promise<Feedback[]> {
  assertQueryLimit(max, "getUserFeedbackAllRepo");
  const coll = collection(db, "feedback");
  const q = query(
    coll,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return omitSoftDeletedFeedback(snapshot.docs.map(docToFeedback));
}

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
    ? query(collection(db, "feedback"), limit(10))
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
 * Increments feedback.commentCount and updates lastCommentPreview/lastCommentAt.
 * Call when a comment is added.
 */
export async function incrementFeedbackCommentCountRepo(
  feedbackId: string,
  lastMessage: string
): Promise<void> {
  const preview = lastMessage.trim().slice(0, 120);
  const feedbackRef = doc(db, "feedback", feedbackId);
  await updateDoc(feedbackRef, {
    commentCount: increment(1),
    lastCommentPreview: preview || null,
    lastCommentAt: serverTimestamp(),
  });
}

/**
 * Fetches feedback with at least one comment (conversations only).
 * Composite index required: feedback (userId ASC, commentCount DESC).
 * Results are sorted by lastCommentAt DESC in the API layer.
 */
export async function getUserFeedbackWithCommentsRepo(
  userId: string,
  max: number = USER_FEEDBACK_ALL_LIMIT
): Promise<Feedback[]> {
  assertQueryLimit(max, "getUserFeedbackWithCommentsRepo");
  const coll = collection(db, "feedback");
  const q = query(
    coll,
    where("userId", "==", userId),
    where("commentCount", ">", 0),
    orderBy("commentCount", "desc"),
    limit(max)
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