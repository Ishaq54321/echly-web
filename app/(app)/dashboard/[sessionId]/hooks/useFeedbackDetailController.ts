"use client";

import { useEffect, useState } from "react";
import {
  addComment,
  updatePinPosition,
  updateComment,
  deleteComment,
  createOptimisticComment,
  isOptimisticLocalComment,
  mergeRealtimeCommentsWithOptimistic,
  type Comment,
  type LocalComment,
  type AddCommentOptions,
} from "@/lib/comments";
import type { CommentPosition, CommentTextRange } from "@/lib/domain/comment";
import { useToast } from "@/components/dashboard/context/ToastContext";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { useCommentsRepoSubscription } from "@/lib/hooks/useCommentsRepoSubscription";

/**
 * Controlled realtime comment list: one `listenToCommentsRepo` subscription at a time
 * (see `useCommentsRepoSubscription`). Cleanup on unmount / feedback change prevents leaks.
 */
export function useFeedbackDetailController(args: {
  sessionId: string;
  feedbackId: string | null | undefined;
  canComment?: boolean;
  canResolve?: boolean;
}) {
  const {
    sessionId,
    feedbackId,
    canComment = true,
    canResolve = true,
  } = args;
  const { showToast } = useToast();
  const { workspaceId, authUid, authDisplayName, authPhotoUrl, isIdentityResolved } =
    useWorkspace();

  const [comments, setComments] = useState<LocalComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (!authUid || !workspaceId) {
      setComments([]);
      setLoadingComments(false);
    }
  }, [workspaceId, authUid]);

  useEffect(() => {
    if (!feedbackId) {
      const t = requestAnimationFrame(() => {
        setComments([]);
        setLoadingComments(false);
      });
      return () => cancelAnimationFrame(t);
    }
  }, [feedbackId]);

  useEffect(() => {
    if (!sessionId || !feedbackId) return;
    setComments([]);
    setLoadingComments(true);
  }, [sessionId, feedbackId]);

  useCommentsRepoSubscription({
    workspaceId,
    sessionId,
    feedbackId,
    enabled: Boolean(authUid),
    onComments: (incomingComments) => {
      setComments((prev) =>
        mergeRealtimeCommentsWithOptimistic(prev, incomingComments)
      );
      setLoadingComments(false);
    },
  });

  const sendComment = async (message: string): Promise<void> => {
    if (!canComment || !authUid || !feedbackId) return;
    assertIdentityResolved(isIdentityResolved);
    const trimmed = message.trim();
    if (!trimmed) return;
    const payload: AddCommentOptions = {
      userId: authUid,
      userName: authDisplayName || "User",
      userAvatar: authPhotoUrl || "",
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
    } catch (err) {
      console.error("[ECHLY] addComment failed", err);
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      showToast("Failed to send comment");
    }
  };

  const sendReply = async (threadId: string, message: string): Promise<void> => {
    if (!canComment || !authUid || !feedbackId) return;
    assertIdentityResolved(isIdentityResolved);
    const trimmed = message.trim();
    if (!trimmed) return;
    const payload: AddCommentOptions = {
      userId: authUid,
      userName: authDisplayName || "User",
      userAvatar: authPhotoUrl || "",
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
    if (!canComment || !authUid || !feedbackId) return null;
    assertIdentityResolved(isIdentityResolved);
    const trimmed = message.trim();
    if (!trimmed) return null;
    const payload: AddCommentOptions = {
      userId: authUid,
      userName: authDisplayName || "User",
      userAvatar: authPhotoUrl || "",
      message: trimmed,
      type: "pin",
      position,
    };
    const optimistic = createOptimisticComment({
      sessionId,
      feedbackId,
      data: payload,
    });
    setComments((prev) => [...prev, optimistic]);
    try {
      const id = await addComment(sessionId, feedbackId, payload);
      setComments((prev) =>
        prev.map((c) =>
          c.id === optimistic.id && isOptimisticLocalComment(c)
            ? {
                ...c,
                id,
                isOptimistic: true,
                optimisticCreatedAtMs: c.optimisticCreatedAtMs,
              }
            : c
        )
      );
      return id;
    } catch (err) {
      console.error("[ECHLY] sendPinComment failed", err);
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      showToast("Failed to add pin comment");
      return null;
    }
  };

  const sendTextComment = async (
    textRange: CommentTextRange,
    message: string
  ): Promise<string | null> => {
    if (!canComment || !authUid || !feedbackId) return null;
    assertIdentityResolved(isIdentityResolved);
    const trimmed = message.trim();
    if (!trimmed) return null;
    const payload: AddCommentOptions = {
      userId: authUid,
      userName: authDisplayName || "User",
      userAvatar: authPhotoUrl || "",
      message: trimmed,
      type: "text",
      textRange,
    };
    const optimistic = createOptimisticComment({
      sessionId,
      feedbackId,
      data: payload,
    });
    setComments((prev) => [...prev, optimistic]);
    try {
      const id = await addComment(sessionId, feedbackId, payload);
      setComments((prev) =>
        prev.map((c) =>
          c.id === optimistic.id && isOptimisticLocalComment(c)
            ? {
                ...c,
                id,
                isOptimistic: true,
                optimisticCreatedAtMs: c.optimisticCreatedAtMs,
              }
            : c
        )
      );
      return id;
    } catch (err) {
      console.error("[ECHLY] sendTextComment failed", err);
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      showToast("Failed to add comment");
      return null;
    }
  };

  const updatePinPositionHandler = async (
    commentId: string,
    position: { xPercent: number; yPercent: number }
  ) => {
    if (!canComment) return;
    assertIdentityResolved(isIdentityResolved);
    await updatePinPosition(commentId, position);
  };

  const updateCommentHandler = async (
    commentId: string,
    data: { message?: string; resolved?: boolean }
  ) => {
    if (data.resolved !== undefined && !canResolve) return;
    if (data.message !== undefined && !canComment) return;
    assertIdentityResolved(isIdentityResolved);
    let previousResolved: boolean | undefined;
    if (data.resolved !== undefined) {
      setComments((prev) => {
        const target = prev.find((c) => c.id === commentId);
        previousResolved = target ? Boolean(target.resolved) : undefined;
        return prev.map((c) =>
          c.id === commentId ? { ...c, resolved: data.resolved } : c
        );
      });
    }
    try {
      await updateComment(commentId, data);
    } catch (err) {
      console.error("[ECHLY] updateComment failed", err);
      if (data.resolved !== undefined && previousResolved !== undefined) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, resolved: previousResolved } : c
          )
        );
      }
      showToast("Failed to update comment");
    }
  };

  const deleteCommentHandler = async (commentId: string) => {
    if (!canComment) return;
    assertIdentityResolved(isIdentityResolved);
    await deleteComment(commentId);
  };

  return {
    comments: comments as Comment[],
    loadingComments,
    sendComment,
    sendReply,
    sendPinComment,
    sendTextComment,
    updatePinPosition: updatePinPositionHandler,
    updateComment: updateCommentHandler,
    deleteComment: deleteCommentHandler,
  };
}

