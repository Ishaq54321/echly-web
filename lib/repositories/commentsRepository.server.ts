import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldPath, FieldValue } from "firebase-admin/firestore";
import { assertQueryLimit } from "@/lib/querySafety";
import type { CommentAttachment, CommentPosition, CommentTextRange } from "@/lib/domain/comment";
import {
  getSessionByIdRepo,
  updateSessionUpdatedAtRepo,
} from "@/lib/repositories/sessionsRepository.server";
import { incrementInsightsOnCommentCreateRepo } from "@/lib/repositories/insightsRepository.server";
import {
  createActivityEvent,
  normalizeFeedbackTitleForActivity,
  resolveActorForActivityEvent,
  sessionTitleFromSessionRow,
  truncateActivityCommentPreview,
} from "@/lib/repositories/activityEventsRepository.server";
import { fireAndForget } from "@/lib/server/fireAndForget";
import { dispatchNotifications } from "@/lib/server/notificationFanOut.server";

/** Thrown when the feedback doc is missing (e.g. hard-deleted); map to HTTP 404 in API routes. */
export const ADD_COMMENT_FEEDBACK_MISSING = "ADD_COMMENT_FEEDBACK_MISSING";

/** Thrown when a clientId collides with an existing comment doc; map to HTTP 409 (duplicate POST retry). */
export const ADD_COMMENT_DUPLICATE_ID = "ADD_COMMENT_DUPLICATE_ID";

const CLIENT_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

const COMMENT_QUERY_BY_FEEDBACK_CHUNK = 500;

/** All comment docs for a ticket (paginated); used when hard-deleting feedback. */
export async function getCommentSnapshotsByFeedbackIdRepo(
  workspaceId: string,
  feedbackId: string
): Promise<FirebaseFirestore.QueryDocumentSnapshot[]> {
  const wid = workspaceId.trim();
  const fid = feedbackId.trim();
  if (!wid || !fid) return [];
  const out: FirebaseFirestore.QueryDocumentSnapshot[] = [];
  let cursor: FirebaseFirestore.QueryDocumentSnapshot | undefined;
  for (;;) {
    let q: FirebaseFirestore.Query = adminDb
      .collection("comments")
      .where("workspaceId", "==", wid)
      .where("feedbackId", "==", fid)
      .orderBy(FieldPath.documentId())
      .limit(COMMENT_QUERY_BY_FEEDBACK_CHUNK);
    if (cursor) q = q.startAfter(cursor);
    const snap = await q.get();
    if (snap.empty) break;
    const docs = snap.docs as FirebaseFirestore.QueryDocumentSnapshot[];
    out.push(...docs);
    if (docs.length < COMMENT_QUERY_BY_FEEDBACK_CHUNK) break;
    cursor = docs[docs.length - 1];
  }
  return out;
}

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

export interface AddCommentData {
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  type?: "pin" | "text" | "general";
  position?: CommentPosition;
  textRange?: CommentTextRange;
  threadId?: string | null;
  attachment?: CommentAttachment;
  attachments?: CommentAttachment[];
  mentionedUserIds?: string[];
}

export async function addCommentRepo(
  userId: string,
  sessionId: string,
  feedbackId: string,
  data: AddCommentData,
  clientId?: string
): Promise<string> {
  const resolvedUserId = requireUserId(userId, "addCommentRepo");
  const session = await getSessionByIdRepo(sessionId);
  const workspaceId =
    typeof session?.workspaceId === "string" ? session.workspaceId.trim() : "";
  if (!workspaceId) {
    throw new Error("Missing workspaceId on session");
  }
  const feedbackRef = adminDb.doc(`feedback/${feedbackId}`);
  const feedbackSnap = await feedbackRef.get();
  if (!feedbackSnap.exists) {
    throw new Error(ADD_COMMENT_FEEDBACK_MISSING);
  }
  const feedbackData = (feedbackSnap.data() ?? {}) as Record<string, unknown>;
  const filteredMentionedUserIds = (data.mentionedUserIds ?? []).filter(
    (id) => typeof id === "string" && id.trim() !== "" && id !== resolvedUserId
  );
  const payload: Record<string, unknown> = {
    userId: resolvedUserId,
    workspaceId,
    sessionId,
    feedbackId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    message: data.message,
    createdAt: FieldValue.serverTimestamp(),
  };
  if (data.type != null) payload.type = data.type;
  if (data.position != null) payload.position = data.position;
  if (data.textRange != null) payload.textRange = data.textRange;
  if (data.threadId != null) payload.threadId = data.threadId;
  if (data.attachment != null) payload.attachment = data.attachment;
  if (data.attachments != null && data.attachments.length > 0) payload.attachments = data.attachments;
  if (filteredMentionedUserIds.length > 0) payload.mentionedUserIds = filteredMentionedUserIds;

  const trimmedClientId = typeof clientId === "string" ? clientId.trim() : "";
  const useClientId = trimmedClientId !== "" && CLIENT_ID_RE.test(trimmedClientId);
  const commentRef = useClientId
    ? adminDb.collection("comments").doc(trimmedClientId)
    : adminDb.collection("comments").doc();
  if (useClientId) {
    const existing = await commentRef.get();
    if (existing.exists) {
      throw new Error(ADD_COMMENT_DUPLICATE_ID);
    }
  }
  const sessionRef = adminDb.doc(`sessions/${sessionId}`);
  const workspaceRef = adminDb.doc(`workspaces/${workspaceId}`);
  const preview = data.message.trim().slice(0, 120);

  const batch = adminDb.batch();
  if (useClientId) {
    batch.create(commentRef, payload);
  } else {
    batch.set(commentRef, payload);
  }
  batch.update(sessionRef, {
    commentCount: FieldValue.increment(1),
  });
  batch.update(feedbackRef, {
    commentCount: FieldValue.increment(1),
    lastCommentPreview: preview || null,
    lastCommentAt: FieldValue.serverTimestamp(),
    // Phase 25.1: denormalize the LAST ACTOR so the realtime discussion
    // inbox can show who most recently commented (not the creator). The
    // avatar is resolved live by uid at render time, so only the uid +
    // name are stored here.
    lastCommentByUid: resolvedUserId,
    lastCommentByName: data.userName,
    ...(filteredMentionedUserIds.length > 0
      ? { mentionedUserIds: FieldValue.arrayUnion(...filteredMentionedUserIds) }
      : {}),
  });
  batch.update(workspaceRef, {
    "stats.totalComments": FieldValue.increment(1),
    "stats.updatedAt": FieldValue.serverTimestamp(),
  });
  await batch.commit();

  const actor = await resolveActorForActivityEvent(resolvedUserId);
  const sessionTitle = sessionTitleFromSessionRow(session);
  const feedbackTitle = normalizeFeedbackTitleForActivity(feedbackData.title);
  const commentPreview = truncateActivityCommentPreview(data.message, 80);

  await createActivityEvent({
    workspaceId,
    sessionId,
    eventType: "comment.added",
    actorId: resolvedUserId,
    actorName: actor.actorName,
    actorPhotoURL: actor.actorPhotoURL,
    feedbackId,
    commentId: commentRef.id,
    metadata: {
      feedbackTitle,
      sessionTitle,
      commentPreview,
      ...(filteredMentionedUserIds.length > 0
        ? { mentionedUserIds: filteredMentionedUserIds }
        : {}),
    },
  });

  fireAndForget("notification:comment", async () => {
    const notifActor = {
      id: resolvedUserId,
      name: actor.actorName,
      photoURL: actor.actorPhotoURL ?? null,
    };
    const titleLabel = feedbackTitle || "a ticket";
    const previewBody = commentPreview || null;

    const feedbackCreatorId =
      typeof feedbackData.userId === "string" ? feedbackData.userId : "";
    const feedbackAssigneeId =
      typeof feedbackData.assigneeId === "string"
        ? feedbackData.assigneeId
        : "";
    const mentionedIds = filteredMentionedUserIds;

    const commentRecipientSet = new Set<string>();
    if (feedbackCreatorId && feedbackCreatorId !== resolvedUserId) {
      commentRecipientSet.add(feedbackCreatorId);
    }
    if (feedbackAssigneeId && feedbackAssigneeId !== resolvedUserId) {
      commentRecipientSet.add(feedbackAssigneeId);
    }
    for (const mid of mentionedIds) commentRecipientSet.delete(mid);
    const commentRecipients = Array.from(commentRecipientSet);

    if (commentRecipients.length > 0) {
      await dispatchNotifications({
        recipientIds: commentRecipients,
        workspaceId,
        sessionId,
        sessionTitle: sessionTitle || null,
        feedbackId,
        commentId: commentRef.id,
        type: "comment.added",
        actor: notifActor,
        title: `${actor.actorName} commented on "${titleLabel}"`,
        entityTitle: titleLabel || null,
        body: previewBody,
      });
    }

    const mentionRecipients = mentionedIds.filter(
      (id) => id !== resolvedUserId
    );
    if (mentionRecipients.length > 0) {
      await dispatchNotifications({
        recipientIds: mentionRecipients,
        workspaceId,
        sessionId,
        sessionTitle: sessionTitle || null,
        feedbackId,
        commentId: commentRef.id,
        type: "comment.mention",
        actor: notifActor,
        title: `${actor.actorName} mentioned you on "${titleLabel}"`,
        entityTitle: titleLabel || null,
        body: previewBody,
      });
    }

    // DIGEST CUTOVER: instant comment/mention emails were removed here. The
    // in-app notifications above (comment.added / comment.mention) are the
    // source of truth; the daily activity-digest cron sweeps un-digested
    // notifications into one sectioned email per user. Do NOT re-add inline
    // notification-category sends — the digest is the only such email path now.
  });

  fireAndForget("addCommentRepo-sessionUpdatedAt", () =>
    updateSessionUpdatedAtRepo(sessionId)
  );
  try {
    await incrementInsightsOnCommentCreateRepo({ workspaceId });
    console.log("\u2705 INSIGHTS SYNC SUCCESS");
  } catch (e) {
    console.error("\u274c INSIGHTS SYNC FAILED", e);
  }

  return commentRef.id;
}

export interface UpdateCommentData {
  message?: string;
  resolved?: boolean;
  position?: CommentPosition;
}

export async function updateCommentRepo(
  commentId: string,
  data: UpdateCommentData
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.message !== undefined) payload.message = data.message;
  if (data.resolved !== undefined) payload.resolved = data.resolved;
  if (data.position !== undefined) payload.position = data.position;
  if (Object.keys(payload).length === 0) return;
  await adminDb.doc(`comments/${commentId}`).update(payload);
}

export async function deleteCommentRepo(commentId: string): Promise<void> {
  const commentRef = adminDb.doc(`comments/${commentId}`);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(commentRef);
    if (!snap.exists) return;
    const data = snap.data() ?? {};
    const workspaceId =
      typeof (data as { workspaceId?: unknown }).workspaceId === "string"
        ? String((data as { workspaceId: string }).workspaceId).trim()
        : "";
    const sessionId =
      typeof (data as { sessionId?: unknown }).sessionId === "string"
        ? String((data as { sessionId: string }).sessionId).trim()
        : "";
    const feedbackId =
      typeof (data as { feedbackId?: unknown }).feedbackId === "string"
        ? String((data as { feedbackId: string }).feedbackId).trim()
        : "";
    if (!workspaceId) {
      throw new Error("Missing workspaceId on comment");
    }
    if (!sessionId) {
      throw new Error("Missing sessionId on comment");
    }
    if (!feedbackId) {
      throw new Error("Missing feedbackId on comment");
    }

    const sessionRef = adminDb.doc(`sessions/${sessionId}`);
    const feedbackRef = adminDb.doc(`feedback/${feedbackId}`);
    const workspaceRef = adminDb.doc(`workspaces/${workspaceId}`);

    const [sessionSnap, feedbackSnap, workspaceSnap] = await Promise.all([
      tx.get(sessionRef),
      tx.get(feedbackRef),
      tx.get(workspaceRef),
    ]);

    const sessionRow = sessionSnap.data() ?? {};
    const feedbackRow = feedbackSnap.data() ?? {};
    const stats = (workspaceSnap.data()?.stats ?? {}) as Record<string, unknown>;
    const nextSessionCc = Math.max(0, num((sessionRow as { commentCount?: unknown }).commentCount) - 1);
    const nextFeedbackCc = Math.max(0, num((feedbackRow as { commentCount?: unknown }).commentCount) - 1);
    const nextWorkspaceComments = Math.max(0, num(stats.totalComments) - 1);

    tx.delete(commentRef);
    tx.update(sessionRef, {
      commentCount: nextSessionCc,
    });
    if (feedbackSnap.exists) {
      tx.update(feedbackRef, {
        commentCount: nextFeedbackCc,
      });
    }
    tx.update(workspaceRef, {
      "stats.totalComments": nextWorkspaceComments,
      "stats.updatedAt": FieldValue.serverTimestamp(),
    });
  });
}

export async function getCommentByIdRepo(
  commentId: string
): Promise<Record<string, unknown> | null> {
  const snap = await adminDb.doc(`comments/${commentId}`).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() ?? {}) };
}

/** Recent comments in a session (newest first). Composite index: comments (workspaceId+sessionId, createdAt DESC). */
export async function listRecentCommentsForSessionRepo(
  workspaceId: string,
  sessionId: string,
  max: number
): Promise<Array<Record<string, unknown> & { id: string }>> {
  const wid = workspaceId.trim();
  const sid = sessionId.trim();
  if (!wid || !sid) return [];
  assertQueryLimit(max, "listRecentCommentsForSessionRepo");
  const snap = await adminDb
    .collection("comments")
    .where("workspaceId", "==", wid)
    .where("sessionId", "==", sid)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() ?? {}) }));
}

/** Default page size for GET /api/comments/:sessionId. */
export const LIST_SESSION_COMMENTS_PAGE_DEFAULT = 50;

/** Hard cap per request (cost protection). */
const LIST_SESSION_COMMENTS_PAGE_MAX = 100;

export type ListCommentsForSessionOptions = {
  /** Max docs to return (clamped). Default {@link LIST_SESSION_COMMENTS_PAGE_DEFAULT}. */
  limit?: number;
  /**
   * Pagination: Firestore comment id — return the next page (older) after this document.
   * Must belong to the same workspace, session, and feedback scope as the query.
   */
  cursorCommentId?: string;
};

async function getValidatedCommentCursorSnapshot(
  cursorId: string,
  wid: string,
  sid: string,
  fid: string
): Promise<FirebaseFirestore.DocumentSnapshot> {
  const id = cursorId.trim();
  if (!id) {
    throw new Error("INVALID_CURSOR");
  }
  const snap = await adminDb.doc(`comments/${id}`).get();
  if (!snap.exists) {
    throw new Error("INVALID_CURSOR");
  }
  const d = snap.data() ?? {};
  const rowWid = typeof d.workspaceId === "string" ? d.workspaceId.trim() : "";
  const rowSid = typeof d.sessionId === "string" ? d.sessionId.trim() : "";
  const rowFid = typeof d.feedbackId === "string" ? d.feedbackId.trim() : "";
  if (rowWid !== wid || rowSid !== sid || (fid !== "" && rowFid !== fid)) {
    throw new Error("INVALID_CURSOR");
  }
  return snap;
}

/**
 * Comments in a session, oldest first (matches former client listener ordering).
 * Uses workspaceId+sessionId+createdAt DESC index; results reversed in memory.
 */
export async function listCommentsForSessionChronologicalRepo(
  workspaceId: string,
  sessionId: string,
  feedbackId?: string,
  options?: ListCommentsForSessionOptions
): Promise<Array<Record<string, unknown> & { id: string }>> {
  const wid = workspaceId.trim();
  const sid = sessionId.trim();
  if (!wid || !sid) return [];
  const fid = typeof feedbackId === "string" ? feedbackId.trim() : "";
  const rawLimit =
    typeof options?.limit === "number" && Number.isFinite(options.limit)
      ? Math.floor(options.limit)
      : LIST_SESSION_COMMENTS_PAGE_DEFAULT;
  const take = Math.min(
    LIST_SESSION_COMMENTS_PAGE_MAX,
    Math.max(1, rawLimit)
  );
  assertQueryLimit(take, "listCommentsForSessionChronologicalRepo");

  let query: FirebaseFirestore.Query = adminDb
    .collection("comments")
    .where("workspaceId", "==", wid)
    .where("sessionId", "==", sid);
  if (fid) {
    query = query.where("feedbackId", "==", fid);
  }
  query = query.orderBy("createdAt", "desc");

  const cursorRaw =
    typeof options?.cursorCommentId === "string"
      ? options.cursorCommentId.trim()
      : "";
  if (cursorRaw) {
    const cursorSnap = await getValidatedCommentCursorSnapshot(
      cursorRaw,
      wid,
      sid,
      fid
    );
    query = query.startAfter(cursorSnap);
  }

  query = query.limit(take);
  const snap = await query.get();
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() ?? {}) }));
  rows.reverse();
  return rows;
}

/**
 * Server-only subset of comments repository.
 * Use this from API routes / other server repositories.
 */

const DELETE_SESSION_COMMENTS_LIMIT = 500;

/**
 * Deletes all comments for a session. Used when deleting a session.
 * Returns the number of docs deleted so callers can update workspace.stats.
 */
export async function deleteAllCommentsForSessionRepo(
  workspaceId: string,
  sessionId: string
): Promise<number> {
  const wid = workspaceId.trim();
  const sid = sessionId.trim();
  if (!wid || !sid) return 0;
  const snapshot = await adminDb
    .collection("comments")
    .where("workspaceId", "==", wid)
    .where("sessionId", "==", sid)
    .limit(DELETE_SESSION_COMMENTS_LIMIT)
    .get();
  const count = snapshot.docs.length;
  await Promise.all(snapshot.docs.map((d) => d.ref.delete()));
  return count;
}

