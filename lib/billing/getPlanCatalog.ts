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

let cachedCatalog: PlanCatalog | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let inFlightCatalogFetch: Promise<PlanCatalog> | null = null;

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
    const snapshot = await getDocs(collection(db, PLANS_COLLECTION));
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
    return catalog;
  } catch {
    // Safety fallback: never crash because plans can't be fetched.
    return catalog;
  }
}

/**
 * Returns plan catalog (Firestore plans + code defaults). Cached in-memory for 5 minutes
 * so repeated calls in the same process (e.g. multiple API handlers) share one Firestore read.
 */
export async function getPlanCatalog(): Promise<PlanCatalog> {
  const now = Date.now();
  if (cachedCatalog && now - lastFetchTime < CACHE_TTL) {
    return cachedCatalog;
  }

  if (inFlightCatalogFetch) {
    return inFlightCatalogFetch;
  }

  inFlightCatalogFetch = fetchPlans();
  try {
    const catalog = await inFlightCatalogFetch;
    cachedCatalog = catalog;
    lastFetchTime = Date.now();
    return catalog;
  } finally {
    inFlightCatalogFetch = null;
  }
}

export function invalidatePlanCatalogCache(): void {
  cachedCatalog = null;
  lastFetchTime = 0;
  inFlightCatalogFetch = null;
}

