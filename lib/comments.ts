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
    attachments:
      Array.isArray(r.attachments) ? (r.attachments as Comment["attachments"]) : undefined,
    reactions:
      r.reactions && typeof r.reactions === "object"
        ? (r.reactions as Comment["reactions"])
        : undefined,
    mentionedUserIds:
      Array.isArray(r.mentionedUserIds)
        ? (r.mentionedUserIds as string[]).filter((id) => typeof id === "string")
        : undefined,
  };
}

const COMMENTS_FETCH_INFLIGHT = new Map<string, Promise<Comment[]>>();
const COMMENTS_FETCH_FRESH = new Map<string, { exp: number; comments: Comment[] }>();
const COMMENTS_FRESH_TTL_MS = 4_000;

function commentsFetchDedupeKey(
  sid: string,
  feedbackId: string,
  cursor: string,
  force: boolean
): string {
  return [sid, feedbackId, cursor, force ? "1" : "0"].join("\x1f");
}

function parseCommentsApiPayload(json: unknown): Comment[] {
  const j = json as {
    success?: boolean;
    data?: { comments?: unknown[]; hasMore?: boolean };
    error?: { message?: string };
  };
  if (!j.success) {
    throw new Error(j.error?.message || "Failed to load comments");
  }
  const rawList = j.data?.comments;
  if (!Array.isArray(rawList)) return [];
  const out: Comment[] = [];
  for (const row of rawList) {
    const c = commentFromApiRow(row);
    if (c) out.push(c);
  }
  return out;
}

export type FetchCommentsOptions = {
  feedbackId?: string | null | undefined;
  /** Bypass short-lived client cache (manual refresh / after mutations). */
  force?: boolean;
  /** Pagination: pass last page’s oldest comment id (see GET /api/comments `cursor`). */
  cursor?: string | null | undefined;
};

/**
 * Loads session comments from the API (server-enforced canView), optionally scoped by feedbackId.
 * Deduplicates concurrent and near-duplicate requests (same session + feedback + first page).
 */
export async function fetchComments(
  sessionId: string,
  opts?: FetchCommentsOptions
): Promise<Comment[]> {
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!sid) return [];
  const feedbackId =
    typeof opts?.feedbackId === "string" ? opts.feedbackId.trim() : "";
  const force = opts?.force === true;
  const cursor =
    typeof opts?.cursor === "string" && opts.cursor.trim() !== ""
      ? opts.cursor.trim()
      : "";

  if (force && cursor === "") {
    const staleKey = commentsFetchDedupeKey(sid, feedbackId, "", false);
    COMMENTS_FETCH_FRESH.delete(staleKey);
  }

  const dedupeKey = commentsFetchDedupeKey(sid, feedbackId, cursor, force);

  if (!force && cursor === "") {
    const ent = COMMENTS_FETCH_FRESH.get(dedupeKey);
    if (ent && Date.now() < ent.exp) {
      return ent.comments;
    }
  }

  const inflight = COMMENTS_FETCH_INFLIGHT.get(dedupeKey);
  if (inflight) {
    return inflight;
  }

  const p = (async (): Promise<Comment[]> => {
    try {
      const params = new URLSearchParams();
      if (feedbackId) params.set("feedbackId", feedbackId);
      if (cursor) params.set("cursor", cursor);
      const qs = params.toString();
      const query = qs !== "" ? `?${qs}` : "";

      const res = await authFetch(
        `/api/comments/${encodeURIComponent(sid)}${query}`
      );
      if (!res) throw new Error("Not authenticated");
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new HttpError(msg || "Failed to load comments", res.status);
      }
      const json = await res.json();
      const comments = parseCommentsApiPayload(json);
      if (!force && cursor === "") {
        COMMENTS_FETCH_FRESH.set(dedupeKey, {
          exp: Date.now() + COMMENTS_FRESH_TTL_MS,
          comments,
        });
      }
      return comments;
    } finally {
      COMMENTS_FETCH_INFLIGHT.delete(dedupeKey);
    }
  })();

  COMMENTS_FETCH_INFLIGHT.set(dedupeKey, p);
  return p;
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
  attachments?: CommentAttachment[];
  mentionedUserIds?: string[];
}

export type OptimisticComment = Comment & {
  isOptimistic: true;
};

function generateClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function createOptimisticComment(args: {
  sessionId: string;
  feedbackId: string;
  data: AddCommentOptions;
}): OptimisticComment {
  const { sessionId, feedbackId, data } = args;
  const nowMs = Date.now();
  const optimisticDate = new Date(nowMs);

  return {
    id: generateClientId(),
    sessionId,
    feedbackId,
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    message: data.message,
    createdAt: {
      seconds: Math.floor(nowMs / 1000),
      nanoseconds: (nowMs % 1000) * 1_000_000,
      toDate: () => optimisticDate,
    } as Comment["createdAt"],
    type: data.type ?? "general",
    position: data.position,
    textRange: data.textRange,
    threadId: data.threadId,
    attachment: data.attachment,
    attachments: data.attachments,
    mentionedUserIds: data.mentionedUserIds,
    isOptimistic: true,
  };
}

export type LocalComment = Comment | OptimisticComment;

export function isOptimisticLocalComment(c: LocalComment): c is OptimisticComment {
  return "isOptimistic" in c && c.isOptimistic === true;
}

/**
 * Merge server-fetched list with in-flight optimistic rows. Dedupe is id-based:
 * the optimistic row uses the same uuid we send to the server, so when the real
 * doc arrives the listener entry wins automatically.
 */
export function mergeRealtimeCommentsWithOptimistic(
  prev: LocalComment[],
  incoming: Comment[]
): LocalComment[] {
  const incomingIds = new Set(incoming.map((c) => c.id));
  const stillPending = prev.filter(
    (c) => isOptimisticLocalComment(c) && !incomingIds.has(c.id)
  );
  return [...incoming, ...stillPending];
}

export async function addComment(
  sessionId: string,
  feedbackId: string,
  clientId: string,
  data: AddCommentOptions
): Promise<string> {
  const res = await authFetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, feedbackId, clientId, data }),
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

export async function toggleReaction(
  commentId: string,
  emoji: string
): Promise<Record<string, { userIds: string[]; userNames: string[] }>> {
  const res = await authFetch("/api/comments/react", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId, emoji }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new HttpError(msg || "Failed to toggle reaction", res.status);
  }
  const json = await res.json();
  return json.data.reactions;
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