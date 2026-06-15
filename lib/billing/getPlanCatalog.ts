import { adminDb } from "@/lib/server/firebaseAdmin";
import { PLANS, type PlanId } from "./plans";

export interface PlanCatalogEntry {
  id: PlanId;
  name: string;
  pricePerSeat: number | null;
  annualPricePerSeat: number | null;
  maxFeedbackPerMonth: number | null;
  maxMembers: number | null;
  aiImprovementsPerMonth: number | null;
  insightsAccess: boolean;
  integrations: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  displayLimits: {
    sessions: string;
    members: string;
    feedbackTickets: string;
  };
}

export type PlanCatalog = Record<PlanId, PlanCatalogEntry>;

const PLANS_COLLECTION = "plans";

function buildDefaultCatalog(): PlanCatalog {
  const out = {} as PlanCatalog;
  (["starter", "business", "enterprise"] as PlanId[]).forEach((id) => {
    const def = PLANS[id];
    out[id] = {
      id,
      name: def.name,
      pricePerSeat: def.pricePerSeat,
      annualPricePerSeat: def.annualPricePerSeat,
      maxFeedbackPerMonth: def.maxFeedbackPerMonth,
      maxMembers: def.maxMembers,
      aiImprovementsPerMonth: def.aiImprovementsPerMonth,
      insightsAccess: def.insightsAccess,
      integrations: def.integrations,
      customBranding: def.customBranding,
      prioritySupport: def.prioritySupport,
      displayLimits: def.displayLimits,
    };
  });
  return out;
}

async function fetchPlans(): Promise<PlanCatalog> {
  const catalog = buildDefaultCatalog();

  try {
    const snapshot = await adminDb.collection(PLANS_COLLECTION).get();

    for (const doc of snapshot.docs) {
      const id = doc.id as PlanId;
      if (!(id in catalog)) continue;
      const data = doc.data() as {
        name?: string;
        pricePerSeat?: number | null;
        annualPricePerSeat?: number | null;
        maxFeedbackPerMonth?: number | null;
        maxMembers?: number | null;
        aiImprovementsPerMonth?: number | null;
        insightsAccess?: boolean;
        insightsEnabled?: boolean; // legacy field name — checked for backwards compatibility
        integrations?: boolean;
        customBranding?: boolean;
        prioritySupport?: boolean;
      };

      const current = catalog[id];
      catalog[id] = {
        ...current,
        name: data.name ?? current.name,
        pricePerSeat: data.pricePerSeat !== undefined ? data.pricePerSeat : current.pricePerSeat,
        annualPricePerSeat:
          data.annualPricePerSeat !== undefined
            ? data.annualPricePerSeat
            : current.annualPricePerSeat,
        maxFeedbackPerMonth:
          data.maxFeedbackPerMonth !== undefined
            ? data.maxFeedbackPerMonth
            : current.maxFeedbackPerMonth,
        maxMembers: data.maxMembers !== undefined ? data.maxMembers : current.maxMembers,
        aiImprovementsPerMonth:
          data.aiImprovementsPerMonth !== undefined
            ? data.aiImprovementsPerMonth
            : current.aiImprovementsPerMonth,
        insightsAccess:
          data.insightsAccess !== undefined
            ? data.insightsAccess
            : data.insightsEnabled !== undefined
            ? data.insightsEnabled
            : current.insightsAccess,
        integrations:
          data.integrations !== undefined ? data.integrations : current.integrations,
        customBranding:
          data.customBranding !== undefined ? data.customBranding : current.customBranding,
        prioritySupport:
          data.prioritySupport !== undefined ? data.prioritySupport : current.prioritySupport,
      };
    }

    return catalog;
  } catch (err) {
    console.warn("Plan catalog fallback triggered", err);
    return catalog;
  }
}

// PERF (Tier 1, T1.3): the plans collection is global (not user-scoped), so it
// is safe to cache process-wide. Re-added a short-lived in-memory cache so the
// dashboard's billing path doesn't hit the `plans` collection on every load.
// 5 min TTL — plans change rarely, and stale data beyond 5 min is unacceptable.
// In serverless this cache is per-instance: warm instances reuse it; cold
// starts re-fetch. That's expected and fine.
const PLAN_CATALOG_TTL_MS = 5 * 60 * 1000;
let cachedCatalog: { data: PlanCatalog; expiresAt: number } | null = null;

export async function getPlanCatalog(): Promise<PlanCatalog> {
  if (cachedCatalog && Date.now() < cachedCatalog.expiresAt) {
    return cachedCatalog.data;
  }
  const data = await fetchPlans();
  cachedCatalog = { data, expiresAt: Date.now() + PLAN_CATALOG_TTL_MS };
  return data;
}

export function invalidatePlanCatalogCache(): void {
  cachedCatalog = null;
}
