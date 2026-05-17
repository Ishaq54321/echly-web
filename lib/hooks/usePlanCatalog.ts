"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import type { PlanId } from "@/lib/billing/plans";

export interface PlanCatalogItem {
  id: PlanId;
  name: string;
  pricePerSeat: number | null;
  annualPricePerSeat: number | null;
  maxFeedbackPerMonth: number | null;
  maxMembers: number | null;
  aiImprovementsPerMonth: number | null;
  insightsEnabled: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  displayLimits: {
    sessions: string;
    members: string;
    feedbackTickets: string;
  };
}

export interface UsePlanCatalogResult {
  plans: PlanCatalogItem[] | null;
  loading: boolean;
  error: string | null;
}

const CATALOG_API = "/api/plans/catalog";
let cachedPlanCatalog: PlanCatalogItem[] | null = null;
let cachedPlanCatalogPromise: Promise<PlanCatalogItem[] | null> | null = null;

/**
 * Fetches plan catalog from API (single source of truth). No Firestore listener.
 */
export function usePlanCatalog(): UsePlanCatalogResult {
  const [plans, setPlans] = useState<PlanCatalogItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (cachedPlanCatalog) {
      setPlans(cachedPlanCatalog);
      setLoading(false);
      setError(null);
      return () => { cancelled = true; };
    }
    setLoading(true);
    setError(null);

    if (!cachedPlanCatalogPromise) {
      cachedPlanCatalogPromise = (async () => {
        const authed = await authFetch(CATALOG_API);
        const res = authed ?? (await fetch(CATALOG_API, { cache: "no-store" }));
        if (!res.ok) throw new Error("Failed to load plans");
        const envelope = (await res.json()) as { data?: PlanCatalogItem[] | null };
        const data = Array.isArray(envelope?.data) ? envelope.data : null;
        cachedPlanCatalog = data && data.length > 0 ? data : null;
        return cachedPlanCatalog;
      })().catch((err) => {
        cachedPlanCatalogPromise = null;
        throw err;
      });
    }

    cachedPlanCatalogPromise
      .then((data: PlanCatalogItem[] | null) => {
        if (!cancelled) {
          setPlans(data);
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

    return () => { cancelled = true; };
  }, []);

  return { plans, loading, error };
}
