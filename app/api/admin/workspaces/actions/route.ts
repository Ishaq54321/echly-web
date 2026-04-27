import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { requireAdmin } from "@/lib/server/adminAuth";
import { logAdminAction } from "@/lib/admin/adminLogs";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import type { PlanId } from "@/lib/billing/plans";

const VALID_PLANS: PlanId[] = ["starter", "business", "enterprise"];

/**
 * POST /api/admin/workspaces/actions
 * Body: { workspaceId, action, ...actionParams }
 *
 * Actions:
 *   suspend              — set billing.suspended = true
 *   resume               — set billing.suspended = false
 *   set_plan             — { plan: PlanId } — change workspace plan
 *   override_feedback_limit — { feedbackLimit: number } — set entitlements.maxFeedbackPerMonth
 *   grant_unlimited_feedback — set entitlements.maxFeedbackPerMonth = null (unlimited)
 *   remove_feedback_override — remove entitlements.maxFeedbackPerMonth override
 */
export async function POST(req: Request) {
  let admin;
  try {
    admin = await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON", status: 400 });
  }

  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId.trim() : "";
  const action = typeof body.action === "string" ? body.action.trim() : "";

  if (!workspaceId) {
    return apiError({ code: "INVALID_INPUT", message: "workspaceId is required", status: 400 });
  }
  if (!action) {
    return apiError({ code: "INVALID_INPUT", message: "action is required", status: 400 });
  }

  const ref = adminDb.doc(`workspaces/${workspaceId}`);

  try {
    switch (action) {
      case "suspend":
        await ref.update({ "billing.suspended": true, updatedAt: FieldValue.serverTimestamp() });
        await logAdminAction({ adminId: admin.uid, action: "workspace.suspend", metadata: { workspaceId } });
        return apiSuccess({ workspaceId, action });

      case "resume":
        await ref.update({ "billing.suspended": false, updatedAt: FieldValue.serverTimestamp() });
        await logAdminAction({ adminId: admin.uid, action: "workspace.resume", metadata: { workspaceId } });
        return apiSuccess({ workspaceId, action });

      case "set_plan": {
        const plan = typeof body.plan === "string" ? body.plan.trim().toLowerCase() : "";
        if (!VALID_PLANS.includes(plan as PlanId)) {
          return apiError({
            code: "INVALID_INPUT",
            message: "plan must be one of: starter, business, enterprise",
            status: 400,
          });
        }
        const catalog = await getPlanCatalog();
        const entry = catalog[plan as PlanId] ?? catalog.starter;
        await ref.update({
          "billing.plan": plan,
          "billing.pricePerSeat": entry.pricePerSeat ?? 0,
          updatedAt: FieldValue.serverTimestamp(),
        });
        await logAdminAction({
          adminId: admin.uid,
          action: "workspace.set_plan",
          metadata: { workspaceId, plan },
        });
        return apiSuccess({ workspaceId, action, plan });
      }

      case "override_feedback_limit": {
        const feedbackLimit = body.feedbackLimit;
        if (typeof feedbackLimit !== "number" || feedbackLimit < 0) {
          return apiError({
            code: "INVALID_INPUT",
            message: "feedbackLimit must be a non-negative number",
            status: 400,
          });
        }
        await ref.update({
          "entitlements.maxFeedbackPerMonth": feedbackLimit,
          updatedAt: FieldValue.serverTimestamp(),
        });
        await logAdminAction({
          adminId: admin.uid,
          action: "workspace.override_feedback_limit",
          metadata: { workspaceId, feedbackLimit },
        });
        return apiSuccess({ workspaceId, action, feedbackLimit });
      }

      case "grant_unlimited_feedback":
        await ref.update({
          "entitlements.maxFeedbackPerMonth": null,
          updatedAt: FieldValue.serverTimestamp(),
        });
        await logAdminAction({
          adminId: admin.uid,
          action: "workspace.grant_unlimited_feedback",
          metadata: { workspaceId },
        });
        return apiSuccess({ workspaceId, action });

      case "remove_feedback_override":
        await ref.update({
          "entitlements.maxFeedbackPerMonth": FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        await logAdminAction({
          adminId: admin.uid,
          action: "workspace.remove_feedback_override",
          metadata: { workspaceId },
        });
        return apiSuccess({ workspaceId, action });

      default:
        return apiError({
          code: "INVALID_INPUT",
          message: `Unknown action: ${action}`,
          status: 400,
        });
    }
  } catch (err) {
    console.error(`POST /api/admin/workspaces/actions [${action}]:`, err);
    return apiError({ code: "INTERNAL_ERROR", message: "Action failed", status: 500 });
  }
}
