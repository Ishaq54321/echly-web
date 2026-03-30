"use client";

import { useEffect, useRef } from "react";
import { listenToCommentsRepo } from "@/lib/repositories/commentsRepository";
import type { Comment } from "@/lib/domain/comment";
import { useWorkspace } from "@/lib/client/workspaceContext";

type Args = {
  sessionId: string | null | undefined;
  feedbackId: string | null | undefined;
  /**
   * When false, tears down any listener without writing to `onComments`
   * (caller clears state if needed).
   */
  enabled?: boolean;
  onComments: (comments: Comment[]) => void;
};

/**
 * One Firestore `onSnapshot` per (session, feedback) via `listenToCommentsRepo`.
 */
export function useCommentsRepoSubscription({
  sessionId,
  feedbackId,
  enabled = true,
  onComments,
}: Args): void {
  const { workspaceId, isIdentityReady } = useWorkspace();
  const onCommentsRef = useRef(onComments);

  useEffect(() => {
    onCommentsRef.current = onComments;
  }, [onComments]);

  useEffect(() => {
    const wid = typeof workspaceId === "string" ? workspaceId.trim() : "";
    const sid = typeof sessionId === "string" ? sessionId.trim() : "";
    const fid = typeof feedbackId === "string" ? feedbackId.trim() : "";

    if (!enabled || !isIdentityReady || !wid || !sid || !fid) {
      return;
    }

    const unsubComments = listenToCommentsRepo(wid, sid, fid, (incoming) => {
      onCommentsRef.current(incoming);
    });

    return () => {
      unsubComments();
    };
  }, [workspaceId, sessionId, feedbackId, isIdentityReady, enabled]);
}
