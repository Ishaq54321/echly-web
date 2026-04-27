"use client";

import type { BillingUsageData } from "@/lib/hooks/useBillingUsage";

/**
 * Shared fetch for GET /api/billing/usage with a short in-memory TTL cache.
 */
const BILLING_USAGE_TTL_MS = 30_000;

let cachedUsage: BillingUsageData | null = null;
let cachedAtMs = 0;

export async function getBillingUsageCached(
  fetchFn: (url: string) => Promise<Response | null>
): Promise<BillingUsageData | null> {
  const now = Date.now();
  if (cachedUsage && now - cachedAtMs < BILLING_USAGE_TTL_MS) {
    return cachedUsage;
  }

  const res = await fetchFn("/api/billing/usage");
  if (!res || !res.ok) return null;
  const envelope = (await res.json()) as { data?: BillingUsageData };
  // TODO: BillingUsageProvider and useBillingUsageContext may be wired up later
  cachedUsage = (envelope?.data ?? {}) as BillingUsageData;
  cachedAtMs = now;
  return cachedUsage;
}

export function invalidateBillingUsageCache(): void {
  cachedUsage = null;
  cachedAtMs = 0;
}
