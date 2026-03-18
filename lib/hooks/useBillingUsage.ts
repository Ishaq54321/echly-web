"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import { getBillingUsageCached, invalidateBillingUsageCache } from "@/lib/cachedBillingUsage";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { listenToWorkspace } from "@/lib/repositories/workspacesRepository";

export interface BillingUsageData {
  plan: string;
  usage: {
    /** Active (non-archived, non-deleted) sessions — use this for plan limit display (X / Y sessions used). */
    activeSessions?: number;
    /** Lifetime sessions created (for analytics only). Do not use for limit display. */
    sessionsCreated: number;
    members?: number;
  };
  limits: {
    maxSessions: number | null;
    maxMembers: number | null;
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
      setData(null);
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
    let unsubscribeWorkspace: (() => void) | null = null;

    let billingTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (cancelled || !user) {
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
        return;
      }

      try {
        const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
        if (cancelled) return;

        unsubscribeWorkspace = listenToWorkspace(workspaceId, () => {
          if (!cancelled) {
            invalidateBillingUsageCache();
            refetch();
          }
        });
        if (cancelled) {
          unsubscribeWorkspace();
          return;
        }

        // Defer billing fetch so it does not block main UI (dashboard/session load).
        billingTimeoutId = setTimeout(() => {
          if (!cancelled) refetch();
        }, 2000);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      if (billingTimeoutId) clearTimeout(billingTimeoutId);
      unsubAuth();
      if (unsubscribeWorkspace) unsubscribeWorkspace();
    };
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}
