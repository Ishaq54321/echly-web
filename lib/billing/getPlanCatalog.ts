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
 * Returns plan catalog (Firestore plans + code defaults). Always reads from Firestore
 * so admin plan changes propagate immediately to limits and billing.
 */
export async function getPlanCatalog(): Promise<PlanCatalog> {
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

