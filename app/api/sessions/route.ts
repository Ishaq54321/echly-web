import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  createSessionRepo,
  getWorkspaceSessionCountRepo,
} from "@/lib/repositories/sessionsRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { checkPlanLimit, type PlanLimitError } from "@/lib/billing/checkPlanLimit";
import { planLimitReachedBody } from "@/lib/billing/planLimitResponse";
import { corsHeaders } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

export const dynamic = "force-dynamic";

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
  } catch (res) {
    const errRes = res as Response;
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
    });
  }

  console.time("API /sessions");
  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    console.time("Firestore query");
    let snap;
    try {
      snap = await adminDb
        .collection("sessions")
        .where("workspaceId", "==", workspaceId)
        .orderBy("updatedAt", "desc")
        .limit(30)
        .get();
    } finally {
      console.timeEnd("Firestore query");
    }
    const sessions = snap.docs.map((docSnap) => {
      const data = docSnap.data() as {
        title?: string;
        updatedAt?: { toDate?: () => Date } | string | null;
        createdAt?: { toDate?: () => Date } | string | null;
        archived?: boolean;
      };
      const toIsoString = (
        value: { toDate?: () => Date } | string | null | undefined
      ): string | null => {
        if (typeof value === "string") return value;
        if (value != null && typeof value === "object" && typeof value.toDate === "function") {
          return value.toDate().toISOString();
        }
        return null;
      };

      const updatedAt = toIsoString(data.updatedAt) ?? toIsoString(data.createdAt) ?? null;

      return {
        id: docSnap.id,
        // Keep `title` for compatibility and include `name` as a normalized alias.
        title: data.title ?? "Untitled Session",
        name: data.title ?? "Untitled Session",
        updatedAt,
        archived: data.archived === true,
      };
    });
    return NextResponse.json({ sessions }, { headers: corsHeaders(req) });
  } catch (err) {
    if (err instanceof Error && err.message === "Missing workspaceId for user") {
      return new Response("Workspace not found", {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    console.error("GET /api/sessions:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500, headers: corsHeaders(req) }
    );
  } finally {
    console.timeEnd("API /sessions");
  }
}

/**
 * POST /api/sessions — create a new session. Returns { success: true, session: { id } }.
 * Session limit is enforced ONLY here (at creation). Reducing maxSessions never deletes existing sessions.
 */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    const errRes = res as Response;
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
    });
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
          return NextResponse.json(planLimitReachedBody(planErr), {
            status: 403,
            headers: corsHeaders(req),
          });
        }
        throw limitErr;
      }
    }

    const id = await createSessionRepo(workspaceId, user.uid, null);

    return NextResponse.json(
      { success: true, session: { id } },
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    if (err instanceof Error && err.message === "Missing workspaceId for user") {
      return new Response("Workspace not found", {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    console.error("POST /api/sessions:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
