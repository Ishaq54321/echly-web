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
import { repointWorkspaceClaim } from "@/lib/server/repointWorkspaceClaim";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { sendMemberRemovedEmail } from "@/lib/email/workspaceEmails";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

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

    // Notion-style: seats are capacity. Member removal does NOT decrement seats —
    // the owner paid for the period and keeps the capacity until renewal. The vacated
    // seat can be filled by a different invite without extra charge.
    // (Future: at renewal time, we may want to right-size via invoice.upcoming webhook,
    //  but for v1 we accept that owners pay for purchased seats until they explicitly
    //  reduce via the Customer Portal or admin tools.)
    //
    // No-op. Firestore billing.seats stays as-is. Stripe quantity stays as-is.

    // Repoint the removed user's active-workspace pointer and clear their auth
    // claims. removeWorkspaceMemberRepo already arrayRemove'd workspaceId from
    // users/{targetUid}.workspaceMemberships, but it leaves
    // users/{targetUid}.workspaceId and the Firebase custom claims pointing at
    // the workspace they were just removed from — which lets the self-heal
    // sites re-grant access permanently.
    try {
      await repointWorkspaceClaim(targetUid, workspaceId);
    } catch (claimErr) {
      // Removal already succeeded (membership doc is deleted). Don't 500 — the
      // stale claim expires naturally and server-side resolution already
      // rejects the removed workspace.
      console.error(
        `[member remove] failed to repoint/clear claims for ${targetUid}:`,
        claimErr
      );
    }

    // Member-removed email. Removed user gets notified that they lost access.
    // Fire-and-forget so a transient email failure never blocks the removal.
    (async () => {
      try {
        const removedEmail = (targetMember.email ?? "").trim();
        if (!removedEmail) return;
        const removedName =
          (targetMember.displayName ?? "").trim() || removedEmail;
        const removerSnap = await adminDb.doc(`users/${user.uid}`).get();
        const removerData = (removerSnap.data() ?? {}) as Record<string, unknown>;
        const removerName =
          (typeof removerData.displayName === "string" &&
            removerData.displayName.trim()) ||
          (typeof user.email === "string" ? user.email : "") ||
          "your workspace owner";
        const workspaceName =
          (typeof workspace?.name === "string" && workspace.name.trim()) ||
          "your workspace";
        await sendMemberRemovedEmail({
          removedEmail,
          removedName,
          workspaceName,
          removerName,
          dashboardUrl: `${APP_URL}/dashboard`,
        });
      } catch (emailErr) {
        console.error("[member-removed-email] failed:", emailErr);
      }
    })();

    return apiSuccess({ success: true });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;

    console.error("DELETE /api/workspace/members/[uid]:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to remove member", status: 500 });
  }
}
