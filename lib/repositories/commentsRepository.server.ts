import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { CommentAttachment, CommentPosition, CommentTextRange } from "@/lib/domain/comment";
import {
  getSessionByIdRepo,
  incrementSessionCommentCountRepo,
  updateSessionUpdatedAtRepo,
} from "@/lib/repositories/sessionsRepository.server";
import { incrementFeedbackCommentCountRepo } from "@/lib/repositories/feedbackRepository.server";
import { incrementInsightsOnCommentCreateRepo } from "@/lib/repositories/insightsRepository.server";
import { fireAndForget } from "@/lib/server/fireAndForget";

function requireUserId(userId: string, context: string): string {
  const trimmed = userId.trim();
  if (!trimmed) {
    throw new Error(`Missing userId - invalid state (${context})`);
  }
  return trimmed;
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

  const ref = await adminDb.collection("comments").add(payload);
  await incrementSessionCommentCountRepo(sessionId);
  await incrementFeedbackCommentCountRepo(feedbackId, data.message);

  fireAndForget("addCommentRepo-sessionUpdatedAt", () =>
    updateSessionUpdatedAtRepo(sessionId)
  );
  fireAndForget("addCommentRepo-workspaceStats", () =>
    adminDb.doc(`workspaces/${workspaceId}`).update({
      "stats.totalComments": FieldValue.increment(1),
      "stats.updatedAt": FieldValue.serverTimestamp(),
    })
  );
  fireAndForget("addCommentRepo-insights", () =>
    incrementInsightsOnCommentCreateRepo({ workspaceId })
  );

  return ref.id;
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

    tx.delete(commentRef);
    tx.update(sessionRef, {
      commentCount: FieldValue.increment(-1),
    });
    tx.update(feedbackRef, {
      commentCount: FieldValue.increment(-1),
    });
    tx.update(workspaceRef, {
      "stats.totalComments": FieldValue.increment(-1),
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
  sessionId: string,
  workspaceId: string
): Promise<number> {
  const wid = workspaceId.trim();
  if (!wid) {
    throw new Error("Missing workspaceId");
  }
  const snapshot = await adminDb
    .collection("comments")
    .where("workspaceId", "==", wid)
    .where("sessionId", "==", sessionId)
    .limit(DELETE_SESSION_COMMENTS_LIMIT)
    .get();
  const count = snapshot.docs.length;
  await Promise.all(snapshot.docs.map((d) => d.ref.delete()));
  return count;
}

