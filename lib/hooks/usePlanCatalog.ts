"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, type QuerySnapshot, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PLANS, DEFAULT_PRICES, type PlanId } from "@/lib/billing/plans";

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

const PLAN_ORDER: PlanId[] = ["free", "starter", "business", "enterprise"];

const PLAN_NAMES: Record<PlanId, string> = {
  free: "Free",
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

function buildDefaultCatalog(): Record<PlanId, PlanCatalogItem> {
  const out = {} as Record<PlanId, PlanCatalogItem>;
  PLAN_ORDER.forEach((id) => {
    const config = PLANS[id] ?? PLANS.free;
    const prices = DEFAULT_PRICES[id];
    out[id] = {
      id,
      name: PLAN_NAMES[id],
      priceMonthly: prices.priceMonthly,
      priceYearly: prices.priceYearly,
      maxSessions: config.maxSessions ?? null,
      maxMembers: config.maxMembers ?? null,
      insightsEnabled: config.insightsAccess ?? false,
    };
  });
  return out;
}

function mergeSnapshotIntoCatalog(
  snapshot: QuerySnapshot<DocumentData>,
  base: Record<PlanId, PlanCatalogItem>
): Record<PlanId, PlanCatalogItem> {
  const next: Record<PlanId, PlanCatalogItem> = { ...base };

  snapshot.docs.forEach((doc) => {
    const id = doc.id as PlanId;
    if (!(id in next)) return;
    const data = doc.data() as {
      name?: string;
      priceMonthly?: number;
      priceYearly?: number;
      maxSessions?: number | null;
      maxMembers?: number | null;
      insightsEnabled?: boolean;
    };

    const current = next[id];
    next[id] = {
      ...current,
      name: data.name ?? current.name,
      priceMonthly: data.priceMonthly ?? current.priceMonthly,
      priceYearly: data.priceYearly ?? current.priceYearly,
      maxSessions:
        data.maxSessions !== undefined ? data.maxSessions : current.maxSessions,
      maxMembers:
        data.maxMembers !== undefined ? data.maxMembers : current.maxMembers,
      insightsEnabled:
        data.insightsEnabled !== undefined
          ? data.insightsEnabled
          : current.insightsEnabled,
    };
  });

  return next;
}

export function usePlanCatalog(): UsePlanCatalogResult {
  const [plans, setPlans] = useState<PlanCatalogItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      collection(db, "plans"),
      (snapshot) => {
        const base = buildDefaultCatalog();
        const catalog = mergeSnapshotIntoCatalog(snapshot, base);
        const orderedPlans = PLAN_ORDER.map((id) => catalog[id]).filter(
          Boolean
        ) as PlanCatalogItem[];

        setPlans(orderedPlans.length > 0 ? orderedPlans : null);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Failed to subscribe to plans collection:", err);
        const fallbackCatalog = buildDefaultCatalog();
        const orderedPlans = PLAN_ORDER.map((id) => fallbackCatalog[id]);
        setPlans(orderedPlans);
        setLoading(false);
        setError(err instanceof Error ? err.message : "Failed to load plans");
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return { plans, loading, error };
}

