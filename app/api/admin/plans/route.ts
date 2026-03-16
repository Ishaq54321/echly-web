import { NextResponse } from "next/server";
import { getDocs, doc, setDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAdmin } from "@/lib/server/adminAuth";
import { logAdminAction } from "@/lib/admin/adminLogs";
import type { PlanDoc } from "@/lib/admin/types";
import {
  PLANS as CODE_PLANS,
  type PlanId,
  DEFAULT_PRICES,
} from "@/lib/billing/plans";
const PLANS_COLLECTION = "plans";

export type PlanWithId = PlanDoc & { id: string };

function defaultPlanDoc(id: PlanId): PlanDoc {
  const config = CODE_PLANS[id];
  const prices = DEFAULT_PRICES[id];
  return {
    name: id.charAt(0).toUpperCase() + id.slice(1),
    priceMonthly: prices.priceMonthly,
    priceYearly: prices.priceYearly,
    maxSessions: config?.maxSessions ?? null,
    maxMembers: config?.maxMembers ?? null,
    insightsEnabled: config?.insightsAccess ?? false,
  };
}

/**
 * GET /api/admin/plans
 * Returns all plan documents from Firestore, merged with code defaults for free/starter/business/enterprise.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }
  const snapshot = await getDocs(collection(db, PLANS_COLLECTION));
  const byId = new Map<string, PlanDoc>();
  snapshot.docs.forEach((d) => {
    byId.set(d.id, d.data() as PlanDoc);
  });
  const planIds: PlanId[] = ["free", "starter", "business", "enterprise"];
  const plans: PlanWithId[] = planIds.map((id) => {
    const stored = byId.get(id);
    const base = defaultPlanDoc(id);
    return {
      id,
      name: stored?.name ?? base.name,
      priceMonthly: stored?.priceMonthly ?? base.priceMonthly,
      priceYearly: stored?.priceYearly ?? base.priceYearly,
      maxSessions: stored?.maxSessions !== undefined ? stored.maxSessions : base.maxSessions,
      maxMembers: stored?.maxMembers !== undefined ? stored.maxMembers : base.maxMembers,
      insightsEnabled: stored?.insightsEnabled ?? base.insightsEnabled,
    };
  });
  return NextResponse.json(plans);
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const { id: _id, ...updates } = body;
  const ref = doc(db, PLANS_COLLECTION, id);
  const payload: Partial<PlanDoc> = {};
  if (typeof updates.name === "string") payload.name = updates.name;
  if (typeof updates.priceMonthly === "number") payload.priceMonthly = updates.priceMonthly;
  if (typeof updates.priceYearly === "number") payload.priceYearly = updates.priceYearly;
  if (updates.maxSessions !== undefined) payload.maxSessions = updates.maxSessions;
  if (updates.maxMembers !== undefined) payload.maxMembers = updates.maxMembers;
  if (typeof updates.insightsEnabled === "boolean") payload.insightsEnabled = updates.insightsEnabled;
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  try {
    await setDoc(ref, payload, { merge: true });
    await logAdminAction({
      adminId: admin.uid,
      action: "plans.update",
      metadata: { planId: id, updates: payload },
    });
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("PATCH /api/admin/plans:", err);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
