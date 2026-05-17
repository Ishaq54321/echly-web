import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { requireAdmin } from "@/lib/server/adminAuth";
import { logAdminAction } from "@/lib/admin/adminLogs";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import { getPaymentProvider } from "@/lib/billing/payments";
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
 *   set_manual_override    — { plan: PlanId, seats: number } — grant a comp: sets
 *                            billing.manualOverride=true, plan, seats, suspended=false,
 *                            and clears subscriptionId. Provider webhooks then
 *                            skip downgrade/suspend for this workspace.
 *   remove_manual_override — sets billing.manualOverride=false. Leaves the workspace on
 *                            its current plan until a real billing event mutates it.
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
        const newPlan = plan as PlanId;

        // Hybrid logic needs workspace state — was previously a blind .update().
        const wsSnap = await ref.get();
        const ws = wsSnap.data() as
          | {
              billing?: {
                plan?: string;
                manualOverride?: boolean;
                subscriptionId?: string | null;
                billingCycle?: string;
              };
            }
          | undefined;

        if (!ws) {
          return apiError({
            code: "NOT_FOUND",
            message: "Workspace not found",
            status: 404,
          });
        }

        const isManualOverride = ws.billing?.manualOverride === true;
        const hasSubscription = !!ws.billing?.subscriptionId;

        // Case A: comp adjustment — Firestore-only, never touch the provider.
        if (isManualOverride) {
          const catalog = await getPlanCatalog();
          const entry = catalog[newPlan] ?? catalog.starter;
          await ref.update({
            "billing.plan": newPlan,
            "billing.pricePerSeat": entry.pricePerSeat ?? 0,
            updatedAt: FieldValue.serverTimestamp(),
          });
          await logAdminAction({
            adminId: admin.uid,
            action: "admin_set_plan_comp",
            workspaceId,
            metadata: { previousPlan: ws.billing?.plan ?? null, newPlan },
          });
          return apiSuccess({ workspaceId, action, plan: newPlan, mode: "comp" });
        }

        // Case B: real paid subscription — sync to the provider. The
        // subscription.updated webhook is the single Firestore writer here.
        if (hasSubscription) {
          // Enterprise has no provider price — comp-only / sales-led.
          if (newPlan === "enterprise") {
            return apiError({
              code: "ENTERPRISE_REQUIRES_MANUAL_OVERRIDE",
              message:
                "Enterprise plan has no Paddle price. Use set_manual_override to grant Enterprise access.",
              status: 400,
            });
          }

          // Downgrading a paid workspace to Starter means "cancel the
          // subscription" — out of scope for set_plan.
          if (newPlan === "starter") {
            return apiError({
              code: "CANNOT_DOWNGRADE_PAID_TO_STARTER",
              message:
                "To downgrade a paid workspace to Starter, cancel the subscription instead.",
              status: 400,
            });
          }

          // newPlan === "business" — sync to the provider.
          const subscriptionId = ws.billing?.subscriptionId as string;
          const provider = getPaymentProvider();
          const cycle =
            ws.billing?.billingCycle === "annual" ? "annual" : "monthly";
          const newPriceId = provider.resolveBusinessPriceId(cycle);

          try {
            await provider.updateSubscriptionPlan(
              subscriptionId,
              newPriceId,
              "prorated_immediately"
            );
          } catch (err) {
            console.error("[admin set_plan] provider update failed:", err);
            return apiError({
              code: "PROVIDER_UPDATE_FAILED",
              message:
                "Failed to update subscription with payment provider",
              status: 500,
            });
          }

          // DON'T write Firestore here — the subscription.updated webhook is
          // the single writer for paid subscriptions.
          await logAdminAction({
            adminId: admin.uid,
            action: "admin_set_plan_paid_synced",
            workspaceId,
            metadata: {
              previousPlan: ws.billing?.plan ?? null,
              newPlan,
              subscriptionId,
              priceId: newPriceId,
            },
          });
          return apiSuccess({
            workspaceId,
            action,
            plan: newPlan,
            mode: "paid_synced",
          });
        }

        // Case C: never paid, no comp — soft-error.
        await logAdminAction({
          adminId: admin.uid,
          action: "admin_set_plan_rejected_never_paid",
          workspaceId,
          metadata: { attemptedPlan: newPlan },
        });
        return apiError({
          code: "NEVER_PAID_REQUIRES_MANUAL_OVERRIDE",
          message:
            "This workspace has no subscription. Use set_manual_override to grant a comp plan, or have the user subscribe via the normal upgrade flow.",
          status: 400,
        });
      }

      case "set_manual_override": {
        const plan = typeof body.plan === "string" ? body.plan.trim().toLowerCase() : "";
        if (!VALID_PLANS.includes(plan as PlanId)) {
          return apiError({
            code: "INVALID_INPUT",
            message: "plan must be one of: starter, business, enterprise",
            status: 400,
          });
        }
        const seats = body.seats;
        if (typeof seats !== "number" || !Number.isInteger(seats) || seats < 1) {
          return apiError({
            code: "INVALID_INPUT",
            message: "seats must be a positive integer",
            status: 400,
          });
        }
        const catalog = await getPlanCatalog();
        const entry = catalog[plan as PlanId] ?? catalog.starter;
        await ref.update({
          "billing.manualOverride": true,
          "billing.plan": plan,
          "billing.seats": seats,
          "billing.pricePerSeat": entry.pricePerSeat ?? 0,
          "billing.suspended": false,
          // Comp has no real subscription — clear any stale legacy sub id so
          // provider webhooks for an old sub can't match this workspace.
          "billing.subscriptionId": null,
          updatedAt: FieldValue.serverTimestamp(),
        });
        await logAdminAction({
          adminId: admin.uid,
          action: "workspace.set_manual_override",
          metadata: { workspaceId, plan, seats },
        });
        return apiSuccess({ workspaceId, action, plan, seats });
      }

      case "remove_manual_override":
        await ref.update({
          "billing.manualOverride": false,
          updatedAt: FieldValue.serverTimestamp(),
        });
        await logAdminAction({
          adminId: admin.uid,
          action: "workspace.remove_manual_override",
          metadata: { workspaceId },
        });
        return apiSuccess({ workspaceId, action });

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

      case "cancel_subscription": {
        const effective =
          body.effective === "immediately" ? "immediately" : "next_billing_period";

        const wsSnap = await ref.get();
        const ws = wsSnap.data() as
          | { billing?: { subscriptionId?: string | null; manualOverride?: boolean; plan?: string } }
          | undefined;

        if (!ws) {
          return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
        }

        if (ws.billing?.manualOverride === true) {
          return apiError({
            code: "INVALID_INPUT",
            message: "Workspace has a manual override. Use remove_manual_override first.",
            status: 400,
          });
        }

        const subscriptionId = ws.billing?.subscriptionId;
        if (!subscriptionId) {
          return apiError({
            code: "INVALID_INPUT",
            message: "Workspace has no subscription to cancel.",
            status: 400,
          });
        }

        try {
          await getPaymentProvider().cancelSubscription(
            subscriptionId,
            effective === "next_billing_period"
          );
        } catch (err) {
          console.error("[admin cancel_subscription] provider failed:", err);
          return apiError({
            code: "INTERNAL_ERROR",
            message: "Provider cancellation failed",
            status: 500,
          });
        }

        // DON'T write Firestore — the subscription_canceled webhook is the single writer.
        await logAdminAction({
          adminId: admin.uid,
          action: "admin_cancel_subscription",
          workspaceId,
          metadata: { subscriptionId, effective },
        });

        return apiSuccess({ workspaceId, action, effective });
      }

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
