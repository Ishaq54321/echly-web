"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { useBillingUsage } from "@/lib/hooks/useBillingUsage";
import type { BillingUsageData } from "@/lib/hooks/useBillingUsage";

export type BillingUsageContextValue = {
  data: BillingUsageData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const BillingUsageContext = createContext<BillingUsageContextValue | null>(null);

/**
 * Single source for billing usage. Fetch runs once per app load; consumers
 * (UsageMeter, ProfileCommandPanel, UpgradeModal) read from context instead
 * of calling useBillingUsage(), so GET /api/billing/usage is only requested once.
 */
export function BillingUsageProvider({ children }: { children: ReactNode }) {
  const { isIdentityReady, workspaceId } = useWorkspace();
  const enabled =
    isIdentityReady &&
    workspaceId != null &&
    workspaceId.trim() !== "";
  const value = useBillingUsage({ enabled });
  return (
    <BillingUsageContext.Provider value={value}>
      {children}
    </BillingUsageContext.Provider>
  );
}

export function useBillingUsageContext(): BillingUsageContextValue {
  const ctx = useContext(BillingUsageContext);
  if (ctx == null) {
    throw new Error("useBillingUsageContext must be used within BillingUsageProvider");
  }
  return ctx;
}
