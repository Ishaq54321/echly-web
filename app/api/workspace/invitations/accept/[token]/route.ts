import type { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import {
  requireAuth,
  tryGetAuthUser,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { workspaceGuardErrorResponse } from "@/lib/server/workspaceGuardErrorResponse";
import {
  getWorkspaceInvitationRepo,
  getWorkspaceMemberRepo,
  addWorkspaceMemberRepo,
  updateWorkspaceInvitationRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { addWorkspaceMembershipRepo } from "@/lib/repositories/usersRepository.server";
import { setWorkspaceClaims } from "@/lib/server/setWorkspaceClaim";
import {
  assertCanJoinAnotherWorkspace,
  WorkspaceLimitError,
  MAX_WORKSPACES_PER_USER,
} from "@/lib/domain/workspaceLimits";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getPaymentProvider } from "@/lib/billing/payments";
import { checkPlanLimit } from "@/lib/billing/checkPlanLimit";
import type { PlanLimitError } from "@/lib/billing/checkPlanLimit";
import { planLimitReachedApiError } from "@/lib/billing/planLimitResponse";
import { composeFullName } from "@/lib/utils/nameSplit";
import { logAdminAction } from "@/lib/admin/adminLogs";
import { sendInviteAcceptedEmail } from "@/lib/email/workspaceEmails";
import { sendSeatAddedEmail } from "@/lib/email/billingEmails";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

export const dynamic = "force-dynamic";

function isExpired(invitation: { expiresAt: unknown }): boolean {
  const ts = invitation.expiresAt as { toMillis?: () => number } | null | undefined;
  if (!ts || typeof ts.toMillis !== "function") return false;
  return ts.toMillis() < Date.now();
}

/** GET — public, returns invitation preview metadata */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const invitation = await getWorkspaceInvitationRepo(token);
    if (!invitation) {
      return apiError({ code: "NOT_FOUND", message: "Invitation not found", status: 404 });
    }
    if (invitation.status !== "pending") {
      return apiError({
        code: "INVALID_INPUT",
        message: "INVITE_INVALID",
        status: 400,
        data: { status: invitation.status },
      });
    }
    if (isExpired(invitation)) {
      await updateWorkspaceInvitationRepo(token, { status: "expired" });
      return apiError({ code: "INVALID_INPUT", message: "INVITE_EXPIRED", status: 400 });
    }

    return apiSuccess({
      workspaceName: invitation.workspaceName,
      invitedByName: invitation.invitedByName,
      role: invitation.role,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
    });
  } catch (err) {
    console.error("GET /api/workspace/invitations/accept/[token]:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to load invitation", status: 500 });
  }
}

/** POST — authenticated, accepts the invitation */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const invitation = await getWorkspaceInvitationRepo(token);
    if (!invitation) {
      return apiError({ code: "NOT_FOUND", message: "Invitation not found", status: 404 });
    }
    if (invitation.status !== "pending") {
      return apiError({
        code: "INVALID_INPUT",
        message: "INVITE_INVALID",
        status: 400,
        data: { status: invitation.status },
      });
    }
    if (isExpired(invitation)) {
      await updateWorkspaceInvitationRepo(token, { status: "expired" });
      return apiError({ code: "INVALID_INPUT", message: "INVITE_EXPIRED", status: 400 });
    }

    const callerEmail = user.email?.toLowerCase().trim() ?? "";
    if (!callerEmail || callerEmail !== invitation.email.toLowerCase()) {
      return apiError({ code: "FORBIDDEN", message: "EMAIL_MISMATCH", status: 403 });
    }

    const workspace = await getWorkspace(invitation.workspaceId);
    assertWorkspaceActive(workspace);

    // Already a member — mark accepted and return success
    const existingMember = await getWorkspaceMemberRepo(invitation.workspaceId, user.uid);
    if (existingMember) {
      await updateWorkspaceInvitationRepo(token, {
        status: "accepted",
        acceptedAt: Timestamp.now(),
        acceptedBy: user.uid,
      });
      return apiSuccess({
        workspaceId: invitation.workspaceId,
        workspaceName: invitation.workspaceName,
        role: existingMember.role,
      });
    }

    // Check member limit before adding new member
    const currentMembers = workspace!.usage?.members ?? 0;
    try {
      await checkPlanLimit({ workspace: workspace!, metric: "maxMembers", currentUsage: currentMembers });
    } catch (err) {
      if ((err as PlanLimitError).code === "PLAN_LIMIT_REACHED") {
        return apiError(planLimitReachedApiError(err as PlanLimitError));
      }
      throw err;
    }

    // Fetch caller profile for member doc
    const profileSnap = await adminDb.doc(`users/${user.uid}`).get();
    const profile = (profileSnap.data() ?? {}) as Record<string, unknown>;

    // Enforce per-user workspace cap
    const currentMemberships: string[] = Array.isArray(profile.workspaceMemberships)
      ? (profile.workspaceMemberships as unknown[]).filter(
          (v): v is string => typeof v === "string" && v.trim() !== ""
        )
      : [];
    try {
      assertCanJoinAnotherWorkspace(currentMemberships, invitation.workspaceId);
    } catch (err) {
      if (err instanceof WorkspaceLimitError) {
        return apiError({
          code: "FORBIDDEN",
          message: `You're in the maximum ${MAX_WORKSPACES_PER_USER} workspaces. Please contact the Annote team to be added to more, or leave one of your current workspaces.`,
          status: 403,
          data: {
            reason: "WORKSPACE_LIMIT_REACHED",
            currentCount: err.currentCount,
            max: MAX_WORKSPACES_PER_USER,
          },
        });
      }
      throw err;
    }

    const composedProfileName = composeFullName(
      typeof profile.firstName === "string" ? profile.firstName : null,
      typeof profile.lastName === "string" ? profile.lastName : null
    );
    const profileEmailLocal =
      typeof profile.email === "string" ? profile.email.split("@")[0] ?? "" : "";
    await addWorkspaceMemberRepo(invitation.workspaceId, {
      uid: user.uid,
      email: callerEmail,
      displayName: composedProfileName || profileEmailLocal || null,
      avatarUrl: typeof profile.avatarUrl === "string" ? profile.avatarUrl : null,
      role: invitation.role,
      joinedAt: Timestamp.now(),
      invitedBy: invitation.invitedBy,
    });

    await updateWorkspaceInvitationRepo(token, {
      status: "accepted",
      acceptedAt: Timestamp.now(),
      acceptedBy: user.uid,
    });

    // WS-005 FIX: always add to workspaceMemberships
    // Only update active workspaceId if they have none yet
    await addWorkspaceMembershipRepo(user.uid, invitation.workspaceId);

    // Re-read workspace after atomic member increment to get accurate count for the payment provider
    const updatedWorkspace = await getWorkspace(invitation.workspaceId);
    const actualMemberCount = updatedWorkspace?.usage?.members ?? 1;

    // ─── Seat capacity sync (Notion-style: grow-only) ──────────────────
    // If members now exceed the purchased seats, grow Stripe + Firestore.
    // On failure, we cannot roll back the member-add (already committed via
    // FieldValue.increment), so we mark the workspace for reconciliation.
    let seatGrew = false;
    let seatGrowNewCount = 0;
    let seatProrationPreview:
      | {
          amountCents: number;
          currency: string;
          prorationDate: Date;
          nextBillingDate: Date;
        }
      | null = null;
    if (
      updatedWorkspace?.billing?.plan === "business" &&
      updatedWorkspace.billing.subscriptionId
    ) {
      const currentSeats = updatedWorkspace.billing.seats ?? 1;

      if (actualMemberCount > currentSeats) {
        const newSeatCount = actualMemberCount;
        const provider = getPaymentProvider();
        // Preview proration BEFORE growing seats so the email reflects the
        // exact amount Stripe will charge. If the preview fails we still
        // proceed with the grow and degrade the email to no-amount copy.
        if (provider.previewSeatChange) {
          try {
            seatProrationPreview = await provider.previewSeatChange(
              updatedWorkspace.billing.subscriptionId,
              newSeatCount
            );
          } catch (previewErr) {
            console.error(
              "[invite accept] proration preview failed (continuing):",
              previewErr
            );
            seatProrationPreview = null;
          }
        }
        try {
          await provider.updateSubscriptionSeats(
            updatedWorkspace.billing.subscriptionId,
            newSeatCount
          );
          await adminDb.doc(`workspaces/${invitation.workspaceId}`).update({
            "billing.seats": newSeatCount,
          });
          seatGrew = true;
          seatGrowNewCount = newSeatCount;
        } catch (providerErr) {
          // Stripe sync failed AFTER the member was added. We cannot roll back
          // the member-add atomically, so we record the divergence for an
          // out-of-band reconciliation. The owner is currently UNDER-BILLED:
          // they have N members but Stripe is billing for N-1 seats.
          console.error(
            "[invite accept] Stripe seat sync FAILED — workspace under-billed",
            {
              workspaceId: invitation.workspaceId,
              subscriptionId: updatedWorkspace.billing.subscriptionId,
              actualMemberCount,
              billedSeats: currentSeats,
              error: providerErr,
            }
          );
          await adminDb.doc(`workspaces/${invitation.workspaceId}`).update({
            "billing.seatSyncFailedAt": FieldValue.serverTimestamp(),
            "billing.seatSyncExpectedCount": newSeatCount,
            "billing.seatSyncCurrentCount": currentSeats,
          });
          try {
            await logAdminAction({
              adminId: "system",
              action: "seat_sync_failed",
              workspaceId: invitation.workspaceId,
              metadata: {
                expectedSeats: newSeatCount,
                currentSeats,
                subscriptionId: updatedWorkspace.billing.subscriptionId,
                errorMessage:
                  providerErr instanceof Error
                    ? providerErr.message
                    : String(providerErr),
              },
            });
          } catch {
            // logAdminAction failure shouldn't propagate
          }
        }
      }
      // else: member fits within existing seats — no Stripe call needed.
    }

    const userRef = adminDb.doc(`users/${user.uid}`);

    // Always switch user to the newly joined workspace
    await userRef.set(
      {
        workspaceId: invitation.workspaceId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    const updatedMemberships = currentMemberships.includes(invitation.workspaceId)
      ? currentMemberships
      : [...currentMemberships, invitation.workspaceId];
    await setWorkspaceClaims(user.uid, invitation.workspaceId, updatedMemberships);

    // ─── Email notifications (fire-and-forget) ────────────────────────
    // Skip the inviteAccepted email if the acceptor is the inviter (rare
    // self-test scenario). Inviter doc lookup is best-effort; missing email
    // or doc => skip silently.
    const acceptedByDisplayName =
      composedProfileName ||
      profileEmailLocal ||
      callerEmail ||
      "A new member";

    if (invitation.invitedBy && invitation.invitedBy !== user.uid) {
      void (async () => {
        try {
          const inviterSnap = await adminDb
            .doc(`users/${invitation.invitedBy}`)
            .get();
          const inviterData = (inviterSnap.data() ?? {}) as Record<string, unknown>;
          const inviterEmail =
            typeof inviterData.email === "string" ? inviterData.email : null;
          if (!inviterEmail) return;
          const inviterFullName =
            composeFullName(
              typeof inviterData.firstName === "string" ? inviterData.firstName : null,
              typeof inviterData.lastName === "string" ? inviterData.lastName : null
            ) ||
            (typeof inviterData.displayName === "string" ? inviterData.displayName : "") ||
            invitation.invitedByName ||
            "there";

          const workspaceMembersUrl = `${APP_URL}/settings?tab=workspace`;
          const acceptedResult = await sendInviteAcceptedEmail({
            inviterUid: invitation.invitedBy,
            inviterName: inviterFullName,
            acceptedByName: acceptedByDisplayName,
            acceptedByEmail: callerEmail,
            workspaceName: invitation.workspaceName,
            memberCount: actualMemberCount,
            workspaceMembersUrl,
          });
          if (!acceptedResult.sent) {
            console.error(
              "[invite accept] inviteAccepted email failed:",
              acceptedResult.reason
            );
          }

          // Seat-added (founder voice) — only when Stripe seats actually grew.
          // Send to the workspace OWNER (not necessarily the inviter), since
          // that's whose card is charged. If owner === inviter, the inviter
          // gets both emails — by design (they're complementary).
          if (
            seatGrew &&
            updatedWorkspace?.ownerId &&
            updatedWorkspace.billing?.plan === "business"
          ) {
            try {
              const ownerSnap = await adminDb
                .doc(`users/${updatedWorkspace.ownerId}`)
                .get();
              const ownerData = (ownerSnap.data() ?? {}) as Record<string, unknown>;
              const ownerEmail =
                typeof ownerData.email === "string" ? ownerData.email : null;
              if (!ownerEmail) return;
              const ownerFullName =
                composeFullName(
                  typeof ownerData.firstName === "string" ? ownerData.firstName : null,
                  typeof ownerData.lastName === "string" ? ownerData.lastName : null
                ) ||
                (typeof ownerData.displayName === "string"
                  ? ownerData.displayName
                  : "") ||
                "there";

              const fallbackNextBilling = (() => {
                const ts = updatedWorkspace.billing?.nextBilledAt as
                  | { toMillis?: () => number }
                  | null
                  | undefined;
                if (ts && typeof ts.toMillis === "function") {
                  return new Date(ts.toMillis());
                }
                return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              })();

              const seatResult = await sendSeatAddedEmail({
                ownerEmail,
                ownerName: ownerFullName,
                workspaceName: invitation.workspaceName,
                newSeatCount: seatGrowNewCount,
                acceptedByName: acceptedByDisplayName,
                prorationAmountCents: seatProrationPreview?.amountCents ?? null,
                prorationCurrency: seatProrationPreview?.currency ?? null,
                nextBillingDate:
                  seatProrationPreview?.nextBillingDate ?? fallbackNextBilling,
                billingUrl: `${APP_URL}/settings?tab=billing`,
              });
              if (!seatResult.sent) {
                console.error(
                  "[invite accept] seatAdded email failed:",
                  seatResult.reason
                );
              }
            } catch (ownerLookupErr) {
              console.error(
                "[invite accept] owner lookup for seatAdded email failed:",
                ownerLookupErr
              );
            }
          }
        } catch (emailErr) {
          console.error("[invite accept] post-accept email block failed:", emailErr);
        }
      })();
    }

    return apiSuccess({
      workspaceId: invitation.workspaceId,
      workspaceName: invitation.workspaceName,
      role: invitation.role,
      switchedToWorkspaceId: invitation.workspaceId,
    });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;

    console.error("POST /api/workspace/invitations/accept/[token]:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to accept invitation", status: 500 });
  }
}
