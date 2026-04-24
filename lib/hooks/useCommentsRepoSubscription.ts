"use client";

import { useCallback, useEffect, useRef } from "react";
import { fetchComments } from "@/lib/comments";
import type { Comment } from "@/lib/domain/comment";

type Args = {
  sessionId: string | null | undefined;
  feedbackId?: string | null | undefined;
  /**
   * When false, no fetches (caller clears comment state if needed).
   */
  enabled?: boolean;
  onComments: (comments: Comment[]) => void;
};

/**
 * Fetches GET /api/comments/:sessionId when active and delivers comments for `feedbackId` via `onComments`.
 * One automatic fetch per sessionId+feedbackId open; use `refetch()` for manual sync (force refresh).
 */
export function useCommentsRepoSubscription({
  sessionId,
  feedbackId,
  enabled = true,
  onComments,
}: Args): { refetch: () => Promise<void> } {
  const onCommentsRef = useRef(onComments);
  const initialDoneRef = useRef("");
  const prevScopeRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const queuedRefetchRef = useRef(false);

  useEffect(() => {
    onCommentsRef.current = onComments;
  }, [onComments]);

  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  const fetchEnabled = enabled && !!sid;
  const scopeKey = sid;

  useEffect(() => {
    if (!scopeKey) return;
    if (prevScopeRef.current !== scopeKey) {
      prevScopeRef.current = scopeKey;
      initialDoneRef.current = "";
    }
  }, [scopeKey]);

  useEffect(() => {
    if (!fetchEnabled) {
      initialDoneRef.current = "";
    }
  }, [fetchEnabled]);

  useEffect(() => {
    if (!fetchEnabled || !scopeKey) return;
    if (initialDoneRef.current === scopeKey) return;
    let cancelled = false;
    void (async () => {
      try {
        const scoped = await fetchComments(sid, {
          feedbackId: undefined,
          force: false,
        });
        if (cancelled) return;
        initialDoneRef.current = scopeKey;
        onCommentsRef.current(scoped);
      } catch (e) {
        console.error("[useCommentsRepoSubscription] fetchComments failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchEnabled, scopeKey, sid]);

  const runRefetch = useCallback(
    async (queueIfBusy: boolean) => {
      if (!sid) return;

      if (inFlightRef.current) {
        if (queueIfBusy) queuedRefetchRef.current = true;
        return;
      }
      inFlightRef.current = true;
      try {
        do {
          queuedRefetchRef.current = false;
          const scoped = await fetchComments(sid, {
            feedbackId: undefined,
            force: true,
          });
          initialDoneRef.current = scopeKey;
          onCommentsRef.current(scoped);
        } while (queuedRefetchRef.current);
      } catch (e) {
        console.error("[useCommentsRepoSubscription] refetch failed", e);
      } finally {
        inFlightRef.current = false;
      }
    },
    [sid, scopeKey],
  );

  const refetch = useCallback(async () => {
    await runRefetch(true);
  }, [runRefetch]);

  return { refetch };
}
