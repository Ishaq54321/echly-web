import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { resolveWorkspaceForUserLight } from "@/lib/server/resolveWorkspaceForUser";
import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";

export const dynamic = "force-dynamic";

const SAFE_FALLBACK = {
  plan: "free",
  limits: {
    maxSessions: null,
  },
};

/**
 * GET /api/billing/usage
 * Returns plan and resolved session limit only.
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch {
    return NextResponse.json(SAFE_FALLBACK);
  }

  try {
    const { workspaceId } = await resolveWorkspaceForUserLight(user.uid);
    const workspace = await getWorkspace(workspaceId);

    const plan = workspace?.billing?.plan ?? "free";
    const override = workspace?.entitlements?.maxSessions;
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
  } catch {
    return NextResponse.json(SAFE_FALLBACK);
  }
}
