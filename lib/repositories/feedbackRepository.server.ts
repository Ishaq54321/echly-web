import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Feedback, StructuredFeedback } from "@/lib/domain/feedback";
import {
  emptyWorkspaceInsightsDoc,
  workspaceInsightsRef,
} from "@/lib/repositories/insightsRepository.server";

type DocumentReference = FirebaseFirestore.DocumentReference;
type DocumentSnapshot = FirebaseFirestore.DocumentSnapshot;
type QueryDocumentSnapshot = FirebaseFirestore.QueryDocumentSnapshot;
type Timestamp = FirebaseFirestore.Timestamp;

function requireUserId(userId: string, context: string): string {
  const trimmed = userId.trim();
  if (!trimmed) {
    throw new Error(`Missing userId - invalid state (${context})`);
  }
  return trimmed;
}

function num(value: unknown, fallback: number = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getPath(obj: unknown, path: string): unknown {
  if (obj == null || typeof obj !== "object") return undefined;
  let cur: any = obj;
  for (const part of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

const feedbackPayload = (
  userId: string,
  sessionId: string,
  data: StructuredFeedback
) => ({
  userId,
  sessionId,
  title: data.title,
  instruction: data.instruction ?? data.description ?? null,
  suggestion: data.suggestion ?? "",
  type: data.type,
  status: data.status ?? ("open" as const),
  createdAt: new Date(),
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
  userId: string,
  sessionId: string,
  _ownerUserId: string,
  data: StructuredFeedback,
  feedbackId?: string,
  screenshotId?: string
): Promise<DocumentReference> {
  const resolvedUserId = requireUserId(
    userId,
    "addFeedbackWithSessionCountersRepo"
  );
  const sessionRef = adminDb.doc(`sessions/${sessionId}`);
  const sessionSnap = await sessionRef.get();
  if (!sessionSnap.exists) {
    throw new Error("Session not found");
  }
  const sessionData = sessionSnap.data();
  const resolvedWorkspaceId =
    typeof sessionData?.workspaceId === "string"
      ? sessionData.workspaceId.trim()
      : "";
  if (!resolvedWorkspaceId) {
    throw new Error("Missing workspaceId on session");
  }

  const payload = {
    ...feedbackPayload(resolvedUserId, sessionId, data),
    workspaceId: resolvedWorkspaceId,
  };
  const workspaceRef = adminDb.doc(`workspaces/${resolvedWorkspaceId}`);
  const insightsRef = workspaceInsightsRef(resolvedWorkspaceId);
  const feedbackRef = await adminDb.runTransaction(async (tx) => {
    const feedbackRef =
      feedbackId != null && feedbackId !== ""
        ? adminDb.doc(`feedback/${feedbackId}`)
        : adminDb.collection("feedback").doc();
    if (feedbackId) {
      const existing = await tx.get(feedbackRef);
      if (existing.exists) {
        console.log("[idempotency] duplicate prevented", {
          feedbackId,
        });
        return feedbackRef;
      }
    }

    const sessionSnap = await tx.get(sessionRef);
    const workspaceSnap = await tx.get(workspaceRef);
    const insightsSnap = await tx.get(insightsRef);

    const stats = (workspaceSnap.data()?.stats ?? {}) as Record<string, unknown>;
    const totalFeedback = (stats.totalFeedback as number | undefined) ?? 0;
    const last30DaysFeedback = (stats.last30DaysFeedback as number | undefined) ?? 0;

    const issueType = (data.type ?? "").trim() || "general";
    const day = new Date().toISOString().slice(0, 10);
    if (!insightsSnap.exists) {
      tx.set(insightsRef, emptyWorkspaceInsightsDoc());
    }
    tx.set(feedbackRef, payload);
    if (typeof screenshotId === "string" && screenshotId.trim() !== "") {
      tx.set(
        adminDb.doc(`screenshots/${screenshotId}`),
        { status: "ATTACHED", feedbackId: feedbackRef.id },
        { merge: true }
      );
    }
    console.log("[idempotency] created", { feedbackId: feedbackRef.id });
    const sessionRow = sessionSnap.data() ?? {};
    tx.set(
      sessionRef,
      {
        openCount: num((sessionRow as any).openCount) + 1,
        totalCount: num((sessionRow as any).totalCount) + 1,
        feedbackCount: num((sessionRow as any).feedbackCount) + 1,
        updatedAt: new Date(),
      },
      { merge: true }
    );
    tx.update(workspaceRef, {
      "stats.totalFeedback": totalFeedback + 1,
      "stats.last30DaysFeedback": last30DaysFeedback + 1,
      "stats.updatedAt": new Date(),
    });

    const insightsRow = insightsSnap.data() ?? emptyWorkspaceInsightsDoc();
    const issueTypePath = `issueTypes.${issueType}`;
    const sessionCountPath = `sessionCounts.${sessionId}`;
    const dailyFeedbackPath = `daily.${day}.feedback`;
    tx.set(
      insightsRef,
      {
        totalFeedback: num((insightsRow as any).totalFeedback) + 1,
        timeSavedMinutes: num((insightsRow as any).timeSavedMinutes) + 5,
        [issueTypePath]: num(getPath(insightsRow, issueTypePath)) + 1,
        [sessionCountPath]: num(getPath(insightsRow, sessionCountPath)) + 1,
        [dailyFeedbackPath]: num(getPath(insightsRow, dailyFeedbackPath)) + 1,
        updatedAt: new Date(),
      } as Record<string, unknown>,
      { merge: true }
    );
    return feedbackRef;
  });
  return feedbackRef;
}

type FeedbackUpdate = Partial<{
  title: string;
  instruction: string;
  type: string;
  status: "open" | "resolved";
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
    status: "open" | "resolved";
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
    const feedbackSnap = await adminDb.doc(`feedback/${feedbackId}`).get();
    if (feedbackSnap.exists) {
      const row = feedbackSnap.data();
      const sessionId = (row as { sessionId?: unknown } | undefined)?.sessionId;
      if (typeof sessionId === "string" && sessionId.trim() !== "") {
        sessionIdForInvalidation = sessionId;
      }
    }
  }
  await adminDb.doc(`feedback/${feedbackId}`).update(updates);
  void sessionIdForInvalidation;
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
  const feedbackRef = adminDb.doc(`feedback/${feedbackId}`);
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

  const result = await adminDb.runTransaction(async (tx) => {
    const feedbackSnap = await tx.get(feedbackRef);
    if (!feedbackSnap.exists) return null;
    const fd = (feedbackSnap.data() ?? {}) as Record<string, unknown>;
    const sessionId = (fd.sessionId as string) ?? "";
    const raw = (fd.status as string) ?? "open";
    const wasStatus: FeedbackStatus = raw === "resolved" ? "resolved" : "open";

    const sessionRef = adminDb.doc(`sessions/${sessionId}`);
    const sessionSnap = await tx.get(sessionRef);
    const s = sessionSnap.data() || {};
    const workspaceId =
      typeof (s as { workspaceId?: unknown }).workspaceId === "string"
        ? (s as { workspaceId: string }).workspaceId.trim()
        : "";
    if (!workspaceId) {
      throw new Error("Missing workspaceId on session");
    }
    let openCount = (s.openCount as number) ?? 0;
    let resolvedCount = (s.resolvedCount as number) ?? 0;

    const insightsRef = workspaceInsightsRef(workspaceId);
    const insightsSnap = await tx.get(insightsRef);
    if (!insightsSnap.exists) {
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
      updatedAt: new Date(),
    });

    if (wasStatus !== toStatus) {
      const delta = (toStatus === "resolved" ? 1 : 0) - (wasStatus === "resolved" ? 1 : 0);
      if (delta !== 0) {
        const day = new Date().toISOString().slice(0, 10);
        const insightsRow = insightsSnap?.data() ?? emptyWorkspaceInsightsDoc();
        const dailyResolvedPath = `daily.${day}.resolved`;
        tx.set(
          insightsRef,
          {
            totalResolved: num((insightsRow as any).totalResolved) + delta,
            [dailyResolvedPath]: num(getPath(insightsRow, dailyResolvedPath)) + delta,
            updatedAt: new Date(),
          } as Record<string, unknown>,
          { merge: true }
        );
      }
    }
    return { sessionId };
  });
  void result;
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
  const status = data.status === "resolved" ? "resolved" : "open";
  const isResolved = status === "resolved" || data.isResolved === true;
  return {
    id: docSnap.id,
    userId: requireUserId(
      typeof data.userId === "string" ? data.userId : "",
      "docToFeedback"
    ),
    sessionId: data.sessionId,
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
    // Domain type uses client Firestore Timestamp; server may return Admin Timestamp/Date.
    createdAt: (data.createdAt ?? null) as any,
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
    lastCommentAt: (data.lastCommentAt ?? null) as any,
    isDeleted: data.isDeleted ?? false,
    status,
  };
}

function omitSoftDeletedFeedback(items: Feedback[]): Feedback[] {
  return items.filter((f) => f.isDeleted !== true);
}

/**
 * Fetches one page of feedback for a session using cursor pagination.
 * Composite index required: feedback (workspaceId ASC, sessionId ASC, status ASC, createdAt DESC).
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

  let q: FirebaseFirestore.Query = adminDb
    .collection("feedback")
    .where("workspaceId", "==", workspaceId)
    .where("sessionId", "==", sessionId);
  if (status !== "all") q = q.where("status", "==", status);
  q = q.orderBy("status", "asc").orderBy("createdAt", "desc");
  if (opts.cursor) q = q.startAfter(opts.cursor);
  const snapshot = await q.limit(pageSize + 1).get();

  const docs = omitSoftDeletedFeedback(
    (snapshot.docs as QueryDocumentSnapshot[]).map(docToFeedback)
  );
  const hasMore = docs.length > pageSize;
  const feedback = hasMore ? docs.slice(0, pageSize) : docs;
  const lastVisibleDoc =
    hasMore && feedback.length > 0
      ? ((snapshot.docs as QueryDocumentSnapshot[]).find(
          (d) => d.id === feedback[feedback.length - 1].id
        ) as FeedbackPageCursor | undefined) ?? null
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
      ? await adminDb.doc(`feedback/${trimmed}`).get()
      : null;

  const { feedback, lastVisibleDoc, hasMore } = await getSessionFeedbackPageRepo(
    workspaceId,
    sessionId,
    {
      status: "all",
      limit,
      cursor: cursorSnap && cursorSnap.exists
        ? (cursorSnap as unknown as QueryDocumentSnapshot)
        : null,
    }
  );

  return {
    feedback,
    nextCursor: lastVisibleDoc ? lastVisibleDoc.id : null,
    hasMore,
  };
}

/** Safety cap for unauthenticated public share reads (cost / abuse bound). */
const PUBLIC_SHARE_FEEDBACK_PAGE_SIZE = 100;
const PUBLIC_SHARE_FEEDBACK_MAX = 10_000;

/**
 * All non-deleted feedback for a session using session-scoped pagination only (no workspace / user).
 * Same underlying path as {@link getSessionFeedbackPageWithStringCursorRepo}; not the user-scoped query
 * that requires `userId` from auth.
 */
export async function getAllFeedbackForPublicShareBySessionIdRepo(
  sessionId: string,
  workspaceId: string
): Promise<Feedback[]> {
  const out: Feedback[] = [];
  let cursor: QueryDocumentSnapshot | null = null;

  while (out.length < PUBLIC_SHARE_FEEDBACK_MAX) {
    let q: FirebaseFirestore.Query = adminDb
      .collection("feedback")
      .where("sessionId", "==", sessionId)
      .where("workspaceId", "==", workspaceId)
      .orderBy("createdAt", "desc");
    if (cursor) q = q.startAfter(cursor);
    const snapshot = await q.limit(PUBLIC_SHARE_FEEDBACK_PAGE_SIZE).get();
    if (snapshot.empty) break;

    const rows = omitSoftDeletedFeedback(snapshot.docs.map(docToFeedback));
    for (const row of rows) {
      if (out.length >= PUBLIC_SHARE_FEEDBACK_MAX) break;
      out.push(row);
    }

    if (snapshot.size < PUBLIC_SHARE_FEEDBACK_PAGE_SIZE) break;
    cursor = snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot;
  }

  return out.slice(0, PUBLIC_SHARE_FEEDBACK_MAX);
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
    /** When set, only returns tickets with this Firestore `status` bucket. */
    statusFilter?: "open" | "resolved";
  }
): Promise<{ feedback: Feedback[]; nextCursor: string | null; hasMore: boolean }> {
  const { workspaceId, sessionId, limit: pageSize, cursor, statusFilter } = args;
  assertQueryLimit(pageSize, "getSessionFeedbackPageForUserWithStringCursorRepo");
  const trimmed = cursor?.trim();
  const cursorSnap: DocumentSnapshot | null =
    trimmed && trimmed.length > 0 ? await adminDb.doc(`feedback/${trimmed}`).get() : null;

  // Scope: workspaceId + sessionId.
  // Exclude soft-deleted rows by skipping `isDeleted === true`. We do not use
  // Firestore `where("isDeleted","!=",true)` here because it drops legacy docs
  // that omit the field; semantic is identical once all rows have `isDeleted`.
  let startAfterDoc: DocumentSnapshot | null =
    cursorSnap && cursorSnap.exists ? cursorSnap : null;
  const collected: QueryDocumentSnapshot[] = [];
  let hasMore = false;

  const indexHint =
    statusFilter != null
      ? statusFilter === "open"
        ? "feedback(workspaceId ASC, sessionId ASC, status ASC, createdAt DESC)"
        : statusFilter === "resolved"
          ? "feedback(workspaceId ASC, sessionId ASC, status ASC, createdAt DESC)"
          : "feedback(workspaceId ASC, sessionId ASC, status ASC, createdAt DESC)"
      : "feedback(workspaceId ASC, sessionId ASC, createdAt DESC)";

  const runQuery = () => {
    let q: FirebaseFirestore.Query = adminDb
      .collection("feedback")
      .where("workspaceId", "==", workspaceId)
      .where("sessionId", "==", sessionId);
    if (statusFilter) q = q.where("status", "==", statusFilter);
    q = q.orderBy("createdAt", "desc").limit(pageSize);
    if (startAfterDoc) q = q.startAfter(startAfterDoc);
    return q;
  };

  try {
    while (collected.length < pageSize) {
      let snapshot: FirebaseFirestore.QuerySnapshot;
      try {
        snapshot = await runQuery().get();
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

      startAfterDoc = snapshot.docs[snapshot.docs.length - 1] as DocumentSnapshot;
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

/** Total count of feedback for a session (for sidebar display). */
export async function getSessionFeedbackCountRepo(
  workspaceId: string,
  sessionId: string
): Promise<number> {
  const snap = await adminDb
    .collection("feedback")
    .where("workspaceId", "==", workspaceId)
    .where("sessionId", "==", sessionId)
    .count()
    .get();
  return snap.data().count;
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
  const feedbackRef = adminDb.doc(`feedback/${feedbackId}`);

  const result = await adminDb.runTransaction(async (tx) => {
    const feedbackSnap = await tx.get(feedbackRef);
    if (!feedbackSnap.exists) return null;
    const data = (feedbackSnap.data() ?? {}) as Record<string, unknown>;
    if (data.isDeleted === true) return null;
    const sessionId = (data.sessionId as string) ?? "";
    const status = (data.status as string) ?? "open";
    const sessionRef = adminDb.doc(`sessions/${sessionId}`);
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
    const totalCountUpdate = Math.max(0, currentTotalCount - 1);
    const feedbackCount = Math.max(0, ((s.feedbackCount as number) ?? 0) - 1);

    tx.update(feedbackRef, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    tx.update(sessionRef, {
      openCount,
      resolvedCount,
      skippedCount,
      totalCount: totalCountUpdate,
      feedbackCount,
      updatedAt: new Date(),
    });
    let resolvedWorkspaceId =
      typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
    if (!resolvedWorkspaceId) {
      const srow = sessionSnap.data() ?? {};
      resolvedWorkspaceId =
        typeof (srow as { workspaceId?: unknown }).workspaceId === "string"
          ? (srow as { workspaceId: string }).workspaceId.trim()
          : "";
    }
    if (!resolvedWorkspaceId) {
      throw new Error("Missing workspaceId on feedback/session");
    }
    const workspaceRef = adminDb.doc(`workspaces/${resolvedWorkspaceId}`);
    tx.update(workspaceRef, {
      "stats.updatedAt": new Date(),
    });
    return { sessionId, workspaceId: resolvedWorkspaceId };
  });
  void result;
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
  const snap = await adminDb
    .collection("feedback")
    .where("workspaceId", "==", workspaceId)
    .count()
    .get();
  return snap.data().count;
}

const DELETE_SESSION_FEEDBACK_LIMIT = 500;

/**
 * Deletes all feedback (tickets) for a session. Used when deleting a session.
 * Returns the number of docs deleted so callers can update workspace.stats.
 * Screenshot URLs in Storage are not removed here (TODO: optional cleanup).
 */
export async function deleteAllFeedbackForSessionRepo(
  sessionId: string,
  workspaceId: string
): Promise<number> {
  const wid = workspaceId.trim();
  if (!wid) {
    throw new Error("Missing workspaceId");
  }
  const snapshot = await adminDb
    .collection("feedback")
    .where("workspaceId", "==", wid)
    .where("sessionId", "==", sessionId)
    .limit(DELETE_SESSION_FEEDBACK_LIMIT)
    .get();
  const count = snapshot.docs.length;
  await Promise.all(snapshot.docs.map((d) => d.ref.delete()));
  return count;
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
  const snapshot = await adminDb
    .collection("feedback")
    .where("workspaceId", "==", workspaceId)
    .where("sessionId", "==", sessionId)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();
  return omitSoftDeletedFeedback(snapshot.docs.map(docToFeedback));
}

const OVERVIEW_FEEDBACK_BY_IDS_LIMIT = 10;

/** Fetches a single feedback doc by ID. Returns null if not found. */
export async function getFeedbackByIdRepo(
  feedbackId: string
): Promise<Feedback | null> {
  const snap = await adminDb.doc(`feedback/${feedbackId}`).get();
  if (!snap.exists) return null;
  const row = snap.data() as { isDeleted?: unknown } | undefined;
  if (row?.isDeleted === true) return null;
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
  const snapshot = await adminDb
    .collection("feedback")
    .where("workspaceId", "==", workspaceId)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();
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
    ? adminDb
        .collection("feedback")
        .where("workspaceId", "==", workspaceId)
        .limit(10)
    : adminDb
        .collection("feedback")
        .where("workspaceId", "==", workspaceId)
        .orderBy("createdAt", "desc")
        .limit(limitValue);

  const snapshot = await q.get();
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
  const feedbackRef = adminDb.doc(`feedback/${feedbackId}`);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(feedbackRef);
    if (!snap.exists) return;
    const row = snap.data() ?? {};
    const current = num((row as any).commentCount);
    tx.update(feedbackRef, {
      commentCount: current + 1,
      lastCommentPreview: preview || null,
      lastCommentAt: new Date(),
    });
  });
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
  const trimmedCursor = cursor?.trim();
  const cursorSnap: DocumentSnapshot | null =
    trimmedCursor && trimmedCursor.length > 0
      ? await adminDb.doc(`feedback/${trimmedCursor}`).get()
      : null;

  let q: FirebaseFirestore.Query = adminDb
    .collection("feedback")
    .where("workspaceId", "==", workspaceId)
    .where("commentCount", ">", 0)
    .orderBy("commentCount", "desc")
    .limit(pageSize);
  if (cursorSnap && cursorSnap.exists) q = q.startAfter(cursorSnap);

  const snapshot = await q.get();
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
  const snaps = await Promise.all(limited.map((id) => adminDb.doc(`feedback/${id}`).get()));
  return omitSoftDeletedFeedback(
    snaps
      .filter((s) => s.exists)
      .map((s) => docToFeedback(s as QueryDocumentSnapshot))
  );
}