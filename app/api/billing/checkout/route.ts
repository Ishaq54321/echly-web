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
    assertWorkspaceActive(workspace, { allowSuspended: true });

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

    let body: { billingCycle?: unknown; seatCount?: unknown } = {};
    try {
      body = (await req.json()) as {
        billingCycle?: unknown;
        seatCount?: unknown;
      };
    } catch {
      // default to monthly
    }

    const billingCycle: "monthly" | "annual" =
      body.billingCycle === "annual" ? "annual" : "monthly";

    // Server is the source of truth for the floor. The client may request a
    // HIGHER seat count (planning ahead) but never lower than the actual
    // member count — this defends against client-side seat-count tampering.
    const memberCount = workspace.usage?.members ?? 1;
    const floor = Math.max(memberCount, 1);
    const requested =
      typeof body.seatCount === "number"
        ? body.seatCount
        : typeof body.seatCount === "string"
        ? parseInt(body.seatCount, 10)
        : NaN;
    const seatCount = Number.isFinite(requested)
      ? Math.max(requested, floor)
      : floor;

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";
    const ownerEmail = user.email ?? "";

    const provider = getPaymentProvider();
    const result = await provider.createCheckoutSession({
      workspaceId,
      workspaceName: workspace.name,
      ownerEmail,
      ownerUid: user.uid,
      seatCount,
      billingCycle,
      existingCustomerId: workspace.billing?.customerId ?? null,
      successUrl: `${origin}/settings?tab=billing&upgraded=true`,
      cancelUrl: `${origin}/settings?tab=billing`,
    });

    return apiSuccess({
      priceId: result.priceId,
      customData: result.customData,
      customerEmail: result.customerEmail,
      customerId: result.customerId ?? null,
      // Propagate the workspace member count so Paddle.Checkout opens at the
      // right seat quantity (prevents seat-count drift vs. reality).
      seatCount,
    });
  } catch (err) {
    console.error("POST /api/billing/checkout:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to create checkout session", status: 500 });
  }
}
