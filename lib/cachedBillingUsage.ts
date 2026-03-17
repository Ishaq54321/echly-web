"use client";

import type { BillingUsageData } from "@/lib/hooks/useBillingUsage";

const TTL_MS = 60_000; // 1 minute: same request only fires once per minute across all consumers

let cached: { data: BillingUsageData; at: number } | null = null;
let inFlight: Promise<BillingUsageData | null> | null = null;

/**
 * Shared fetch for GET /api/billing/usage. Dedupes concurrent and recent calls
 * so multiple components (UsageMeter, ProfileCommandPanel, etc.) trigger only one request per TTL.
 */
export async function getBillingUsageCached(
  fetchFn: (url: string) => Promise<Response>
): Promise<BillingUsageData | null> {
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) {
    return cached.data;
  }
  if (inFlight) {
    return inFlight;
  }
  const promise = (async () => {
    try {
      const res = await fetchFn("/api/billing/usage");
      if (!res.ok) return null;
      const data = (await res.json()) as BillingUsageData;
      cached = { data, at: Date.now() };
      return data;
    } finally {
      inFlight = null;
    }
  })();
  inFlight = promise;
  return promise;
}

/** Invalidate cache (e.g. after workspace change so next refetch is fresh). */
export function invalidateBillingUsageCache(): void {
  cached = null;
  inFlight = null;
}
