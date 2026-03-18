import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { resolveWorkspaceForUser } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { getWorkspaceSessionCountRepo } from "@/lib/repositories/sessionsRepository";
import { getWorkspaceEntitlements } from "@/lib/billing/getWorkspaceEntitlements";
import { getWorkspacePlanState } from "@/lib/billing/getWorkspacePlanState";
import { getCachedWorkspace } from "@/lib/server/cache/workspaceCache";

export const dynamic = "force-dynamic";

const SAFE_FALLBACK = {
  plan: "free" as const,
  usage: {
    activeSessions: 0,
    sessionsCreated: 0,
    members: 1,
  },
  limits: {
    maxSessions: null,
    maxMembers: null,
  },
};

/**
 * GET /api/billing/usage
 * Returns current plan, usage, and limits. Always returns 200 with valid shape;
 * uses safe fallback when workspace or usage data is missing or on error.
 */
export async function GET(req: Request) {
  let uid = (req.headers.get("x-user-id") ?? "").trim();
  if (!uid) {
    try {
      uid = (await requireAuth(req)).uid;
    } catch {
      return NextResponse.json(SAFE_FALLBACK);
    }
  }

  try {
    const { workspaceId, workspace } = await getCachedWorkspace(uid, () => resolveWorkspaceForUser(uid));

    if (!workspace) {
      return NextResponse.json(SAFE_FALLBACK);
    }

    // Plan state uses getWorkspaceEntitlements (catalog + overrides only), so admin plan changes show immediately
    const planState = await getWorkspacePlanState(workspaceId);
    if (planState) {
      return NextResponse.json({
        plan: planState.planId,
        limits: planState.limits,
        usage: {
          activeSessions: planState.usage.sessions,
          sessionsCreated:
            (typeof workspace.usage === "object" &&
              typeof (workspace.usage as { sessionsCreated?: number }).sessionsCreated === "number" &&
              (workspace.usage as { sessionsCreated?: number }).sessionsCreated) ||
            0,
          members: planState.usage.members,
        },
      });
    }

    const [activeSessionCount, entitlements] = await Promise.all([
      getWorkspaceSessionCountRepo(workspaceId, workspace),
      getWorkspaceEntitlements(workspace),
    ]);
    const limits = {
      maxSessions: entitlements.maxSessions,
      maxMembers: entitlements.maxMembers,
    };

    return NextResponse.json({
      plan: workspace.billing?.plan ?? "free",
      usage: {
        activeSessions: activeSessionCount,
        sessionsCreated:
          (typeof workspace.usage === "object" &&
            typeof (workspace.usage as { sessionsCreated?: number }).sessionsCreated ===
              "number" &&
            (workspace.usage as { sessionsCreated?: number }).sessionsCreated) ||
          0,
        members: Array.isArray(workspace.members) ? workspace.members.length : 1,
      },
      limits,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    return NextResponse.json(SAFE_FALLBACK);
  }
}
