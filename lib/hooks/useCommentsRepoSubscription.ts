"use client";

import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listenToCommentsRepo } from "@/lib/repositories/commentsRepository";
import type { Comment } from "@/lib/domain/comment";

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
 * Uses a single `onAuthStateChanged` gate so the listener matches signed-in state.
 */
export function useCommentsRepoSubscription({
  workspaceId,
  sessionId,
  feedbackId,
  claimsReady,
  enabled = true,
  onComments,
}: Args): void {
  const onCommentsRef = useRef(onComments);
  onCommentsRef.current = onComments;

  useEffect(() => {
    const ws = typeof workspaceId === "string" ? workspaceId.trim() : "";
    const sid = typeof sessionId === "string" ? sessionId.trim() : "";
    const fid = typeof feedbackId === "string" ? feedbackId.trim() : "";

    if (!enabled || !claimsReady || !ws || !sid || !fid) {
      return;
    }

    let unsubComments: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubComments) {
        unsubComments();
        unsubComments = null;
      }
      if (!user) {
        onCommentsRef.current([]);
        return;
      }
      unsubComments = listenToCommentsRepo(ws, sid, fid, (incoming) => {
        onCommentsRef.current(incoming);
      });
    });

    return () => {
      unsubAuth();
      if (unsubComments) unsubComments();
    };
  }, [workspaceId, sessionId, feedbackId, claimsReady, enabled]);
}
