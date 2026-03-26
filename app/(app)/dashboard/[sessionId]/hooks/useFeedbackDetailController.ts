"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { addComment, updatePinPosition, updateComment, deleteComment, type Comment } from "@/lib/comments";
import type { CommentPosition, CommentTextRange } from "@/lib/domain/comment";
import { listenToCommentsRepo } from "@/lib/repositories/commentsRepository";
import { authFetch } from "@/lib/authFetch";

/**
 * Controlled realtime comment list: exactly ONE onSnapshot listener at a time.
 * When selectedFeedbackId changes we unsubscribe the previous listener, then
 * subscribe to the new feedback's comments. Cleanup on unmount prevents leaks.
 */
export function useFeedbackDetailController(args: {
  sessionId: string;
  workspaceId: string | null | undefined;
  feedbackId: string | null | undefined;
  canComment?: boolean;
  canResolve?: boolean;
}) {
  const { sessionId, workspaceId, feedbackId, canComment = true, canResolve = true } = args;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
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
      sessionId,
      feedbackId,
      (incomingComments) => {
        if (cancelled) return;
        setComments([...incomingComments]);
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
  }, [sessionId, feedbackId]);

  const sendComment = async (message: string): Promise<void> => {
    const user = auth.currentUser;
    if (!canComment || !user || !feedbackId || !workspaceId) return;
    const trimmed = message.trim();
    if (!trimmed) return;
    const payload = {
      userId: user.uid,
      userName: user.displayName || "User",
      userAvatar: user.photoURL || "",
      message: trimmed,
    };
    addComment(workspaceId, sessionId, feedbackId, payload).catch((err) =>
      console.error("[ECHLY] addComment failed", err)
    );
  };

  const sendReply = async (threadId: string, message: string): Promise<void> => {
    const user = auth.currentUser;
    if (!canComment || !user || !feedbackId || !workspaceId) return;
    const trimmed = message.trim();
    if (!trimmed) return;
    addComment(workspaceId, sessionId, feedbackId, {
      userId: user.uid,
      userName: user.displayName || "User",
      userAvatar: user.photoURL || "",
      message: trimmed,
      threadId,
    }).catch((err) => console.error("[ECHLY] addComment reply failed", err));
  };

  const sendPinComment = async (
    position: CommentPosition,
    message: string
  ): Promise<string | null> => {
    const user = auth.currentUser;
    if (!canComment || !user || !feedbackId || !workspaceId) return null;
    const trimmed = message.trim();
    if (!trimmed) return null;
    try {
      const id = await addComment(workspaceId, sessionId, feedbackId, {
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
    if (!canComment || !user || !feedbackId || !workspaceId) return null;
    const trimmed = message.trim();
    if (!trimmed) return null;
    try {
      const id = await addComment(workspaceId, sessionId, feedbackId, {
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
    comments,
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

