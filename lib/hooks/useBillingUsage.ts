"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/authFetch";
import { getBillingUsageCached } from "@/lib/cachedBillingUsage";
import { useWorkspace } from "@/lib/client/workspaceContext";
import {
  getWorkspaceRealtimeSnapshot,
  retainWorkspaceFirestoreListener,
  subscribeWorkspaceStore,
} from "@/lib/realtime/workspaceStore";

function scheduleIdleTask(task: () => void): number {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(() => task(), { timeout: 1200 });
  }
  return globalThis.setTimeout(task, 250) as unknown as number;
}

function cancelIdleTask(handle: number): void {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(handle);
    return;
  }
  globalThis.clearTimeout(handle);
}

export interface BillingUsageData {
  plan: string;
  feedbackTicketsUsed: number;
  feedbackTicketsLimit: number | null;
  seats: number;
}

export type UseBillingUsageOptions = {
  /** When false, no subscription or fetch runs. Default true. */
  enabled?: boolean;
};

/**
 * Subscribes to the workspace document and refetches billing usage whenever
 * the workspace changes. Plan changes apply immediately without requiring logout.
 */
export function useBillingUsage(
  options: UseBillingUsageOptions = {}
): {
  data: BillingUsageData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const { enabled = true } = options;
  const { workspaceId: ctxWorkspaceId, isIdentityReady } = useWorkspace();
  const [data, setData] = useState<BillingUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const json = await getBillingUsageCached(authFetch);
      if (json === null) {
        setData(null);
        setError("Failed to load usage");
        return;
      }
      setData(json as BillingUsageData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    let releaseFirestore: (() => void) | null = null;
    const workspaceStoreUnsub: { current: (() => void) | null } = { current: null };
    let idleHandle: number | null = null;

    const queueRefetch = () => {
      if (idleHandle != null) cancelIdleTask(idleHandle);
      idleHandle = scheduleIdleTask(() => {
        idleHandle = null;
        if (cancelled) return;
        void refetch();
      });
    };

    const trimmedWorkspace =
      ctxWorkspaceId != null && ctxWorkspaceId.trim() !== ""
        ? ctxWorkspaceId.trim()
        : null;

    if (!isIdentityReady || trimmedWorkspace == null) {
      setData(null);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
        if (idleHandle != null) cancelIdleTask(idleHandle);
        workspaceStoreUnsub.current?.();
        workspaceStoreUnsub.current = null;
      };
    }

    releaseFirestore = retainWorkspaceFirestoreListener(trimmedWorkspace);

    void (async () => {
      if (cancelled) return;
      setLoading(true);
      try {
        if (workspaceStoreUnsub.current) {
          workspaceStoreUnsub.current();
          workspaceStoreUnsub.current = null;
        }
        let seenInitialSnapshot = false;
        workspaceStoreUnsub.current = subscribeWorkspaceStore(() => {
          const snap = getWorkspaceRealtimeSnapshot();
          if (snap.workspaceId !== trimmedWorkspace || snap.loading) return;
          if (cancelled) return;
          if (snap.error) {
            setError(snap.error.message);
            setLoading(false);
            return;
          }
          if (!seenInitialSnapshot) {
            seenInitialSnapshot = true;
            return;
          }
          queueRefetch();
        });
        const initialWorkspaceSnap = getWorkspaceRealtimeSnapshot();
        if (
          initialWorkspaceSnap.workspaceId === trimmedWorkspace &&
          initialWorkspaceSnap.error
        ) {
          if (!cancelled) {
            setError(initialWorkspaceSnap.error.message);
            setLoading(false);
          }
          return;
        }
        if (
          initialWorkspaceSnap.workspaceId === trimmedWorkspace &&
          !initialWorkspaceSnap.loading
        ) {
          seenInitialSnapshot = true;
        }
        if (cancelled) {
          workspaceStoreUnsub.current?.();
          return;
        }

        queueRefetch();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (idleHandle != null) cancelIdleTask(idleHandle);
      workspaceStoreUnsub.current?.();
      workspaceStoreUnsub.current = null;
      releaseFirestore?.();
    };
  }, [enabled, refetch, ctxWorkspaceId, isIdentityReady]);

  return { data, loading, error, refetch };
}
