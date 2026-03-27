"use client";

import { useEffect, useState } from "react";
import type { PlanId } from "@/lib/billing/plans";

export interface PlanCatalogItem {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxSessions: number | null;
  maxMembers: number | null;
  insightsEnabled: boolean;
}

export interface UsePlanCatalogResult {
  plans: PlanCatalogItem[] | null;
  loading: boolean;
  error: string | null;
}

const CATALOG_API = "/api/plans/catalog";

/**
 * Fetches plan catalog from API (single source of truth). No Firestore listener.
 * Refetches on mount; same interface as before for drop-in replacement.
 */
export function usePlanCatalog(): UsePlanCatalogResult {
  const [plans, setPlans] = useState<PlanCatalogItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(CATALOG_API, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load plans"))))
      .then((data: PlanCatalogItem[]) => {
        if (!cancelled) {
          setPlans(Array.isArray(data) && data.length > 0 ? data : null);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPlans(null);
          setError(err instanceof Error ? err.message : "Failed to load plans");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { plans, loading, error };
}
