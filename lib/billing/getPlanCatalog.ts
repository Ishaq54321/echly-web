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
const CACHE_TTL_MS = 60_000;

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

async function fetchCatalogFromFirestore(): Promise<PlanCatalog> {
  const base = buildDefaultCatalog();

  try {
    const snapshot = await getDocs(collection(db, PLANS_COLLECTION));
    snapshot.docs.forEach((doc) => {
      const id = doc.id as PlanId;
      if (!(id in base)) return;
      const data = doc.data() as {
        priceMonthly?: number;
        priceYearly?: number;
        maxSessions?: number | null;
        maxMembers?: number | null;
        insightsEnabled?: boolean;
      };

      const current = base[id];
      base[id] = {
        ...current,
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
    return base;
  } catch {
    // Safety fallback: never crash because plans can't be fetched.
    return base;
  }
}

export async function getPlanCatalog(): Promise<PlanCatalog> {
  const now = Date.now();
  if (cachedCatalog && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedCatalog;
  }

  const catalog = await fetchCatalogFromFirestore();
  cachedCatalog = catalog;
  lastFetchTime = now;
  return catalog;
}

export function invalidatePlanCatalogCache(): void {
  cachedCatalog = null;
  lastFetchTime = 0;
}

