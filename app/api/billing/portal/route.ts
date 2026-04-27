import "server-only";
import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { getPaymentProvider } from "@/lib/billing/payments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
    assertWorkspaceActive(workspace);

    if (workspace.ownerId !== user.uid) {
      return apiError({
        code: "FORBIDDEN",
        message: "Only the workspace owner can manage billing",
        status: 403,
      });
    }

    const customerId = workspace.billing?.stripeCustomerId;
    if (!customerId) {
      return apiError({
        code: "INVALID_INPUT",
        message: "No billing account found. Please upgrade first.",
        status: 400,
      });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://echly.com";

    const provider = getPaymentProvider();
    const result = await provider.createPortalSession({
      customerId,
      returnUrl: `${origin}/settings?tab=billing`,
    });

    return apiSuccess({ portalUrl: result.portalUrl });
  } catch (err) {
    console.error("POST /api/billing/portal:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to create portal session", status: 500 });
  }
}
