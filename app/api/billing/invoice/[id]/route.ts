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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const { id } = await params;
    if (!id) {
      return apiError({ code: "INVALID_INPUT", message: "Missing transaction id", status: 400 });
    }

    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
    }

    assertWorkspaceActive(workspace, { allowSuspended: true });

    if (workspace.ownerId !== user.uid) {
      return apiError({
        code: "FORBIDDEN",
        message: "Only the workspace owner can download invoices",
        status: 403,
      });
    }

    const customerId = workspace.billing?.customerId;
    if (!customerId) {
      return apiError({
        code: "INVALID_INPUT",
        message: "No billing account found",
        status: 400,
      });
    }

    // Verify the transaction belongs to this workspace's customer before
    // exposing its invoice.
    const provider = getPaymentProvider();
    const txCustomerId = await provider.getTransactionCustomerId(id);
    if (txCustomerId !== customerId) {
      return apiError({
        code: "FORBIDDEN",
        message: "Transaction does not belong to this workspace",
        status: 403,
      });
    }

    const url = await provider.getInvoicePdfUrl(id);
    if (!url) {
      return apiError({
        code: "NOT_FOUND",
        message: "No invoice available for this transaction yet",
        status: 404,
      });
    }

    return apiSuccess({ url });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;
    console.error("[billing invoice] failed:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to load invoice",
      status: 500,
    });
  }
}
