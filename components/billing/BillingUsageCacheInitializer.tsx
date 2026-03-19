"use client";

import { useEffect } from "react";
import { fetchBillingUsage } from "@/lib/api/fetchBillingUsage";
import { billingStore } from "@/lib/store/billingStore";

export function BillingUsageCacheInitializer() {
  useEffect(() => {
    if (billingStore.isLoaded || billingStore.isLoading) return;

    billingStore.setLoading(true);
    void fetchBillingUsage()
      .then((data) => {
        billingStore.setBilling(data);
      })
      .catch(() => {
        // Billing is non-blocking; UI can gracefully fallback.
      })
      .finally(() => {
        billingStore.setLoading(false);
      });
  }, []);

  return null;
}
