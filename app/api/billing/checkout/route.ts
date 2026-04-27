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
        message: "Only the workspace owner can upgrade",
        status: 403,
      });
    }

    const plan = workspace.billing?.plan ?? "starter";
    if (plan === "business" || plan === "enterprise") {
      return apiError({
        code: "INVALID_INPUT",
        message: "Already on a paid plan",
        status: 400,
      });
    }

    let body: { billingCycle?: unknown } = {};
    try {
      body = (await req.json()) as { billingCycle?: unknown };
    } catch {
      // default to monthly
    }

    const billingCycle: "monthly" | "annual" =
      body.billingCycle === "annual" ? "annual" : "monthly";

    const memberCount = workspace.usage?.members ?? 1;
    const seatCount = Math.max(memberCount, 1);

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://echly.com";
    const ownerEmail = user.email ?? "";

    const provider = getPaymentProvider();
    const result = await provider.createCheckoutSession({
      workspaceId,
      workspaceName: workspace.name,
      ownerEmail,
      ownerUid: user.uid,
      seatCount,
      billingCycle,
      existingCustomerId: workspace.billing?.stripeCustomerId ?? null,
      successUrl: `${origin}/settings?tab=billing&upgraded=true`,
      cancelUrl: `${origin}/settings?tab=billing`,
    });

    return apiSuccess({ checkoutUrl: result.checkoutUrl });
  } catch (err) {
    console.error("POST /api/billing/checkout:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to create checkout session", status: 500 });
  }
}
