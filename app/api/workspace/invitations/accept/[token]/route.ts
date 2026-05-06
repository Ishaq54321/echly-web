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
import {
  getWorkspaceInvitationRepo,
  getWorkspaceMemberRepo,
  addWorkspaceMemberRepo,
  updateWorkspaceInvitationRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { addWorkspaceMembershipRepo } from "@/lib/repositories/usersRepository.server";
import { setWorkspaceClaim } from "@/lib/server/setWorkspaceClaim";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getPaymentProvider } from "@/lib/billing/payments";
import { checkPlanLimit } from "@/lib/billing/checkPlanLimit";
import type { PlanLimitError } from "@/lib/billing/checkPlanLimit";
import { planLimitReachedApiError } from "@/lib/billing/planLimitResponse";
import { composeFullName } from "@/lib/utils/nameSplit";

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

    // Re-read workspace after atomic member increment to get accurate count for Stripe
    const updatedWorkspace = await getWorkspace(invitation.workspaceId);
    const actualMemberCount = updatedWorkspace?.usage?.members ?? 1;

    if (
      updatedWorkspace?.billing?.plan === "business" &&
      updatedWorkspace.billing.stripeSubscriptionId
    ) {
      try {
        const newSeatCount = Math.max(actualMemberCount, 1);
        await getPaymentProvider().updateSubscriptionSeats(
          updatedWorkspace.billing.stripeSubscriptionId,
          newSeatCount
        );
        await adminDb.doc(`workspaces/${invitation.workspaceId}`).update({
          "billing.seats": newSeatCount,
        });
      } catch (stripeErr) {
        console.error("[invite accept] failed to sync Stripe seats:", stripeErr);
      }
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
    await setWorkspaceClaim(user.uid, invitation.workspaceId);

    return apiSuccess({
      workspaceId: invitation.workspaceId,
      workspaceName: invitation.workspaceName,
      role: invitation.role,
      switchedToWorkspaceId: invitation.workspaceId,
    });
  } catch (err) {
    console.error("POST /api/workspace/invitations/accept/[token]:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to accept invitation", status: 500 });
  }
}
