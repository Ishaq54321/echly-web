import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import {
  createSessionRepo,
  getWorkspaceSessionCountRepo,
} from "@/lib/repositories/sessionsRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { WORKSPACE_SUSPENDED_MESSAGE } from "@/lib/server/assertWorkspaceActive";
import { checkPlanLimit, type PlanLimitError } from "@/lib/billing/checkPlanLimit";
import { planLimitReachedApiError } from "@/lib/billing/planLimitResponse";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { corsHeaders } from "@/lib/server/cors";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { listAccessibleSessionsForUser } from "@/lib/server/listAccessibleSessionsForUser";
import type { Session } from "@/lib/domain/session";
import { assert } from "@/lib/utils/assert";

function sessionFieldToIso(value: Session["updatedAt"]): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  const v = value as { toMillis?: () => number; toDate?: () => Date };
  if (typeof v.toMillis === "function") {
    return new Date(v.toMillis()).toISOString();
  }
  if (typeof v.toDate === "function") {
    return v.toDate().toISOString();
  }
  return null;
}

export const dynamic = "force-dynamic";

function withCors(req: NextRequest, res: Response): NextResponse {
  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: { ...Object.fromEntries(res.headers), ...corsHeaders(req) },
  });
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/** GET /api/sessions — list sessions for the authenticated user. */
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return withCors(req, toAuthorizationResponse(err));
  }

  console.time("API /sessions");
  try {
    console.time("Firestore query");
    let sessions: Session[];
    try {
      sessions = await listAccessibleSessionsForUser({
        userId: user.uid,
        limit: 30,
      });
    } finally {
      console.timeEnd("Firestore query");
    }

    sessions.forEach((s) => {
      assert(s.accessLevel, "Session missing accessLevel");
      assert(s.generalAccess, "Session missing generalAccess");
    });

    const sessionsPayload = sessions.map((session) => {
      const updatedAt =
        sessionFieldToIso(session.updatedAt) ??
        sessionFieldToIso(session.createdAt) ??
        null;
      const title =
        typeof session.title === "string" && session.title.trim() !== ""
          ? session.title.trim()
          : "Untitled Session";
      const openCount = typeof session.openCount === "number" ? session.openCount : 0;
      const resolvedCount =
        typeof session.resolvedCount === "number" ? session.resolvedCount : 0;
      const totalCount =
        typeof session.totalCount === "number"
          ? session.totalCount
          : typeof session.feedbackCount === "number"
            ? session.feedbackCount
            : 0;
      const feedbackCount =
        typeof session.feedbackCount === "number"
          ? session.feedbackCount
          : typeof session.totalCount === "number"
            ? session.totalCount
            : 0;

      return {
        id: session.id,
        workspaceId: session.workspaceId,
        createdByUserId: session.createdByUserId,
        title,
        name: title,
        accessLevel: session.accessLevel,
        generalAccess: session.generalAccess,
        updatedAt,
        archived: session.archived === true || session.isArchived === true,
        openCount,
        resolvedCount,
        totalCount,
        feedbackCount,
      };
    });
    return apiSuccess({ sessions: sessionsPayload }, null, { headers: corsHeaders(req) });
  } catch (err) {
    if (err instanceof Error && err.message === "Missing workspaceId for user") {
      return apiError({
        code: "FORBIDDEN",
        message: "Workspace not found",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return apiError({
        code: "FORBIDDEN",
        message: WORKSPACE_SUSPENDED_MESSAGE,
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    console.error("GET /api/sessions:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to load sessions",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  } finally {
    console.timeEnd("API /sessions");
  }
}

/**
 * POST /api/sessions — create a new session. Returns `{ success, data: { session: { id } }, access: null }`.
 */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return withCors(req, toAuthorizationResponse(err));
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);

    if (workspace) {
      const currentSessionCount = await getWorkspaceSessionCountRepo(workspaceId, workspace);
      try {
        await checkPlanLimit({
          workspace,
          metric: "maxSessions",
          currentUsage: currentSessionCount,
        });
      } catch (limitErr) {
        const planErr = limitErr as PlanLimitError;
        if (planErr.code === "PLAN_LIMIT_REACHED") {
          const errParams = planLimitReachedApiError(planErr);
          return apiError({ ...errParams, init: { headers: corsHeaders(req) } });
        }
        throw limitErr;
      }
    }

    const id = await createSessionRepo(workspaceId, user.uid);

    return apiSuccess({ session: { id } }, null, { headers: corsHeaders(req) });
  } catch (err) {
    if (err instanceof Error && err.message === "Missing workspaceId for user") {
      return apiError({
        code: "FORBIDDEN",
        message: "Workspace not found",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return apiError({
        code: "FORBIDDEN",
        message: WORKSPACE_SUSPENDED_MESSAGE,
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    console.error("POST /api/sessions:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to create session",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
