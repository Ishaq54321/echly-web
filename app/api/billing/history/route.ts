import "server-only";
import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { workspaceGuardErrorResponse } from "@/lib/server/workspaceGuardErrorResponse";
import { getPaymentProvider } from "@/lib/billing/payments";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
    }

    // Suspended workspaces should still be able to review their history.
    assertWorkspaceActive(workspace, { allowSuspended: true });

    if (workspace.ownerId !== user.uid) {
      return apiError({
        code: "FORBIDDEN",
        message: "Only the workspace owner can view billing history",
        status: 403,
      });
    }

    const customerId = workspace.billing?.customerId;
    if (!customerId) {
      return apiSuccess({ transactions: [] });
    }

    const transactions = await getPaymentProvider().listTransactions(customerId);
    return apiSuccess({ transactions });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;
    console.error("[billing history] failed:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to load billing history",
      status: 500,
    });
  }
}
