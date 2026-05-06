"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type { CommentPosition, CommentTextRange, CommentAttachment } from "@/lib/domain/comment";
import { useToast } from "@/components/dashboard/context/ToastContext";
import {
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { useCommentsRepoSubscription } from "@/lib/hooks/useCommentsRepoSubscription";
import { handlePermissionError } from "@/lib/client/permissionError";
import { safeResolveAction } from "@/lib/client/safeResolveAction";

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
 * Comment list from GET /api/comments/:sessionId via `useCommentsRepoSubscription` (initial fetch + manual `refetchComments`).
 */
export function useFeedbackDetailController(args: {
  sessionId: string;
  feedbackId: string | null | undefined;
  /** From {@link AccessCapabilities.canResolve}; required for resolve-thread mutations. */
  canResolve: boolean;
  /**
   * Gates the comments Firestore listener. False for anon viewers and authed-but-unauthorized
   * viewers; they fall through to REST mode. Mirrors the SessionPageClient retain-effect gate.
   */
  canSubscribeToFirestore: boolean;
  onRequestResolveAccess: () => void;
}) {
  const { sessionId, feedbackId, canResolve, canSubscribeToFirestore, onRequestResolveAccess } = args;
  const { showToast } = useToast();
  const {
    authUid,
    displayName,
    authPhotoUrl,
    isIdentityResolved,
    authReady,
  } = useWorkspace();

  const commentsPollEnabled =
    authReady &&
    Boolean(sessionId?.trim()) &&
    Boolean(authUid?.trim());

  const [comments, setComments] = useState<LocalComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  /** Optimistic thread counts; scoped so switching feedback ignores stale rows without an effect reset. */
  const [localCountsOverride, setLocalCountsOverride] = useState<{
    scope: string;
    counts: FeedbackCommentThreadCounts;
  } | null>(null);

  /** Hide until server data omits the id (avoids refetch resurrecting optimistically deleted rows). */
  const pendingDeletedCommentIdsRef = useRef(new Set<string>());
  /** Overlay in-flight PATCH fields until success; merge uses the server list as base and would otherwise wipe local edits. */
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
    if (authReady && !authUid?.trim()) {
      pendingDeletedCommentIdsRef.current.clear();
      pendingCommentPatchesRef.current.clear();
      deleteRevertSnapshotRef.current = null;
      setComments([]);
      setLoadingComments(false);
    }
  }, [authReady, authUid]);

  useEffect(() => {
    if (!sessionId) return;
    setComments([]);
    setLoadingComments(true);
  }, [sessionId]);

  const { refetch: refetchComments } = useCommentsRepoSubscription({
    sessionId,
    feedbackId: undefined,
    enabled: commentsPollEnabled,
    canSubscribeToFirestore,
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

  const sendComment = async (
    message: string,
    attachment?: CommentAttachment,
    attachments?: CommentAttachment[],
    position?: CommentPosition,
    mentionedUserIds?: string[]
  ): Promise<string> => {
    if (!authUid || !feedbackId) return "";
    if (!isIdentityResolved) return "";
    const trimmed = message.trim();
    if (!trimmed && !attachment && (!attachments || attachments.length === 0)) return "";
    const payload: AddCommentOptions = {
      userId: authUid,
      userName: displayName || "User",
      userAvatar: authPhotoUrl || "",
      message: trimmed,
      ...(attachments && attachments.length > 0 ? { attachments } : {}),
      ...(attachment ? { attachment } : {}),
      ...(position ? { type: "pin" as const, position } : {}),
      ...(mentionedUserIds && mentionedUserIds.length > 0 ? { mentionedUserIds } : {}),
    };
    const optimistic = createOptimisticComment({
      sessionId,
      feedbackId,
      data: payload,
    });
    setComments((prev) => [optimistic, ...prev]);
    void (async () => {
      try {
        await addComment(sessionId, feedbackId, payload);
        void refetchComments();
      } catch (err) {
        console.error("[ECHLY] addComment failed", err);
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        if (!handlePermissionError(err, showToast)) showToast("Failed to send comment");
      }
    })();
    return optimistic.id;
  };

  const sendReply = async (
    threadId: string,
    message: string,
    attachment?: CommentAttachment,
    attachments?: CommentAttachment[],
    mentionedUserIds?: string[]
  ): Promise<void> => {
    if (!authUid || !feedbackId) return;
    if (!isIdentityResolved) return;
    const trimmed = message.trim();
    if (!trimmed && !attachment && (!attachments || attachments.length === 0)) return;
    const payload: AddCommentOptions = {
      userId: authUid,
      userName: displayName || "User",
      userAvatar: authPhotoUrl || "",
      message: trimmed,
      threadId,
      ...(attachments && attachments.length > 0 ? { attachments } : {}),
      ...(attachment ? { attachment } : {}),
      ...(mentionedUserIds && mentionedUserIds.length > 0 ? { mentionedUserIds } : {}),
    };
    const optimistic = createOptimisticComment({
      sessionId,
      feedbackId,
      data: payload,
    });
    setComments((prev) => [optimistic, ...prev]);
    void (async () => {
      try {
        await addComment(sessionId, feedbackId, payload);
        void refetchComments();
      } catch (err) {
        console.error("[ECHLY] addComment reply failed", err);
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        if (!handlePermissionError(err, showToast)) showToast("Failed to send reply");
      }
    })();
  };

  const sendPinComment = async (
    position: CommentPosition,
    message: string,
    mentionedUserIds?: string[]
  ): Promise<string | null> => {
    if (!authUid || !feedbackId) return null;
    if (!isIdentityResolved) return null;
    const trimmed = message.trim();
    if (!trimmed) return null;
    const payload: AddCommentOptions = {
      userId: authUid,
      userName: displayName || "User",
      userAvatar: authPhotoUrl || "",
      message: trimmed,
      type: "pin",
      position,
      ...(mentionedUserIds && mentionedUserIds.length > 0 ? { mentionedUserIds } : {}),
    };
    const optimistic = createOptimisticComment({
      sessionId,
      feedbackId,
      data: payload,
    });
    setComments((prev) => [optimistic, ...prev]);
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
        void refetchComments();
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
    if (!isIdentityResolved) return null;
    const trimmed = message.trim();
    if (!trimmed) return null;
    const payload: AddCommentOptions = {
      userId: authUid,
      userName: displayName || "User",
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
    setComments((prev) => [optimistic, ...prev]);
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
        void refetchComments();
      } catch (err) {
        console.error("[ECHLY] sendTextComment failed", err);
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        if (!handlePermissionError(err, showToast)) showToast("Failed to add comment");
      }
    })();
    return optimistic.id;
  };

  const updatePinPositionHandler = useCallback(async (
    commentId: string,
    position: { xPercent: number; yPercent: number }
  ) => {
    if (!isIdentityResolved) return;
    setComments(prev => prev.map(c =>
      c.id === commentId && c.position
        ? { ...c, position: { ...c.position, xPercent: position.xPercent, yPercent: position.yPercent } }
        : c
    ));
    try {
      await updatePinPosition(commentId, position);
    } catch (err) {
      console.error("[ECHLY] updatePinPosition failed", err);
      void refetchComments();
      if (!handlePermissionError(err, showToast)) showToast("Failed to move pin");
    }
  }, [isIdentityResolved, refetchComments, showToast]);

  const updateCommentHandler = async (
    commentId: string,
    data: { message?: string; resolved?: boolean }
  ) => {
    if (!isIdentityResolved) return;
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

    const runUpdate = async () => {
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

    if (data.resolved !== undefined) {
      safeResolveAction({
        canResolve,
        triggerRequestAccessFlow: onRequestResolveAccess,
        run: () => {
          void runUpdate();
        },
      });
      return;
    }

    await runUpdate();
  };

  const deleteCommentHandler = async (commentId: string) => {
    if (!isIdentityResolved) return;

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

  const handleReactionsChanged = useCallback(
    (commentId: string, reactions: Record<string, { userIds: string[]; userNames: string[] }>) => {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, reactions } : c))
      );
    },
    []
  );

  const [participants, setParticipants] = useState<{ uid: string; displayName: string; email: string; avatarUrl: string | null }[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/sessions/${sessionId}/participants`)
      .then((res) => res.json())
      .then((data: { data?: { participants?: { uid: string; displayName: string; email: string; avatarUrl: string | null }[] } }) => {
        if (data.data?.participants) setParticipants(data.data.participants);
      })
      .catch(() => {});
  }, [sessionId]);

  return {
    comments: comments as Comment[],
    loadingComments,
    /** Derived from current comment list (root threads). */
    commentThreadCounts,
    /** Merged: optimistic override until next server fetch, then server-derived list. */
    displayCommentThreadCounts,
    refetchComments,
    sendComment,
    sendReply,
    sendPinComment,
    sendTextComment,
    updatePinPosition: updatePinPositionHandler,
    updateComment: updateCommentHandler,
    deleteComment: deleteCommentHandler,
    handleReactionsChanged,
    participants,
  };
}

