"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import {
  addComment,
  updatePinPosition,
  updateComment,
  deleteComment,
  createOptimisticComment,
  type Comment,
  type OptimisticComment,
  type AddCommentOptions,
} from "@/lib/comments";
import type { CommentPosition, CommentTextRange } from "@/lib/domain/comment";
import { listenToCommentsRepo } from "@/lib/repositories/commentsRepository";
import { authFetch } from "@/lib/authFetch";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { useWorkspace } from "@/lib/client/workspaceContext";

type LocalComment = Comment | OptimisticComment;

function isTempComment(comment: LocalComment): comment is OptimisticComment {
  return "isOptimistic" in comment && comment.isOptimistic === true;
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

function sameCommentPayload(optimistic: OptimisticComment, incoming: Comment): boolean {
  if (optimistic.id === incoming.id) return true;
  if ((incoming.id || "").startsWith("temp_")) return false;
  if ((optimistic.message || "").trim() !== (incoming.message || "").trim()) return false;
  if (optimistic.userId !== incoming.userId) return false;
  if ((optimistic.threadId ?? null) !== (incoming.threadId ?? null)) return false;
  if ((optimistic.type ?? "general") !== (incoming.type ?? "general")) return false;

  const incomingMs = readCommentTimeMs(incoming);
  if (incomingMs == null) return true;
  return Math.abs(incomingMs - optimistic.optimisticCreatedAtMs) <= 30_000;
}

function mergeRealtimeComments(prev: LocalComment[], incoming: Comment[]): LocalComment[] {
  const incomingNonTemp = incoming.filter((c) => !(c.id || "").startsWith("temp_"));
  const optimisticPending = prev
    .filter(isTempComment)
    .filter((opt) => !incomingNonTemp.some((real) => sameCommentPayload(opt, real)));
  return [...incomingNonTemp, ...optimisticPending];
}

/**
 * Controlled realtime comment list: exactly ONE onSnapshot listener at a time.
 * When selectedFeedbackId changes we unsubscribe the previous listener, then
 * subscribe to the new feedback's comments. Cleanup on unmount prevents leaks.
 */
export function useFeedbackDetailController(args: {
  sessionId: string;
  feedbackId: string | null | undefined;
  /** When absent, realtime comments and API resolve are skipped (e.g. after logout). */
  authUserId?: string | null;
  canComment?: boolean;
  canResolve?: boolean;
}) {
  const {
    sessionId,
    feedbackId,
    authUserId,
    canComment = true,
    canResolve = true,
  } = args;
  const { showToast } = useToast();
  const { workspaceId, claimsReady } = useWorkspace();

  const [comments, setComments] = useState<LocalComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!claimsReady || !authUserId || !workspaceId) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setComments([]);
      setLoadingComments(false);
      return;
    }

    if (!feedbackId) {
      const t = requestAnimationFrame(() => {
        setComments([]);
        setLoadingComments(false);
      });
      return () => cancelAnimationFrame(t);
    }

    // Prevent multiple listeners: tear down previous before subscribing.
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    let cancelled = false;
    const t = requestAnimationFrame(() => setLoadingComments(true));

    const unsubscribe = listenToCommentsRepo(
      workspaceId,
      sessionId,
      feedbackId,
      (incomingComments) => {
        if (cancelled) return;
        setComments((prev) => mergeRealtimeComments(prev, incomingComments));
        setLoadingComments(false);
      }
    );
    unsubscribeRef.current = unsubscribe;

    return () => {
      cancelAnimationFrame(t);
      cancelled = true;
      unsubscribe();
      unsubscribeRef.current = null;
    };
  }, [claimsReady, workspaceId, sessionId, feedbackId, authUserId]);

  const sendComment = async (message: string): Promise<void> => {
    const user = auth.currentUser;
    if (!canComment || !user || !feedbackId) return;
    const trimmed = message.trim();
    if (!trimmed) return;
    const payload: AddCommentOptions = {
      userId: user.uid,
      userName: user.displayName || "User",
      userAvatar: user.photoURL || "",
      message: trimmed,
    };
    const optimistic = createOptimisticComment({
      sessionId,
      feedbackId,
      data: payload,
    });
    setComments((prev) => [...prev, optimistic]);
    try {
      await addComment(sessionId, feedbackId, payload);
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
    } catch (err) {
      console.error("[ECHLY] addComment failed", err);
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      showToast("Failed to send comment");
    }
  };

  const sendReply = async (threadId: string, message: string): Promise<void> => {
    const user = auth.currentUser;
    if (!canComment || !user || !feedbackId) return;
    const trimmed = message.trim();
    if (!trimmed) return;
    const payload: AddCommentOptions = {
      userId: user.uid,
      userName: user.displayName || "User",
      userAvatar: user.photoURL || "",
      message: trimmed,
      threadId,
    };
    const optimistic = createOptimisticComment({
      sessionId,
      feedbackId,
      data: payload,
    });
    setComments((prev) => [...prev, optimistic]);
    try {
      await addComment(sessionId, feedbackId, payload);
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
    } catch (err) {
      console.error("[ECHLY] addComment reply failed", err);
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      showToast("Failed to send reply");
    }
  };

  const sendPinComment = async (
    position: CommentPosition,
    message: string
  ): Promise<string | null> => {
    const user = auth.currentUser;
    if (!canComment || !user || !feedbackId) return null;
    const trimmed = message.trim();
    if (!trimmed) return null;
    try {
      const id = await addComment(sessionId, feedbackId, {
        userId: user.uid,
        userName: user.displayName || "User",
        userAvatar: user.photoURL || "",
        message: trimmed,
        type: "pin",
        position,
      });
      return id;
    } catch (err) {
      console.error("[ECHLY] sendPinComment failed", err);
      return null;
    }
  };

  const sendTextComment = async (
    textRange: CommentTextRange,
    message: string
  ): Promise<string | null> => {
    const user = auth.currentUser;
    if (!canComment || !user || !feedbackId) return null;
    const trimmed = message.trim();
    if (!trimmed) return null;
    try {
      const id = await addComment(sessionId, feedbackId, {
        userId: user.uid,
        userName: user.displayName || "User",
        userAvatar: user.photoURL || "",
        message: trimmed,
        type: "text",
        textRange,
      });
      return id;
    } catch (err) {
      console.error("[ECHLY] sendTextComment failed", err);
      return null;
    }
  };

  const resolve = async () => {
    if (!canResolve || !feedbackId) return;
    const res = await authFetch(`/api/tickets/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isResolved: true }),
    });
    if (!res) return;
    if (!res.ok) {
      console.error("[ECHLY] resolve via API failed", await res.text().catch(() => ""));
    }
  };

  const updatePinPositionHandler = async (
    commentId: string,
    position: { xPercent: number; yPercent: number }
  ) => {
    if (!canComment) return;
    await updatePinPosition(commentId, position);
  };

  const updateCommentHandler = async (
    commentId: string,
    data: { message?: string; resolved?: boolean }
  ) => {
    if (data.resolved !== undefined && !canResolve) return;
    if (data.message !== undefined && !canComment) return;
    await updateComment(commentId, data);
  };

  const deleteCommentHandler = async (commentId: string) => {
    if (!canComment) return;
    await deleteComment(commentId);
  };

  return {
    comments: comments as Comment[],
    loadingComments,
    sendComment,
    sendReply,
    sendPinComment,
    sendTextComment,
    resolve,
    updatePinPosition: updatePinPositionHandler,
    updateComment: updateCommentHandler,
    deleteComment: deleteCommentHandler,
  };
}

