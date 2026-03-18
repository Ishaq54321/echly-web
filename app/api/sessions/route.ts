import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  createSessionRepo,
  getWorkspaceSessionCountRepo,
  getWorkspaceSessionsPaginatedRepo,
} from "@/lib/repositories/sessionsRepository";
import { log } from "@/lib/utils/logger";
import { resolveWorkspaceForUser } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { serializeSession } from "@/lib/server/serializeSession";
import { checkPlanLimit, type PlanLimitError } from "@/lib/billing/checkPlanLimit";
import { planLimitReachedBody } from "@/lib/billing/planLimitResponse";
import { corsHeaders } from "@/lib/server/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

const PAGINATED_DEFAULT_LIMIT = 25;
const PAGINATED_MAX_LIMIT = 25;

/** GET /api/sessions — list sessions (paginated only). ?limit=25&cursor=ID returns { data, nextCursor, totalCount }. */
export async function GET(req: NextRequest) {
  const start = Date.now();
  const url = new URL(req.url);
  const fullUrl = url.toString();
  if (fullUrl.includes("limit=10") || fullUrl.includes("fields=")) {
    console.error("❌ LEGACY API SHOULD NOT BE USED. Use /api/sessions?limit=25 and ?limit=25&cursor=... only.");
    return NextResponse.json(
      { error: "Legacy sessions API is removed. Use ?limit=25 and cursor for pagination." },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const limitParam = url.searchParams.get("limit");
  const cursorParam = url.searchParams.get("cursor") ?? "";
  const paginatedLimit = Math.min(
    Number(limitParam) || PAGINATED_DEFAULT_LIMIT,
    PAGINATED_MAX_LIMIT
  );

  log("[API] GET /api/sessions start (paginated)");

  let uid = (req.headers.get("x-user-id") ?? "").trim();
  if (!uid) {
    try {
      uid = (await requireAuth(req)).uid;
    } catch (res) {
      const errRes = res as Response;
      return new NextResponse(errRes.body, {
        status: errRes.status,
        statusText: errRes.statusText,
        headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
      });
    }
  }

  try {
    const { workspaceId, workspace } = await resolveWorkspaceForUser(uid);
    const cursor = cursorParam.trim() || undefined;
    const [pageResult, totalCount] = await Promise.all([
      getWorkspaceSessionsPaginatedRepo(workspaceId, paginatedLimit, cursor ?? null),
      getWorkspaceSessionCountRepo(workspaceId, workspace),
    ]);
    const { sessions, nextCursor } = pageResult;
    const data = sessions.map((s) => serializeSession(s));
    log("[API] GET /api/sessions duration (paginated):", Date.now() - start);
    return NextResponse.json(
      { data, nextCursor, totalCount },
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    console.error("GET /api/sessions:", err);
    log("[API] GET /api/sessions duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

/**
 * POST /api/sessions — create a new session. Returns { success: true, session: { id } }.
 * Session limit is enforced ONLY here (at creation). Reducing maxSessions never deletes existing sessions.
 */
export async function POST(req: NextRequest) {
  const start = performance.now();
  console.log("[ECHLY PERF] /api/sessions START");

  // ----------------------------------------
  // AUTH CHECK
  // ----------------------------------------
  const t_auth_start = performance.now();
  let uid = (req.headers.get("x-user-id") ?? "").trim();
  if (!uid) {
    try {
      uid = (await requireAuth(req)).uid;
    } catch (res) {
      const t_auth_end = performance.now();
      console.log("[ECHLY PERF] auth:", t_auth_end - t_auth_start);
      const errRes = res as Response;
      return new NextResponse(errRes.body, {
        status: errRes.status,
        statusText: errRes.statusText,
        headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
      });
    }
  }
  const t_auth_end = performance.now();
  console.log("[ECHLY PERF] auth:", t_auth_end - t_auth_start);

  // ----------------------------------------
  // REQUEST PARSING (no body for create session)
  // ----------------------------------------
  const t_parse_start = performance.now();
  // no body parsing / validation for POST create session
  const t_parse_end = performance.now();
  console.log("[ECHLY PERF] parse:", t_parse_end - t_parse_start);

  try {
    // ----------------------------------------
    // RESOLVE WORKSPACE
    // ----------------------------------------
    const t_resolve_start = performance.now();
    const { workspaceId, workspace } = await resolveWorkspaceForUser(uid);
    const t_resolve_end = performance.now();
    console.log("[ECHLY PERF] resolve_workspace:", t_resolve_end - t_resolve_start);

    // ----------------------------------------
    // PLAN / LIMIT CHECK
    // ----------------------------------------
    const t_limit_start = performance.now();
    if (workspace) {
      const currentSessionCount = await getWorkspaceSessionCountRepo(workspaceId, workspace);
      try {
        await checkPlanLimit({
          workspace,
          metric: "maxSessions",
          currentUsage: currentSessionCount,
        });
      } catch (limitErr) {
        const t_limit_end = performance.now();
        console.log("[ECHLY PERF] limit check:", t_limit_end - t_limit_start);
        const planErr = limitErr as PlanLimitError;
        if (planErr.code === "PLAN_LIMIT_REACHED") {
          const end = performance.now();
          console.log("[ECHLY PERF] TOTAL:", end - start);
          return NextResponse.json(planLimitReachedBody(planErr), {
            status: 403,
            headers: corsHeaders(req),
          });
        }
        throw limitErr;
      }
    }
    const t_limit_end = performance.now();
    console.log("[ECHLY PERF] limit check:", t_limit_end - t_limit_start);

    // ----------------------------------------
    // DATABASE WRITE
    // ----------------------------------------
    const t_db_start = performance.now();
    const id = await createSessionRepo(workspaceId, uid, null);
    const t_db_end = performance.now();
    console.log("[ECHLY PERF] db write:", t_db_end - t_db_start);

    const end = performance.now();
    console.log("[ECHLY PERF] TOTAL:", end - start);
    return NextResponse.json(
      { success: true, session: { id } },
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    const end = performance.now();
    console.log("[ECHLY PERF] TOTAL (error):", end - start);
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
