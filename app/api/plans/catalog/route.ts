import { NextResponse } from "next/server";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import type { PlanId } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

const PLAN_ORDER: PlanId[] = ["free", "starter", "business", "enterprise"];

export interface PlansCatalogResponseItem {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxSessions: number | null;
  maxMembers: number | null;
  insightsEnabled: boolean;
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
        priceMonthly: entry.priceMonthly,
        priceYearly: entry.priceYearly,
        maxSessions: entry.maxSessions,
        maxMembers: entry.maxMembers,
        insightsEnabled: entry.insightsEnabled,
      };
    }).filter(Boolean) as PlansCatalogResponseItem[];
    return NextResponse.json(plans);
  } catch {
    // getPlanCatalog already has its own fallbacks; in the unlikely case of
    // total failure, return an empty list rather than crashing the product.
    return NextResponse.json([], { status: 200 });
  }
}

