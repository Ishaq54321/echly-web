import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PLANS, type PlanId, DEFAULT_PRICES } from "./plans";

export interface PlanCatalogEntry {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxSessions: number | null;
  maxMembers: number | null;
  insightsEnabled: boolean;
}

export type PlanCatalog = Record<PlanId, PlanCatalogEntry>;

const PLANS_COLLECTION = "plans";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Global module-level cache: single source of truth for plan catalog
let planCache = {
  data: null as PlanCatalog | null,
  expiresAt: 0,
  promise: null as Promise<PlanCatalog> | null,
};

const PLAN_NAMES: Record<PlanId, string> = {
  free: "Free",
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

function buildDefaultCatalog(): PlanCatalog {
  const out = {} as PlanCatalog;
  (["free", "starter", "business", "enterprise"] as PlanId[]).forEach((id) => {
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

/**
 * Fetches plan catalog from Firestore and merges with code defaults. Used by getPlanCatalog.
 */
async function fetchPlans(): Promise<PlanCatalog> {
  const t_catalog_start = performance.now();
  const catalog = buildDefaultCatalog();

  try {
    const t_firestore_start = performance.now();
    const snapshot = await getDocs(collection(db, PLANS_COLLECTION));
    console.log("[ECHLY PERF] getPlanCatalog.getDocs(plans):", performance.now() - t_firestore_start);
    snapshot.docs.forEach((docSnap) => {
      const id = docSnap.id as PlanId;
      if (!(id in catalog)) return;
      const data = docSnap.data() as {
        name?: string;
        priceMonthly?: number;
        priceYearly?: number;
        maxSessions?: number | null;
        maxMembers?: number | null;
        insightsEnabled?: boolean;
      };

      const current = catalog[id];
      catalog[id] = {
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
    console.log("[ECHLY PERF] getPlanCatalog TOTAL:", performance.now() - t_catalog_start);
    return catalog;
  } catch {
    // Safety fallback: never crash because plans can't be fetched.
    console.log("[ECHLY PERF] getPlanCatalog TOTAL (fallback):", performance.now() - t_catalog_start);
    return catalog;
  }
}

/**
 * Returns plan catalog (Firestore plans + code defaults). Cached in-memory for 5 minutes
 * so repeated calls in the same process (e.g. multiple API handlers) share one Firestore read.
 */
export async function getPlanCatalog(): Promise<PlanCatalog> {
  if (planCache.data && Date.now() < planCache.expiresAt) {
    console.log("[ECHLY CACHE] planCatalog HIT");
    return planCache.data;
  }

  if (planCache.promise) {
    console.log("[ECHLY CACHE] planCatalog IN-FLIGHT");
    return planCache.promise;
  }

  console.log("[ECHLY CACHE] planCatalog MISS");
  planCache.promise = fetchPlans();

  try {
    const data = await planCache.promise;
    planCache.data = data;
    planCache.expiresAt = Date.now() + CACHE_TTL_MS;
    return data;
  } finally {
    planCache.promise = null;
  }
}

