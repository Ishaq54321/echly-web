"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { fetchComments } from "@/lib/comments";
import type { Comment } from "@/lib/domain/comment";
import {
  getCommentsSnapshot,
  retainCommentsListener,
  subscribeToComments,
} from "@/lib/realtime/commentsStore";
import { useSessionStore } from "@/lib/realtime/sessionStore";
import { useWorkspace } from "@/lib/client/workspaceContext";

type Args = {
  sessionId: string | null | undefined;
  /**
   * Per-ticket scope. When provided, the Firestore listener filters comments by
   * `feedbackId` so each ticket gets its own real-time feed. Omitting falls back
   * to REST-only mode (used by anon viewers that can't run the listener anyway).
   */
  feedbackId?: string | null | undefined;
  enabled?: boolean;
  /**
   * When false, listener mode is suppressed and the hook falls through to REST mode.
   * Required to prevent unauthorized authed viewers (signed-in but no session access)
   * from attaching a Firestore comments listener that would fail with permission-denied.
   * Default true preserves behavior for authed-workspace contexts.
   */
  canSubscribeToFirestore?: boolean;
  onComments: (comments: Comment[]) => void;
};

/**
 * Comments subscription. Authenticated viewers — workspace members AND
 * cross-workspace session-invited users (both have Firestore listener access via
 * Phase 6b's sessionAccess rules) — drive an onSnapshot listener via
 * commentsStore. Anonymous viewers (no Firebase Auth) fall back to the REST
 * endpoint with an initial fetch + manual refetch. The `canSubscribeToFirestore`
 * prop additionally suppresses listener mode for authed viewers without a
 * direct session grant (e.g. link_view), routing them to REST.
 *
 * The workspaceId is sourced from the *session*'s workspaceId (via sessionStore),
 * not the viewer's workspaceId — listeners must query the workspace the session
 * belongs to.
 */
export function useCommentsRepoSubscription({
  sessionId,
  feedbackId,
  enabled = true,
  canSubscribeToFirestore = true,
  onComments,
}: Args): { refetch: () => Promise<void> } {
  const { authUid } = useWorkspace();
  const onCommentsRef = useRef(onComments);
  useEffect(() => {
    onCommentsRef.current = onComments;
  }, [onComments]);

  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  const fid = typeof feedbackId === "string" ? feedbackId.trim() : "";
  const uid = typeof authUid === "string" ? authUid.trim() : "";

  const sessionState = useSessionStore(sid);
  const sessionWorkspaceId =
    typeof sessionState.session?.workspaceId === "string"
      ? sessionState.session.workspaceId.trim()
      : "";

  const useListener =
    enabled &&
    canSubscribeToFirestore &&
    !!sid &&
    !!fid &&
    !!uid &&
    !!sessionWorkspaceId;
  const useRest = enabled && !!sid && !useListener;

  // ── Listener mode (authenticated workspace members) ───────────────────────
  useEffect(() => {
    if (!useListener) return;
    const release = retainCommentsListener(sid, fid, sessionWorkspaceId);
    const unsubscribe = subscribeToComments(sid, fid, () => {
      onCommentsRef.current(getCommentsSnapshot(sid, fid).comments);
    });
    // Initial emit: deliver whatever's in the store right now (could be empty).
    onCommentsRef.current(getCommentsSnapshot(sid, fid).comments);
    return () => {
      unsubscribe();
      release();
    };
  }, [useListener, sid, fid, sessionWorkspaceId]);

  // ── REST mode (anonymous share-link viewers) ──────────────────────────────
  const initialDoneRef = useRef("");
  const inFlightRef = useRef(false);
  const queuedRefetchRef = useRef(false);
  const restScopeKey = useRest ? `${sid}:${fid}` : "";

  useEffect(() => {
    if (!restScopeKey) {
      initialDoneRef.current = "";
      return;
    }
    if (initialDoneRef.current === restScopeKey) return;
    let cancelled = false;
    void (async () => {
      try {
        const scoped = await fetchComments(sid, {
          feedbackId: fid || undefined,
          force: false,
        });
        if (cancelled) return;
        initialDoneRef.current = restScopeKey;
        onCommentsRef.current(scoped);
      } catch (e) {
        console.error("[useCommentsRepoSubscription] fetchComments failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restScopeKey, sid, fid]);

  const refetch = useCallback(async () => {
    if (!sid) return;
    if (useListener) {
      // Listener already streams updates; re-emit current snapshot for any consumer
      // whose manual "Refresh" button wants to flush stuck local state.
      onCommentsRef.current(getCommentsSnapshot(sid, fid).comments);
      return;
    }
    if (inFlightRef.current) {
      queuedRefetchRef.current = true;
      return;
    }
    inFlightRef.current = true;
    try {
      do {
        queuedRefetchRef.current = false;
        const scoped = await fetchComments(sid, {
          feedbackId: fid || undefined,
          force: true,
        });
        initialDoneRef.current = `${sid}:${fid}`;
        onCommentsRef.current(scoped);
      } while (queuedRefetchRef.current);
    } catch (e) {
      console.error("[useCommentsRepoSubscription] refetch failed", e);
    } finally {
      inFlightRef.current = false;
    }
  }, [sid, fid, useListener]);

  return useMemo(() => ({ refetch }), [refetch]);
}
