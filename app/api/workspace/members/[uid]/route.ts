import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { workspaceGuardErrorResponse } from "@/lib/server/workspaceGuardErrorResponse";
import {
  getWorkspaceMemberRepo,
  getWorkspaceMembersRepo,
  removeWorkspaceMemberRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getPaymentProvider } from "@/lib/billing/payments";
import { setWorkspaceClaims } from "@/lib/server/setWorkspaceClaim";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid: targetUid } = await params;

  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  if (targetUid === user.uid) {
    return apiError({ code: "INVALID_INPUT", message: "CANNOT_REMOVE_SELF", status: 400 });
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);

    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    if (callerMember?.role !== "OWNER") {
      return apiError({ code: "FORBIDDEN", message: "Only workspace owners can remove members", status: 403 });
    }

    const targetMember = await getWorkspaceMemberRepo(workspaceId, targetUid);
    if (!targetMember) {
      return apiError({ code: "NOT_FOUND", message: "Member not found", status: 404 });
    }
    if (targetMember.role === "OWNER") {
      const allMembers = await getWorkspaceMembersRepo(workspaceId);
      const ownerCount = allMembers.filter((m) => m.role === "OWNER").length;
      if (ownerCount <= 1) {
        return apiError({
          code: "INVALID_INPUT",
          message: "LAST_OWNER",
          status: 400,
        });
      }
    }

    await removeWorkspaceMemberRepo(workspaceId, targetUid);

    // Re-read workspace after atomic member decrement to get accurate count for the payment provider
    const updatedWorkspace = await getWorkspace(workspaceId);
    const actualMemberCount = updatedWorkspace?.usage?.members ?? 1;

    if (
      updatedWorkspace?.billing?.plan === "business" &&
      updatedWorkspace.billing.subscriptionId
    ) {
      try {
        const newSeatCount = Math.max(actualMemberCount, 1);
        await getPaymentProvider().updateSubscriptionSeats(
          updatedWorkspace.billing.subscriptionId,
          newSeatCount
        );
        await adminDb.doc(`workspaces/${workspaceId}`).update({
          "billing.seats": newSeatCount,
        });
      } catch (providerErr) {
        console.error("[member remove] failed to sync subscription seats:", providerErr);
      }
    }

    // Repoint the removed user's active-workspace pointer and clear their auth
    // claims. removeWorkspaceMemberRepo already arrayRemove'd workspaceId from
    // users/{targetUid}.workspaceMemberships, but it leaves
    // users/{targetUid}.workspaceId and the Firebase custom claims pointing at
    // the workspace they were just removed from — which lets the self-heal
    // sites re-grant access permanently. Read fresh so the arrayRemove is
    // reflected.
    try {
      const targetUserSnap = await adminDb.doc(`users/${targetUid}`).get();
      const targetUserData = targetUserSnap.data() ?? {};
      const remainingMemberships: string[] = Array.isArray(
        targetUserData.workspaceMemberships
      )
        ? (targetUserData.workspaceMemberships as unknown[]).filter(
            (v): v is string =>
              typeof v === "string" && v.trim() !== "" && v !== workspaceId
          )
        : [];

      // Deterministic pick: first remaining workspace, or null if none.
      const newActiveWorkspaceId: string | null =
        remainingMemberships[0] ?? null;

      await adminDb.doc(`users/${targetUid}`).update({
        workspaceId: newActiveWorkspaceId,
      });

      await setWorkspaceClaims(
        targetUid,
        newActiveWorkspaceId,
        remainingMemberships
      );
    } catch (claimErr) {
      // Removal already succeeded (membership doc is deleted). Don't 500 — the
      // stale claim expires naturally and server-side resolution already
      // rejects the removed workspace.
      console.error(
        `[member remove] failed to repoint/clear claims for ${targetUid}:`,
        claimErr
      );
    }

    return apiSuccess({ success: true });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;

    console.error("DELETE /api/workspace/members/[uid]:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to remove member", status: 500 });
  }
}
