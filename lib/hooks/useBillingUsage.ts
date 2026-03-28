"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import { getBillingUsageCached, invalidateBillingUsageCache } from "@/lib/cachedBillingUsage";
import { useWorkspace } from "@/lib/client/workspaceContext";
import {
  clearWorkspaceSubscription,
  getWorkspaceRealtimeSnapshot,
  subscribeWorkspace,
  subscribeWorkspaceStore,
} from "@/lib/realtime/workspaceStore";

function scheduleIdleTask(task: () => void): number {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(() => task(), { timeout: 1200 });
  }
  // Use globalThis to keep this type-safe even when `window` is not narrowed.
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
  limits: {
    maxSessions: number | null;
  };
}

export type UseBillingUsageOptions = {
  /** When false, no subscription or fetch runs. Default true. */
  enabled?: boolean;
};

/**
 * Subscribes to the workspace document and refetches billing usage whenever
 * the workspace changes (e.g. admin updates plan/entitlements). So plan
 * changes apply immediately without requiring the user to log out.
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
  const { workspaceId: ctxWorkspaceId, claimsReady } = useWorkspace();
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
      setData(json);
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

    setLoading(true);
    let cancelled = false;
    let unsubscribeWorkspaceStore: (() => void) | null = null;
    let idleHandle: number | null = null;

    const queueRefetch = () => {
      if (idleHandle != null) cancelIdleTask(idleHandle);
      idleHandle = scheduleIdleTask(() => {
        idleHandle = null;
        if (cancelled) return;
        invalidateBillingUsageCache();
        void refetch();
      });
    };

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      void (async () => {
        if (cancelled || !user) {
          if (!cancelled) {
            if (unsubscribeWorkspaceStore) {
              unsubscribeWorkspaceStore();
              unsubscribeWorkspaceStore = null;
            }
            clearWorkspaceSubscription();
            setData(null);
            setLoading(false);
          }
          return;
        }

        if (!claimsReady) {
          if (unsubscribeWorkspaceStore) {
            unsubscribeWorkspaceStore();
            unsubscribeWorkspaceStore = null;
          }
          clearWorkspaceSubscription();
          return;
        }

        const workspaceId = ctxWorkspaceId?.trim() ?? "";
        if (!workspaceId) {
          if (unsubscribeWorkspaceStore) {
            unsubscribeWorkspaceStore();
            unsubscribeWorkspaceStore = null;
          }
          clearWorkspaceSubscription();
          return;
        }
        try {
          if (unsubscribeWorkspaceStore) {
            unsubscribeWorkspaceStore();
            unsubscribeWorkspaceStore = null;
          }
          let seenInitialSnapshot = false;
          subscribeWorkspace(workspaceId);
          unsubscribeWorkspaceStore = subscribeWorkspaceStore(() => {
            const snap = getWorkspaceRealtimeSnapshot();
            if (snap.workspaceId !== workspaceId || snap.loading) return;
            if (cancelled) return;
            if (snap.error) {
              setError(snap.error.message);
              setLoading(false);
              return;
            }
            // Skip initial snapshot; we already queue the initial fetch below.
            if (!seenInitialSnapshot) {
              seenInitialSnapshot = true;
              return;
            }
            queueRefetch();
          });
          const initialWorkspaceSnap = getWorkspaceRealtimeSnapshot();
          if (
            initialWorkspaceSnap.workspaceId === workspaceId &&
            initialWorkspaceSnap.error
          ) {
            if (!cancelled) {
              setError(initialWorkspaceSnap.error.message);
              setLoading(false);
            }
            return;
          }
          if (initialWorkspaceSnap.workspaceId === workspaceId && !initialWorkspaceSnap.loading) {
            seenInitialSnapshot = true;
          }
          if (cancelled) {
            unsubscribeWorkspaceStore();
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
    });

    return () => {
      cancelled = true;
      if (idleHandle != null) cancelIdleTask(idleHandle);
      unsubAuth();
      if (unsubscribeWorkspaceStore) unsubscribeWorkspaceStore();
    };
  }, [enabled, refetch, claimsReady, ctxWorkspaceId]);

  return { data, loading, error, refetch };
}
