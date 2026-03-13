import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  getUserSessionsRepo,
  createSessionRepo,
  getWorkspaceSessionsRepo,
  getWorkspaceSessionCountRepo,
} from "@/lib/repositories/sessionsRepository";
import { log } from "@/lib/utils/logger";
import { resolveWorkspaceForUser } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { serializeSession } from "@/lib/server/serializeSession";
import { checkPlanLimit, type PlanLimitError } from "@/lib/billing/checkPlanLimit";
import { planLimitReachedBody } from "@/lib/billing/planLimitResponse";

export const dynamic = "force-dynamic";

/** GET /api/sessions — list sessions for the authenticated user. */
export async function GET(req: Request) {
  const start = Date.now();
  log("[API] GET /api/sessions start");
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const { workspaceId, workspace } = await resolveWorkspaceForUser(user.uid);
    const workspaceSessions = await getWorkspaceSessionsRepo(workspaceId, 100);
    const sessions =
      workspaceSessions.length > 0
        ? workspaceSessions
        : await getUserSessionsRepo(user.uid, 100);
    log("[API] GET /api/sessions duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      sessions: sessions.map((s) => serializeSession(s)),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    console.error("GET /api/sessions:", err);
    log("[API] GET /api/sessions duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions — create a new session. Returns { success: true, session: { id } }.
 * Session limit is enforced ONLY here (at creation). Reducing maxSessions never deletes existing sessions.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  try {
    const { workspaceId, workspace } = await resolveWorkspaceForUser(user.uid);
    if (workspace) {
      const currentSessionCount = await getWorkspaceSessionCountRepo(workspaceId);
      try {
        await checkPlanLimit({
          workspace,
          metric: "maxSessions",
          currentUsage: currentSessionCount,
        });
      } catch (limitErr) {
        const planErr = limitErr as PlanLimitError;
        if (planErr.code === "PLAN_LIMIT_REACHED") {
          return NextResponse.json(planLimitReachedBody(planErr), { status: 403 });
        }
        throw limitErr;
      }
    }
    const id = await createSessionRepo(workspaceId, user.uid, null);
    return NextResponse.json({ success: true, session: { id } });
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    console.error("POST /api/sessions:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
      { status: 500 }
    );
  }
}
