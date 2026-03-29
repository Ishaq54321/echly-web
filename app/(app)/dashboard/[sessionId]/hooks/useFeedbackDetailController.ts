"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { handlePermissionError } from "@/lib/client/permissionError";

type PendingCommentPatch = { message?: string; resolved?: boolean };

/** Root-thread counts for the current feedback (sidebar / tabs). `total` is root count; open + resolved === total. */
export type FeedbackCommentThreadCounts = {
  total: number;
  open: number;
  resolved: number;
};

function threadCountsFromRoots(comments: readonly LocalComment[]): FeedbackCommentThreadCounts {
  const roots = comments.filter((c) => !c.threadId);
  let open = 0;
  let resolved = 0;
  for (const r of roots) {
    if (r.resolved) resolved += 1;
    else open += 1;
  }
  return { total: roots.length, open, resolved };
}

function applyRootResolveDelta(
  counts: FeedbackCommentThreadCounts,
  wasResolved: boolean,
  nextResolved: boolean
): FeedbackCommentThreadCounts {
  if (wasResolved === nextResolved) return counts;
  if (nextResolved) {
    return {
      total: counts.total,
      open: Math.max(0, counts.open - 1),
      resolved: counts.resolved + 1,
    };
  }
  return {
    total: counts.total,
    open: counts.open + 1,
    resolved: Math.max(0, counts.resolved - 1),
  };
}

function applyPendingCommentMutations(
  comments: LocalComment[],
  pendingDeletes: ReadonlySet<string>,
  patches: ReadonlyMap<string, PendingCommentPatch>
): LocalComment[] {
  const out = comments.filter((c) => !pendingDeletes.has(c.id));
  if (patches.size === 0) return out;
  return out.map((c) => {
    const p = patches.get(c.id);
    return p ? { ...c, ...p } : c;
  });
}

/**
 * Controlled realtime comment list: one `listenToCommentsRepo` subscription at a time
 * (see `useCommentsRepoSubscription`). Cleanup on unmount / feedback change prevents leaks.
 */
export function useFeedbackDetailController(args: {
  sessionId: string;
  feedbackId: string | null | undefined;
}) {
  const { sessionId, feedbackId } = args;
  const { showToast } = useToast();
  const { workspaceId, authUid, authDisplayName, authPhotoUrl, isIdentityResolved } =
    useWorkspace();

  const [comments, setComments] = useState<LocalComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  /** Optimistic thread counts; scoped so switching feedback ignores stale rows without an effect reset. */
  const [localCountsOverride, setLocalCountsOverride] = useState<{
    scope: string;
    counts: FeedbackCommentThreadCounts;
  } | null>(null);

  /** Hide until server snapshot omits the id (avoids realtime resurrecting optimistically deleted rows). */
  const pendingDeletedCommentIdsRef = useRef(new Set<string>());
  /** Overlay in-flight PATCH fields until success; merge uses Firestore as base and would otherwise wipe local edits. */
  const pendingCommentPatchesRef = useRef(new Map<string, PendingCommentPatch>());
  const deleteRevertSnapshotRef = useRef<{
    comment: LocalComment;
    index: number;
  } | null>(null);

  const commentThreadCounts = useMemo(
    () => threadCountsFromRoots(comments),
    [comments]
  );

  const feedbackCommentScope =
    sessionId && feedbackId ? `${sessionId}:${feedbackId}` : "";
  const displayCommentThreadCounts =
    localCountsOverride != null &&
    localCountsOverride.scope === feedbackCommentScope
      ? localCountsOverride.counts
      : commentThreadCounts;

  useEffect(() => {
    pendingDeletedCommentIdsRef.current.clear();
    pendingCommentPatchesRef.current.clear();
    deleteRevertSnapshotRef.current = null;
  }, [sessionId, feedbackId]);

  useEffect(() => {
    if (!authUid || !workspaceId) {
      pendingDeletedCommentIdsRef.current.clear();
      pendingCommentPatchesRef.current.clear();
      deleteRevertSnapshotRef.current = null;
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
      setLocalCountsOverride(null);
      const incomingIds = new Set(incomingComments.map((c) => c.id));
      for (const id of [...pendingDeletedCommentIdsRef.current]) {
        if (!incomingIds.has(id)) {
          pendingDeletedCommentIdsRef.current.delete(id);
        }
      }
      setComments((prev) => {
        const merged = mergeRealtimeCommentsWithOptimistic(prev, incomingComments);
        return applyPendingCommentMutations(
          merged,
          pendingDeletedCommentIdsRef.current,
          pendingCommentPatchesRef.current
        );
      });
      setLoadingComments(false);
    },
  });

  const sendComment = async (message: string): Promise<void> => {
    if (!authUid || !feedbackId) return;
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
    void (async () => {
      try {
        await addComment(sessionId, feedbackId, payload);
      } catch (err) {
        console.error("[ECHLY] addComment failed", err);
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        if (!handlePermissionError(err, showToast)) showToast("Failed to send comment");
      }
    })();
  };

  const sendReply = async (threadId: string, message: string): Promise<void> => {
    if (!authUid || !feedbackId) return;
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
    void (async () => {
      try {
        await addComment(sessionId, feedbackId, payload);
      } catch (err) {
        console.error("[ECHLY] addComment reply failed", err);
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        if (!handlePermissionError(err, showToast)) showToast("Failed to send reply");
      }
    })();
  };

  const sendPinComment = async (
    position: CommentPosition,
    message: string
  ): Promise<string | null> => {
    if (!authUid || !feedbackId) return null;
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
    void (async () => {
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
      } catch (err) {
        console.error("[ECHLY] sendPinComment failed", err);
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        if (!handlePermissionError(err, showToast)) showToast("Failed to add pin comment");
      }
    })();
    return optimistic.id;
  };

  const sendTextComment = async (
    textRange: CommentTextRange,
    message: string
  ): Promise<string | null> => {
    if (!authUid || !feedbackId) return null;
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
    void (async () => {
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
      } catch (err) {
        console.error("[ECHLY] sendTextComment failed", err);
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        if (!handlePermissionError(err, showToast)) showToast("Failed to add comment");
      }
    })();
    return optimistic.id;
  };

  const updatePinPositionHandler = async (
    commentId: string,
    position: { xPercent: number; yPercent: number }
  ) => {
    assertIdentityResolved(isIdentityResolved);
    try {
      await updatePinPosition(commentId, position);
    } catch (err) {
      console.error("[ECHLY] updatePinPosition failed", err);
      if (!handlePermissionError(err, showToast)) showToast("Failed to move pin");
    }
  };

  const updateCommentHandler = async (
    commentId: string,
    data: { message?: string; resolved?: boolean }
  ) => {
    assertIdentityResolved(isIdentityResolved);
    const trimmedMessage =
      typeof data.message === "string" ? data.message.trim() : undefined;
    const payload: { message?: string; resolved?: boolean } = {
      ...(trimmedMessage !== undefined ? { message: trimmedMessage } : {}),
      ...(data.resolved !== undefined ? { resolved: data.resolved } : {}),
    };
    if (
      trimmedMessage === undefined &&
      data.resolved === undefined
    ) {
      return;
    }

    let previousMessage: string | undefined;
    let previousResolved: boolean | undefined;
    let found = false;
    let threadCountsOverride: FeedbackCommentThreadCounts | null = null;

    setComments((prev) => {
      const target = prev.find((c) => c.id === commentId);
      if (!target) {
        return prev;
      }
      found = true;
      if (trimmedMessage !== undefined) previousMessage = target.message;
      if (data.resolved !== undefined) previousResolved = Boolean(target.resolved);
      const isRoot = target.threadId == null || target.threadId === "";
      if (isRoot && data.resolved !== undefined) {
        const before = threadCountsFromRoots(prev);
        threadCountsOverride = applyRootResolveDelta(
          before,
          Boolean(target.resolved),
          data.resolved
        );
      }
      const prevPatch = pendingCommentPatchesRef.current.get(commentId) ?? {};
      pendingCommentPatchesRef.current.set(commentId, {
        ...prevPatch,
        ...(trimmedMessage !== undefined ? { message: trimmedMessage } : {}),
        ...(data.resolved !== undefined ? { resolved: data.resolved } : {}),
      });
      return prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              ...(trimmedMessage !== undefined ? { message: trimmedMessage } : {}),
              ...(data.resolved !== undefined ? { resolved: data.resolved } : {}),
            }
          : c
      );
    });

    if (!found) {
      return;
    }

    if (threadCountsOverride != null && sessionId && feedbackId) {
      setLocalCountsOverride({
        scope: `${sessionId}:${feedbackId}`,
        counts: threadCountsOverride,
      });
    }

    try {
      await updateComment(commentId, payload);
      pendingCommentPatchesRef.current.delete(commentId);
    } catch (err) {
      console.error("[ECHLY] updateComment failed", err);
      pendingCommentPatchesRef.current.delete(commentId);
      setLocalCountsOverride(null);
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          let next: LocalComment = { ...c };
          if (trimmedMessage !== undefined && previousMessage !== undefined) {
            next = { ...next, message: previousMessage };
          }
          if (data.resolved !== undefined && previousResolved !== undefined) {
            next = { ...next, resolved: previousResolved };
          }
          return next;
        })
      );
      if (!handlePermissionError(err, showToast)) showToast("Failed to update comment");
    }
  };

  const deleteCommentHandler = async (commentId: string) => {
    assertIdentityResolved(isIdentityResolved);

    pendingDeletedCommentIdsRef.current.add(commentId);
    deleteRevertSnapshotRef.current = null;
    setComments((prev) => {
      const idx = prev.findIndex((c) => c.id === commentId);
      if (idx === -1) {
        pendingDeletedCommentIdsRef.current.delete(commentId);
        return prev;
      }
      deleteRevertSnapshotRef.current = { comment: prev[idx], index: idx };
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });

    try {
      await deleteComment(commentId);
      deleteRevertSnapshotRef.current = null;
    } catch (err) {
      console.error("[ECHLY] deleteComment failed", err);
      pendingDeletedCommentIdsRef.current.delete(commentId);
      const maybeSnap = deleteRevertSnapshotRef.current;
      deleteRevertSnapshotRef.current = null;
      if (maybeSnap != null) {
        const { index: revertIndex, comment: revertComment } = maybeSnap;
        setComments((prev) => {
          if (prev.some((c) => c.id === commentId)) return prev;
          const insertAt = Math.min(revertIndex, prev.length);
          const next = [...prev];
          next.splice(insertAt, 0, revertComment);
          return next;
        });
      }
      if (!handlePermissionError(err, showToast)) showToast("Failed to delete comment");
    }
  };

  return {
    comments: comments as Comment[],
    loadingComments,
    /** Derived from current comment list (root threads). */
    commentThreadCounts,
    /** Merged: optimistic override until next Firestore snapshot, then server-derived list. */
    displayCommentThreadCounts,
    sendComment,
    sendReply,
    sendPinComment,
    sendTextComment,
    updatePinPosition: updatePinPositionHandler,
    updateComment: updateCommentHandler,
    deleteComment: deleteCommentHandler,
  };
}

