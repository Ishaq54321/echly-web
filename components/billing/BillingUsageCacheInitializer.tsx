"use client";

import { useEffect } from "react";
import { fetchBillingUsage } from "@/lib/api/fetchBillingUsage";
import { billingStore } from "@/lib/store/billingStore";
import { useWorkspace } from "@/lib/client/workspaceContext";

function schedulePostPaint(task: () => void): number {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(task, { timeout: 2500 });
  }
  return globalThis.setTimeout(task, 0) as unknown as number;
}

function cancelScheduled(handle: number): void {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(handle);
    return;
  }
  globalThis.clearTimeout(handle);
}

export function BillingUsageCacheInitializer() {
  const { isIdentityResolved } = useWorkspace();

  useEffect(() => {
    if (!isIdentityResolved) return;

    let cancelled = false;
    const handle = schedulePostPaint(() => {
      if (cancelled) return;
      if (billingStore.isLoaded || billingStore.isLoading) return;

      billingStore.setLoading(true);
      void fetchBillingUsage()
        .then((data) => {
          billingStore.setBilling(data);
        })
        .catch((error) => {
          billingStore.setError(error);
        })
        .finally(() => {
          billingStore.setLoading(false);
        });
    });

    return () => {
      cancelled = true;
      cancelScheduled(handle);
    };
  }, [isIdentityResolved]);

  return null;
}
