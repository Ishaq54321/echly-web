import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { workspaceGuardErrorResponse } from "@/lib/server/workspaceGuardErrorResponse";
import {
  getWorkspaceMemberRepo,
  softDeleteWorkspaceRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { sendWorkspaceDeletionConfirmationEmail } from "@/lib/email/workspaceEmails";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getPaymentProvider } from "@/lib/billing/payments";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  let body: { confirmName?: unknown };
  try {
    body = (await req.json()) as { confirmName?: unknown };
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace, { allowSuspended: true });
    if (!workspace) {
      return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
    }

    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    if (callerMember?.role !== "OWNER") {
      return apiError({ code: "FORBIDDEN", message: "Only the workspace owner can delete the workspace", status: 403 });
    }

    if (typeof body.confirmName !== "string" || body.confirmName !== workspace.name) {
      return apiError({ code: "INVALID_INPUT", message: "Workspace name confirmation does not match", status: 400 });
    }

    if (workspace.billing?.subscriptionId) {
      try {
        await getPaymentProvider().cancelSubscription(workspace.billing.subscriptionId, false);
      } catch (err) {
        console.error("Failed to cancel billing subscription on workspace delete:", err);
      }
    }

    await softDeleteWorkspaceRepo(workspaceId, user.uid);

    const purgeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Get owner email for notification
    const userSnap = await adminDb.doc(`users/${user.uid}`).get();
    const userData = (userSnap.data() ?? {}) as Record<string, unknown>;
    const ownerEmail = typeof userData.email === "string" ? userData.email : user.email;

    if (ownerEmail) {
      const deletionEmailResult = await sendWorkspaceDeletionConfirmationEmail({
        to: ownerEmail,
        workspaceName: workspace.name,
        purgeDate,
      });
      if (!deletionEmailResult.sent) {
        console.error(
          "DELETE /api/workspace: email send failed",
          deletionEmailResult.reason
        );
      }
    }

    return apiSuccess({
      success: true,
      purgeDate: purgeDate.toISOString(),
    });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;

    console.error("DELETE /api/workspace:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to delete workspace", status: 500 });
  }
}
