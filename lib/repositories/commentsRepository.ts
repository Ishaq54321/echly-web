import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Comment, CommentAttachment, CommentPosition, CommentTextRange } from "@/lib/domain/comment";

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

/** Max comments per feedback thread (cost protection). */
const COMMENTS_QUERY_LIMIT = 100;

/**
 * Single realtime listener for comments of one feedback item.
 * Cost protection: limit(COMMENTS_QUERY_LIMIT). Caller must unsubscribe when
 * switching feedback or unmounting to avoid stacking listeners.
 */
export function listenToCommentsRepo(
  workspaceId: string,
  sessionId: string,
  feedbackId: string,
  callback: (comments: Comment[]) => void
): Unsubscribe {
  const wid = typeof workspaceId === "string" ? workspaceId.trim() : "";
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  const fid = typeof feedbackId === "string" ? feedbackId.trim() : "";
  if (!wid) {
    throw new Error("workspaceId required");
  }
  if (!sid) {
    throw new Error("sessionId required");
  }
  if (!fid) {
    throw new Error("feedbackId required");
  }
  assertQueryLimit(COMMENTS_QUERY_LIMIT, "listenToCommentsRepo");
  const q = query(
    collection(db, "comments"),
    where("workspaceId", "==", wid),
    where("sessionId", "==", sid),
    where("feedbackId", "==", fid),
    orderBy("createdAt", "asc"),
    limit(COMMENTS_QUERY_LIMIT)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: Comment[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Comment, "id">),
      }));
      callback(comments);
    },
    (error) => {
      console.error("COMMENTS LISTENER ERROR", error);
    }
  );
}

const RECENT_ACTIVITY_LIMIT = 10;

/**
 * Fetches most recent comments for a session (for overview activity feed).
 * Composite index: comments (workspaceId+sessionId+createdAt DESC).
 */
export async function getSessionRecentCommentsRepo(
  workspaceId: string,
  sessionId: string,
  max: number = RECENT_ACTIVITY_LIMIT
): Promise<Comment[]> {
  const wid = typeof workspaceId === "string" ? workspaceId.trim() : "";
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!wid) {
    throw new Error("workspaceId required");
  }
  if (!sid) {
    throw new Error("sessionId required");
  }
  assertQueryLimit(max, "getSessionRecentCommentsRepo");
  const q = query(
    collection(db, "comments"),
    where("workspaceId", "==", wid),
    where("sessionId", "==", sid),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Comment, "id">),
  }));
}

export interface UpdateCommentData {
  message?: string;
  resolved?: boolean;
}

