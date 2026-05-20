import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { workspaceGuardErrorResponse } from "@/lib/server/workspaceGuardErrorResponse";
import {
  getWorkspaceMemberRepo,
  transferWorkspaceOwnershipRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { setWorkspaceClaims } from "@/lib/server/setWorkspaceClaim";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getPaymentProvider } from "@/lib/billing/payments";
import {
  sendOwnershipTransferredOldEmail,
  sendOwnershipTransferredNewEmail,
} from "@/lib/email/workspaceEmails";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import type { PlanId } from "@/lib/billing/plans";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  let body: { newOwnerUid?: unknown; confirmName?: unknown };
  try {
    body = (await req.json()) as { newOwnerUid?: unknown; confirmName?: unknown };
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  if (typeof body.newOwnerUid !== "string" || !body.newOwnerUid.trim()) {
    return apiError({ code: "INVALID_INPUT", message: "newOwnerUid is required", status: 400 });
  }
  const newOwnerUid = body.newOwnerUid.trim();

  if (newOwnerUid === user.uid) {
    return apiError({ code: "INVALID_INPUT", message: "ALREADY_OWNER", status: 400 });
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);
    if (!workspace) {
      return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
    }

    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    if (callerMember?.role !== "OWNER") {
      return apiError({ code: "FORBIDDEN", message: "Only the workspace owner can transfer ownership", status: 403 });
    }

    // Verify confirmation name matches exactly
    if (typeof body.confirmName !== "string" || body.confirmName !== workspace.name) {
      return apiError({ code: "INVALID_INPUT", message: "Workspace name confirmation does not match", status: 400 });
    }

    const newOwnerMember = await getWorkspaceMemberRepo(workspaceId, newOwnerUid);
    if (!newOwnerMember) {
      return apiError({ code: "NOT_FOUND", message: "NOT_A_MEMBER", status: 404 });
    }

    await transferWorkspaceOwnershipRepo(workspaceId, user.uid, newOwnerUid);

    // Sync the Stripe customer email to the new owner so Stripe Dashboard,
    // hosted receipts, and the Customer Portal all show the right person.
    // Echly-side billing emails already auto-route via the webhook's per-event
    // ownerId→email lookup (see app/api/billing/webhook getWorkspaceContext),
    // so this only fixes the Stripe-visible email.
    //
    // Skipped when there's no Stripe customer (Starter or comp workspaces).
    // Non-fatal: the transfer has already committed, so a Stripe failure must
    // not surface as a 500 — worst case Stripe's email lags until the next
    // manual sync.
    const wsBilling = (workspace as { billing?: { customerId?: string | null } })
      .billing;
    const customerId = wsBilling?.customerId ?? null;
    if (customerId) {
      try {
        const newOwnerSnap = await adminDb.doc(`users/${newOwnerUid}`).get();
        const newOwnerEmail = (newOwnerSnap.data() as { email?: string } | undefined)
          ?.email;
        if (newOwnerEmail && newOwnerEmail.trim()) {
          await getPaymentProvider().updateCustomerEmail(
            customerId,
            newOwnerEmail.trim()
          );
        }
      } catch (stripeErr) {
        console.error(
          "[ownership transfer] Failed to sync Stripe customer email (non-fatal):",
          stripeErr
        );
      }
    }

    // Refresh claims for both users (memberships unchanged on transfer, but
    // we still re-issue so token shape stays consistent).
    const [callerSnap, newOwnerSnap] = await Promise.all([
      adminDb.collection("users").doc(user.uid).get(),
      adminDb.collection("users").doc(newOwnerUid).get(),
    ]);
    function readMemberships(snap: FirebaseFirestore.DocumentSnapshot, activeWid: string): string[] {
      const raw = snap.data()?.workspaceMemberships;
      const list: string[] = Array.isArray(raw)
        ? (raw as unknown[]).filter(
            (v): v is string => typeof v === "string" && v.trim() !== ""
          )
        : [];
      if (!list.includes(activeWid)) list.push(activeWid);
      return list;
    }
    await Promise.allSettled([
      setWorkspaceClaims(user.uid, workspaceId, readMemberships(callerSnap, workspaceId)),
      setWorkspaceClaims(newOwnerUid, workspaceId, readMemberships(newOwnerSnap, workspaceId)),
    ]);

    // ─── Notify both parties (fire-and-forget) ────────────────────────
    // Security-significant event: previous + new owner both get email,
    // bypasses preferences (handled inside the helpers via sendEmailOrLog).
    // Must NOT block the route response.
    void (async () => {
      try {
        const callerData = (callerSnap.data() ?? {}) as {
          email?: string;
          displayName?: string;
          name?: string;
        };
        const newOwnerData = (newOwnerSnap.data() ?? {}) as {
          email?: string;
          displayName?: string;
          name?: string;
        };
        const previousOwnerEmail = callerData.email?.trim() ?? "";
        const newOwnerEmail = newOwnerData.email?.trim() ?? "";
        const previousOwnerName =
          (callerData.displayName ?? callerData.name ?? "").trim() ||
          previousOwnerEmail ||
          "the previous owner";
        const newOwnerName =
          (newOwnerData.displayName ?? newOwnerData.name ?? "").trim() ||
          newOwnerEmail ||
          "the new owner";

        // Pull billing summary for the new-owner email so the recipient
        // immediately sees what they're now financially responsible for.
        const wsBillingFull = (workspace as {
          billing?: {
            plan?: PlanId;
            seats?: number;
            billingCycle?: "monthly" | "annual";
            nextBilledAt?: { toDate?: () => Date } | Date | null;
          };
        }).billing;

        let planName: string | null = null;
        let priceFormatted: string | null = null;
        const seatCount = wsBillingFull?.seats ?? null;
        let nextBillingDate: Date | null = null;

        const rawNext = wsBillingFull?.nextBilledAt;
        if (rawNext) {
          if (rawNext instanceof Date) nextBillingDate = rawNext;
          else if (typeof (rawNext as { toDate?: () => Date }).toDate === "function") {
            nextBillingDate = (rawNext as { toDate: () => Date }).toDate();
          }
        }

        if (wsBillingFull?.plan && wsBillingFull.plan !== "starter") {
          try {
            const catalog = await getPlanCatalog();
            const entry = catalog[wsBillingFull.plan];
            if (entry) {
              const cycle = wsBillingFull.billingCycle ?? "monthly";
              planName =
                cycle === "annual" ? `${entry.name} Annual` : `${entry.name} Monthly`;
              const seats = seatCount ?? 1;
              if (cycle === "annual" && entry.annualPricePerSeat != null) {
                priceFormatted = `$${(seats * entry.annualPricePerSeat * 12).toFixed(2)}/year`;
              } else if (cycle === "monthly" && entry.pricePerSeat != null) {
                priceFormatted = `$${(seats * entry.pricePerSeat).toFixed(2)}/month`;
              }
            }
          } catch (catalogErr) {
            console.error(
              "[ownership transfer] plan catalog lookup failed (non-fatal):",
              catalogErr
            );
          }
        }

        const settingsUrl = `${APP_URL}/settings?tab=workspace`;

        await Promise.allSettled([
          previousOwnerEmail
            ? sendOwnershipTransferredOldEmail({
                previousOwnerEmail,
                previousOwnerName,
                workspaceName: workspace.name,
                newOwnerName,
                newOwnerEmail: newOwnerEmail || "the new owner",
              })
            : Promise.resolve({ sent: false, reason: "no-email" }),
          newOwnerEmail
            ? sendOwnershipTransferredNewEmail({
                newOwnerEmail,
                newOwnerName,
                previousOwnerName,
                workspaceName: workspace.name,
                planName,
                seatCount,
                nextBillingDate,
                priceFormatted,
                settingsUrl,
              })
            : Promise.resolve({ sent: false, reason: "no-email" }),
        ]);
      } catch (emailErr) {
        console.error(
          "[ownership transfer] ownership emails failed (non-fatal):",
          emailErr
        );
      }
    })().catch((err) =>
      console.error("[ownership transfer] email side-effect crashed:", err)
    );

    return apiSuccess({ success: true });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;

    console.error("PATCH /api/workspace/ownership:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to transfer ownership", status: 500 });
  }
}
