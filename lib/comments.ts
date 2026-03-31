// lib/comments.ts

export type { Comment, CommentAttachment, CommentPosition, CommentTextRange, CommentType } from "@/lib/domain/comment";
import type { Comment, CommentAttachment, CommentPosition, CommentTextRange } from "@/lib/domain/comment";
import { authFetch } from "@/lib/authFetch";
import { HttpError } from "@/lib/client/httpError";

function commentFromApiRow(row: unknown): Comment | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : "";
  const sessionId = typeof r.sessionId === "string" ? r.sessionId : "";
  const feedbackId = typeof r.feedbackId === "string" ? r.feedbackId : "";
  const userId = typeof r.userId === "string" ? r.userId : "";
  if (!id || !sessionId || !feedbackId || !userId) return null;

  const createdAtRaw = r.createdAt;
  let createdAt: Comment["createdAt"] = null;
  if (createdAtRaw && typeof createdAtRaw === "object") {
    const t = createdAtRaw as { seconds?: number; nanoseconds?: number };
    if (typeof t.seconds === "number") {
      createdAt = {
        seconds: t.seconds,
        nanoseconds: typeof t.nanoseconds === "number" ? t.nanoseconds : 0,
      } as Comment["createdAt"];
    }
  }

  return {
    id,
    workspaceId: typeof r.workspaceId === "string" ? r.workspaceId : undefined,
    sessionId,
    feedbackId,
    userId,
    userName: typeof r.userName === "string" ? r.userName : "",
    userAvatar: typeof r.userAvatar === "string" ? r.userAvatar : "",
    message: typeof r.message === "string" ? r.message : "",
    createdAt,
    type: r.type === "pin" || r.type === "text" || r.type === "general" ? r.type : undefined,
    position:
      r.position && typeof r.position === "object"
        ? (r.position as Comment["position"])
        : undefined,
    textRange:
      r.textRange && typeof r.textRange === "object"
        ? (r.textRange as Comment["textRange"])
        : undefined,
    threadId:
      r.threadId === null || r.threadId === undefined
        ? undefined
        : typeof r.threadId === "string"
          ? r.threadId
          : undefined,
    resolved: typeof r.resolved === "boolean" ? r.resolved : undefined,
    attachment:
      r.attachment && typeof r.attachment === "object"
        ? (r.attachment as Comment["attachment"])
        : undefined,
  };
}

/**
 * Loads session comments from the API (server-enforced canView). Caller filters by feedbackId if needed.
 */
export async function fetchComments(sessionId: string): Promise<Comment[]> {
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!sid) return [];

  const res = await authFetch(`/api/comments/${encodeURIComponent(sid)}`);
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new HttpError(msg || "Failed to load comments", res.status);
  }
  const json = (await res.json()) as {
    success?: boolean;
    data?: { comments?: unknown[] };
    error?: { message?: string };
  };
  if (!json.success) {
    throw new Error(json.error?.message || "Failed to load comments");
  }
  const rawList = json.data?.comments;
  if (!Array.isArray(rawList)) return [];
  const out: Comment[] = [];
  for (const row of rawList) {
    const c = commentFromApiRow(row);
    if (c) out.push(c);
  }
  return out;
}

export interface AddCommentOptions {
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

export type OptimisticComment = Comment & {
  isOptimistic: true;
  optimisticCreatedAtMs: number;
};

export function createOptimisticComment(args: {
  sessionId: string;
  feedbackId: string;
  data: AddCommentOptions;
}): OptimisticComment {
  const { sessionId, feedbackId, data } = args;
  const optimisticCreatedAtMs = Date.now();
  const tempId = `temp-${optimisticCreatedAtMs}-${Math.random().toString(36).slice(2, 10)}`;
  const optimisticDate = new Date(optimisticCreatedAtMs);

  return {
    id: tempId,
    sessionId,
    feedbackId,
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    message: data.message,
    createdAt: { toDate: () => optimisticDate } as Comment["createdAt"],
    type: data.type ?? "general",
    position: data.position,
    textRange: data.textRange,
    threadId: data.threadId,
    attachment: data.attachment,
    isOptimistic: true,
    optimisticCreatedAtMs,
  };
}

export type LocalComment = Comment | OptimisticComment;

export function isOptimisticLocalComment(c: LocalComment): c is OptimisticComment {
  return "isOptimistic" in c && c.isOptimistic === true;
}

function readCommentTimeMs(comment: Comment): number | null {
  const createdAt = comment.createdAt as unknown;
  if (!createdAt) return null;
  if (
    typeof createdAt === "object" &&
    createdAt != null &&
    "toDate" in (createdAt as { toDate?: unknown }) &&
    typeof (createdAt as { toDate: () => Date }).toDate === "function"
  ) {
    return (createdAt as { toDate: () => Date }).toDate().getTime();
  }
  if (
    typeof createdAt === "object" &&
    createdAt != null &&
    "seconds" in (createdAt as { seconds?: unknown }) &&
    typeof (createdAt as { seconds: number }).seconds === "number"
  ) {
    return (createdAt as { seconds: number }).seconds * 1000;
  }
  return null;
}

/** True while this row is a client-only pending write (optimistic or legacy temp id). */
function isPendingLocalComment(c: LocalComment): boolean {
  if (isOptimisticLocalComment(c)) return true;
  const id = c.id || "";
  return id.startsWith("temp-") || id.startsWith("temp_");
}

export function sameCommentPayload(
  optimistic: Comment | OptimisticComment,
  incoming: Comment
): boolean {
  if (optimistic.id === incoming.id) return true;
  if ((incoming.id || "").startsWith("temp_") || (incoming.id || "").startsWith("temp-")) {
    return false;
  }
  if ((optimistic.message || "").trim() !== (incoming.message || "").trim()) return false;
  if (optimistic.userId !== incoming.userId) return false;
  if ((optimistic.threadId ?? null) !== (incoming.threadId ?? null)) return false;
  if ((optimistic.type ?? "general") !== (incoming.type ?? "general")) return false;

  const incomingMs = readCommentTimeMs(incoming);
  if (incomingMs == null) return true;
  if (isOptimisticLocalComment(optimistic)) {
    return Math.abs(incomingMs - optimistic.optimisticCreatedAtMs) <= 30_000;
  }
  return true;
}

/**
 * Merge server-fetched list with in-flight optimistic rows; pending locals drop once a matching real row appears.
 */
export function mergeRealtimeCommentsWithOptimistic(
  prev: LocalComment[],
  incoming: Comment[]
): LocalComment[] {
  const incomingNonTemp = incoming.filter((c) => {
    const id = c.id || "";
    return !id.startsWith("temp_") && !id.startsWith("temp-");
  });
  const optimisticPending = prev
    .filter(isPendingLocalComment)
    .filter((opt) => !incomingNonTemp.some((real) => sameCommentPayload(opt, real)));
  return [...incomingNonTemp, ...optimisticPending];
}

export async function addComment(
  sessionId: string,
  feedbackId: string,
  data: AddCommentOptions
): Promise<string> {
  const res = await authFetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, feedbackId, data }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new HttpError(msg || "Failed to add comment", res.status);
  }
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message || "Failed to add comment");
  }

  const id = json.data?.id;

  if (!id) {
    throw new Error("Missing comment id");
  }

  return id;
}

export async function updatePinPosition(
  commentId: string,
  position: { xPercent: number; yPercent: number }
): Promise<void> {
  const res = await authFetch("/api/comments", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId, data: { position } }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new HttpError(msg || "Failed to update comment position", res.status);
  }
}

export async function resolveFeedback(feedbackId: string, sessionId?: string) {
  const res = await authFetch(`/api/tickets/${feedbackId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isResolved: true }),
  });
  void sessionId;
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new HttpError(msg || "Failed to resolve feedback", res.status);
  }
}

export interface UpdateCommentData {
  message?: string;
  resolved?: boolean;
}

export async function updateComment(
  commentId: string,
  data: UpdateCommentData
): Promise<void> {
  const res = await authFetch("/api/comments", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId, data }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new HttpError(msg || "Failed to update comment", res.status);
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  const res = await authFetch("/api/comments", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new HttpError(msg || "Failed to delete comment", res.status);
  }
}