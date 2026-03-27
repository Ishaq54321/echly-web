"use client";

import type { BillingUsageData } from "@/lib/hooks/useBillingUsage";

/**
 * Shared fetch for GET /api/billing/usage. Always performs a fresh request.
 */
export async function getBillingUsageCached(
  fetchFn: (url: string) => Promise<Response | null>
): Promise<BillingUsageData | null> {
  const res = await fetchFn("/api/billing/usage");
  if (!res || !res.ok) return null;
  return (await res.json()) as BillingUsageData;
}

export function invalidateBillingUsageCache(): void {
  // No-op: caching removed.
}
