import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import type { PlanId } from "@/lib/billing/plans";
import { apiSuccess } from "@/lib/server/apiResponse";

export const dynamic = "force-dynamic";

const PLAN_ORDER: PlanId[] = ["starter", "business", "enterprise"];

export interface PlansCatalogResponseItem {
  id: PlanId;
  name: string;
  pricePerSeat: number | null;
  annualPricePerSeat: number | null;
  maxFeedbackPerMonth: number | null;
  maxMembers: number | null;
  insightsAccess: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  displayLimits: {
    sessions: string;
    members: string;
    feedbackTickets: string;
  };
}

export async function GET() {
  try {
    const catalog = await getPlanCatalog();
    const plans: PlansCatalogResponseItem[] = PLAN_ORDER.map((id) => {
      const entry = catalog[id];
      if (!entry) return null;
      return {
        id: entry.id,
        name: entry.name,
        pricePerSeat: entry.pricePerSeat,
        annualPricePerSeat: entry.annualPricePerSeat,
        maxFeedbackPerMonth: entry.maxFeedbackPerMonth,
        maxMembers: entry.maxMembers,
        insightsAccess: entry.insightsAccess,
        customBranding: entry.customBranding,
        prioritySupport: entry.prioritySupport,
        displayLimits: entry.displayLimits,
      };
    }).filter(Boolean) as PlansCatalogResponseItem[];
    return apiSuccess(plans);
  } catch {
    return apiSuccess([], undefined, { status: 200 });
  }
}
