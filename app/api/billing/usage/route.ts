import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/usage
 * Returns plan and resolved session limit only.
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      return new Response("Workspace not found", { status: 403 });
    }

    if (!workspace.billing?.plan) {
      return new Response("Billing plan missing", { status: 500 });
    }

    const plan = workspace.billing.plan;
    const override = workspace.entitlements?.maxSessions;
    const catalog = await getPlanCatalog();
    const maxSessions =
      override !== undefined
        ? override // includes null = unlimited
        : catalog[plan]?.maxSessions ?? null;

    return NextResponse.json({
      plan,
      limits: {
        maxSessions,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === MISSING_USER_WORKSPACE_ERROR) {
      return new Response("Workspace not found", { status: 403 });
    }
    return new Response("Failed to load billing data", { status: 500 });
  }
}
