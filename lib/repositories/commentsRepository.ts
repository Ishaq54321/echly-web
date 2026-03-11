import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Comment, CommentAttachment, CommentPosition, CommentTextRange } from "@/lib/domain/comment";
import {
  incrementSessionCommentCountRepo,
  updateSessionUpdatedAtRepo,
} from "@/lib/repositories/sessionsRepository";
import { incrementFeedbackCommentCountRepo } from "@/lib/repositories/feedbackRepository";

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
  workspaceId: string,
  sessionId: string,
  feedbackId: string,
  data: AddCommentData
): Promise<string> {
  const collectionRef = collection(db, "comments");
  const payload: Record<string, unknown> = {
    workspaceId,
    sessionId,
    feedbackId,
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    message: data.message,
    createdAt: serverTimestamp(),
  };
  if (data.type != null) payload.type = data.type;
  if (data.position != null) payload.position = data.position;
  if (data.textRange != null) payload.textRange = data.textRange;
  if (data.threadId != null) payload.threadId = data.threadId;
  if (data.attachment != null) payload.attachment = data.attachment;

  const ref = await addDoc(collectionRef, payload);
  await incrementSessionCommentCountRepo(sessionId);
  await incrementFeedbackCommentCountRepo(feedbackId, data.message);
  await updateSessionUpdatedAtRepo(sessionId);
  return ref.id;
}

/** Max comments per feedback thread (cost protection). */
const COMMENTS_QUERY_LIMIT = 100;

/**
 * Single realtime listener for comments of one feedback item.
 * Cost protection: limit(COMMENTS_QUERY_LIMIT). Caller must unsubscribe when
 * switching feedback or unmounting to avoid stacking listeners.
 */
export function listenToCommentsRepo(
  sessionId: string,
  feedbackId: string,
  callback: (comments: Comment[]) => void
): Unsubscribe {
  assertQueryLimit(COMMENTS_QUERY_LIMIT, "listenToCommentsRepo");
  const q = query(
    collection(db, "comments"),
    where("sessionId", "==", sessionId),
    where("feedbackId", "==", feedbackId),
    orderBy("createdAt", "asc"),
    limit(COMMENTS_QUERY_LIMIT)
  );

  return onSnapshot(q, (snapshot) => {
    const comments: Comment[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Comment, "id">),
    }));
    callback(comments);
  });
}

const RECENT_ACTIVITY_LIMIT = 10;

/**
 * Fetches most recent comments for a session (for overview activity feed).
 * Composite index: comments (sessionId ASC, createdAt DESC).
 */
export async function getSessionRecentCommentsRepo(
  sessionId: string,
  max: number = RECENT_ACTIVITY_LIMIT
): Promise<Comment[]> {
  assertQueryLimit(max, "getSessionRecentCommentsRepo");
  const q = query(
    collection(db, "comments"),
    where("sessionId", "==", sessionId),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Comment, "id">),
  }));
}

/**
 * Updates a comment's pin position (for drag-to-move).
 */
export async function updateCommentPositionRepo(
  commentId: string,
  position: CommentPosition
): Promise<void> {
  await updateDoc(doc(db, "comments", commentId), { position });
}

export interface UpdateCommentData {
  message?: string;
  resolved?: boolean;
}

/**
 * Updates a comment's message and/or resolved state.
 */
export async function updateCommentRepo(
  commentId: string,
  data: UpdateCommentData
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.message !== undefined) payload.message = data.message;
  if (data.resolved !== undefined) payload.resolved = data.resolved;
  if (Object.keys(payload).length === 0) return;
  await updateDoc(doc(db, "comments", commentId), payload);
}

/**
 * Deletes a single comment by id.
 */
export async function deleteCommentRepo(commentId: string): Promise<void> {
  await deleteDoc(doc(db, "comments", commentId));
}

const DELETE_SESSION_COMMENTS_LIMIT = 500;

/**
 * Deletes all comments for a session. Used when deleting a session.
 */
export async function deleteAllCommentsForSessionRepo(
  sessionId: string
): Promise<void> {
  const q = query(
    collection(db, "comments"),
    where("sessionId", "==", sessionId),
    limit(DELETE_SESSION_COMMENTS_LIMIT)
  );
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
}


