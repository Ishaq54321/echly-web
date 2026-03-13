import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { getWorkspaceSessionCountRepo } from "@/lib/repositories/sessionsRepository";
import { getWorkspaceEntitlements } from "@/lib/billing/getWorkspaceEntitlements";
import { PLANS } from "@/lib/billing/plans";

const SAFE_FALLBACK = {
  plan: "free" as const,
  usage: {
    sessionsCreated: 0,
    members: 1,
  },
  limits: {
    maxSessions: PLANS.free.maxSessions,
    maxMembers: PLANS.free.maxMembers,
  },
};

/**
 * GET /api/billing/usage
 * Returns current plan, usage, and limits. Always returns 200 with valid shape;
 * uses safe fallback when workspace or usage data is missing or on error.
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch {
    return NextResponse.json(SAFE_FALLBACK);
  }

  try {
    const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      return NextResponse.json(SAFE_FALLBACK);
    }

    const activeSessionCount = await getWorkspaceSessionCountRepo(workspaceId);
    const entitlements = getWorkspaceEntitlements(workspace);
    const limits = {
      maxSessions: entitlements.maxSessions ?? PLANS.free.maxSessions,
      maxMembers: entitlements.maxMembers ?? PLANS.free.maxMembers,
    };

    return NextResponse.json({
      plan: workspace.billing?.plan ?? "free",
      usage: {
        sessionsCreated: activeSessionCount,
        members: Array.isArray(workspace.members) ? workspace.members.length : 1,
      },
      limits,
    });
  } catch {
    return NextResponse.json(SAFE_FALLBACK);
  }
}
