import { NextResponse } from "next/server";
import type { Session } from "@/lib/domain/session";
import { requireAuth } from "@/lib/server/auth";
import {
  getUserSessionsRepo,
  createSessionRepo,
  getWorkspaceSessionsRepo,
  getWorkspaceSessionCountRepo,
} from "@/lib/repositories/sessionsRepository";
import { log } from "@/lib/utils/logger";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { checkPlanLimit, type PlanLimitError } from "@/lib/billing/checkPlanLimit";
import { planLimitReachedBody } from "@/lib/billing/planLimitResponse";

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
    const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
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
    console.error("GET /api/sessions:", err);
    log("[API] GET /api/sessions duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

/** POST /api/sessions — create a new session. Returns { success: true, session: { id } }. */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  try {
    const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    const workspace = await getWorkspace(workspaceId);
    if (workspace) {
      const currentSessionCount = await getWorkspaceSessionCountRepo(workspaceId);
      try {
        checkPlanLimit({
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
    console.error("POST /api/sessions:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
      { status: 500 }
    );
  }
}

function serializeSession(session: Session): Record<string, unknown> {
  const out = { ...session } as Record<string, unknown>;
  const createdAt = session.createdAt as { toDate?: () => Date } | null | undefined;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = createdAt.toDate().toISOString();
  }
  const updatedAt = session.updatedAt as { toDate?: () => Date } | null | undefined;
  if (updatedAt != null && typeof updatedAt.toDate === "function") {
    out.updatedAt = updatedAt.toDate().toISOString();
  }
  return out;
}
