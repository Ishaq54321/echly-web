"use client";

import { useEffect, useRef } from "react";
import { listenToCommentsRepo } from "@/lib/repositories/commentsRepository";
import type { Comment } from "@/lib/domain/comment";
import { useWorkspace } from "@/lib/client/workspaceContext";

type Args = {
  workspaceId: string | null | undefined;
  sessionId: string | null | undefined;
  feedbackId: string | null | undefined;
  claimsReady: boolean;
  /**
   * When false, tears down any listener without writing to `onComments`
   * (caller clears state if needed).
   */
  enabled?: boolean;
  onComments: (comments: Comment[]) => void;
};

/**
 * One Firestore `onSnapshot` per (workspace, session, feedback) via `listenToCommentsRepo`.
 */
export function useCommentsRepoSubscription({
  workspaceId,
  sessionId,
  feedbackId,
  claimsReady,
  enabled = true,
  onComments,
}: Args): void {
  const { authUid } = useWorkspace();
  const onCommentsRef = useRef(onComments);
  onCommentsRef.current = onComments;

  useEffect(() => {
    const ws = typeof workspaceId === "string" ? workspaceId.trim() : "";
    const sid = typeof sessionId === "string" ? sessionId.trim() : "";
    const fid = typeof feedbackId === "string" ? feedbackId.trim() : "";

    if (!enabled || !claimsReady || !authUid || !ws || !sid || !fid) {
      return;
    }

    const unsubComments = listenToCommentsRepo(ws, sid, fid, (incoming) => {
      onCommentsRef.current(incoming);
    });

    return () => {
      unsubComments();
    };
  }, [workspaceId, sessionId, feedbackId, claimsReady, enabled, authUid]);
}
