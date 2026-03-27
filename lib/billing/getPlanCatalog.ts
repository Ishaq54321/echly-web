import { adminDb } from "@/lib/server/firebaseAdmin";
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
 * Fetches plan catalog from Firestore and merges with code defaults. Used by getPlanCatalog.
 */
async function fetchPlans(): Promise<PlanCatalog> {
  const catalog = buildDefaultCatalog();

  try {
    const snapshot = await adminDb.collection(PLANS_COLLECTION).get();
    const plans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (!plans || plans.length === 0) {
      console.warn("Plan catalog fallback triggered");
    }

    for (const row of plans) {
      const id = row.id as PlanId;
      if (!(id in catalog)) continue;
      const data = row as {
        id: string;
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
    }
    return catalog;
  } catch (err) {
    console.warn("Plan catalog fallback triggered", err);
    return catalog;
  }
}

/**
 * Returns plan catalog (Firestore plans + code defaults) with fresh data per call.
 */
export async function getPlanCatalog(): Promise<PlanCatalog> {
  return fetchPlans();
}

export function invalidatePlanCatalogCache(): void {
  // No-op: plan catalog caching was removed.
}
