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
import { fireAndForget } from "@/lib/server/fireAndForget";

/** Thrown when the feedback doc is missing (e.g. hard-deleted); map to HTTP 404 in API routes. */
export const ADD_COMMENT_FEEDBACK_MISSING = "ADD_COMMENT_FEEDBACK_MISSING";

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
}

export async function addCommentRepo(
  userId: string,
  sessionId: string,
  feedbackId: string,
  data: AddCommentData
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

  const commentRef = adminDb.collection("comments").doc();
  const sessionRef = adminDb.doc(`sessions/${sessionId}`);
  const workspaceRef = adminDb.doc(`workspaces/${workspaceId}`);
  const preview = data.message.trim().slice(0, 120);

  const batch = adminDb.batch();
  batch.set(commentRef, payload);
  batch.update(sessionRef, {
    commentCount: FieldValue.increment(1),
  });
  batch.update(feedbackRef, {
    commentCount: FieldValue.increment(1),
    lastCommentPreview: preview || null,
    lastCommentAt: FieldValue.serverTimestamp(),
  });
  batch.update(workspaceRef, {
    "stats.totalComments": FieldValue.increment(1),
    "stats.updatedAt": FieldValue.serverTimestamp(),
  });
  await batch.commit();

  fireAndForget("addCommentRepo-sessionUpdatedAt", () =>
    updateSessionUpdatedAtRepo(sessionId)
  );
  fireAndForget("addCommentRepo-insights", () =>
    incrementInsightsOnCommentCreateRepo({ workspaceId })
  );

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

/**
 * Server-only subset of comments repository.
 * Use this from API routes / other server repositories.
 *
 * (Client realtime helpers stay in `commentsRepository.ts` for now.)
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

