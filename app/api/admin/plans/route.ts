import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { requireAdmin } from "@/lib/server/adminAuth";
import { logAdminAction } from "@/lib/admin/adminLogs";
import type { PlanDoc } from "@/lib/admin/types";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { invalidatePlanCatalogCache } from "@/lib/billing/getPlanCatalog";

const PLANS_COLLECTION = "plans";

export type PlanWithId = PlanDoc & { id: string };

function defaultPlanDoc(id: PlanId): PlanDoc {
  const def = PLANS[id];
  return {
    name: def.name,
    pricePerSeat: def.pricePerSeat,
    annualPricePerSeat: def.annualPricePerSeat,
    maxFeedbackPerMonth: def.maxFeedbackPerMonth,
    maxMembers: def.maxMembers,
    aiImprovementsPerMonth: def.aiImprovementsPerMonth,
    insightsEnabled: def.insightsAccess,
    customBranding: def.customBranding,
    prioritySupport: def.prioritySupport,
  };
}

/**
 * GET /api/admin/plans
 * Returns all plan documents from Firestore, merged with code defaults.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }
  const snapshot = await adminDb.collection(PLANS_COLLECTION).get();
  const byId = new Map<string, PlanDoc>();
  snapshot.docs.forEach((d) => {
    byId.set(d.id, d.data() as PlanDoc);
  });
  const planIds: PlanId[] = ["starter", "business", "enterprise"];
  const plans: PlanWithId[] = planIds.map((id) => {
    const stored = byId.get(id);
    const base = defaultPlanDoc(id);
    return {
      id,
      name: stored?.name ?? base.name,
      pricePerSeat: stored?.pricePerSeat !== undefined ? stored.pricePerSeat : base.pricePerSeat,
      annualPricePerSeat:
        stored?.annualPricePerSeat !== undefined
          ? stored.annualPricePerSeat
          : base.annualPricePerSeat,
      maxFeedbackPerMonth:
        stored?.maxFeedbackPerMonth !== undefined
          ? stored.maxFeedbackPerMonth
          : base.maxFeedbackPerMonth,
      maxMembers: stored?.maxMembers !== undefined ? stored.maxMembers : base.maxMembers,
      aiImprovementsPerMonth:
        stored?.aiImprovementsPerMonth !== undefined
          ? stored.aiImprovementsPerMonth
          : base.aiImprovementsPerMonth,
      insightsEnabled: stored?.insightsEnabled ?? base.insightsEnabled,
      customBranding: stored?.customBranding ?? base.customBranding,
      prioritySupport: stored?.prioritySupport ?? base.prioritySupport,
    };
  });
  return apiSuccess(plans);
}

/**
 * PATCH /api/admin/plans
 * Body: { id: string, ...partial PlanDoc }
 * Updates a plan document. Creates if missing.
 */
export async function PATCH(req: Request) {
  let admin;
  try {
    admin = await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }
  let body: { id?: string } & Partial<PlanDoc>;
  try {
    body = await req.json();
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON", status: 400 });
  }
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return apiError({ code: "INVALID_INPUT", message: "id is required", status: 400 });
  }
  const { id: _id, ...updates } = body;
  const ref = adminDb.doc(`${PLANS_COLLECTION}/${id}`);
  const payload: Partial<PlanDoc> = {};
  if (typeof updates.name === "string") payload.name = updates.name;
  if (updates.pricePerSeat !== undefined) payload.pricePerSeat = updates.pricePerSeat;
  if (updates.annualPricePerSeat !== undefined) payload.annualPricePerSeat = updates.annualPricePerSeat;
  if (updates.maxFeedbackPerMonth !== undefined) payload.maxFeedbackPerMonth = updates.maxFeedbackPerMonth;
  if (updates.maxMembers !== undefined) payload.maxMembers = updates.maxMembers;
  if (updates.aiImprovementsPerMonth !== undefined) payload.aiImprovementsPerMonth = updates.aiImprovementsPerMonth;
  if (typeof updates.insightsEnabled === "boolean") payload.insightsEnabled = updates.insightsEnabled;
  if (typeof updates.customBranding === "boolean") payload.customBranding = updates.customBranding;
  if (typeof updates.prioritySupport === "boolean") payload.prioritySupport = updates.prioritySupport;
  if (Object.keys(payload).length === 0) {
    return apiError({ code: "INVALID_INPUT", message: "No fields to update", status: 400 });
  }
  try {
    await ref.set(payload, { merge: true });
    invalidatePlanCatalogCache();
    await logAdminAction({
      adminId: admin.uid,
      action: "plans.update",
      metadata: { planId: id, updates: payload },
    });
    return apiSuccess({ id });
  } catch (err) {
    console.error("PATCH /api/admin/plans:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to update plan", status: 500 });
  }
}
