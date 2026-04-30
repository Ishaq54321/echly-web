"use client";

import { useEffect } from "react";
import { fetchBillingUsage } from "@/lib/api/fetchBillingUsage";
import { billingStore } from "@/lib/store/billingStore";
import { useWorkspace } from "@/lib/client/workspaceContext";

export function BillingUsageCacheInitializer() {
  const { isIdentityReady } = useWorkspace();

  useEffect(() => {
    if (!isIdentityReady) return;
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
  }, [isIdentityReady]);

  return null;
}
