"use client";

import { useCallback, useEffect, useRef } from "react";
import { fetchComments } from "@/lib/comments";
import type { Comment } from "@/lib/domain/comment";

type Args = {
  sessionId: string | null | undefined;
  feedbackId: string | null | undefined;
  /**
   * When false, no fetches (caller clears comment state if needed).
   */
  enabled?: boolean;
  onComments: (comments: Comment[]) => void;
};

/**
 * Fetches GET /api/comments/:sessionId when active and delivers comments for `feedbackId` via `onComments`.
 * One initial fetch when enabled; use `refetch()` for manual sync.
 */
export function useCommentsRepoSubscription({
  sessionId,
  feedbackId,
  enabled = true,
  onComments,
}: Args): { refetch: () => Promise<void> } {
  const onCommentsRef = useRef(onComments);

  useEffect(() => {
    onCommentsRef.current = onComments;
  }, [onComments]);

  const executeFetch = useCallback(async () => {
    const sid = typeof sessionId === "string" ? sessionId.trim() : "";
    const fid = typeof feedbackId === "string" ? feedbackId.trim() : "";
    if (!sid || !fid) return;
    try {
      const all = await fetchComments(sid);
      const filtered = all.filter((c) => c.feedbackId === fid);
      onCommentsRef.current(filtered);
    } catch (e) {
      console.error("[useCommentsRepoSubscription] fetchComments failed", e);
    }
  }, [sessionId, feedbackId]);

  const inFlightRef = useRef(false);
  const queuedRefetchRef = useRef(false);

  const run = useCallback(
    async (queueIfBusy: boolean) => {
      const sid = typeof sessionId === "string" ? sessionId.trim() : "";
      const fid = typeof feedbackId === "string" ? feedbackId.trim() : "";
      if (!sid || !fid) return;

      if (inFlightRef.current) {
        if (queueIfBusy) queuedRefetchRef.current = true;
        return;
      }
      inFlightRef.current = true;
      try {
        do {
          queuedRefetchRef.current = false;
          await executeFetch();
        } while (queuedRefetchRef.current);
      } finally {
        inFlightRef.current = false;
      }
    },
    [sessionId, feedbackId, executeFetch],
  );

  const refetch = useCallback(async () => {
    await run(true);
  }, [run]);

  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  const fid = typeof feedbackId === "string" ? feedbackId.trim() : "";
  const fetchEnabled = enabled && !!sid && !!fid;

  useEffect(() => {
    if (!fetchEnabled) return;
    void run(true);
  }, [fetchEnabled, run]);

  return { refetch };
}
