import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { doc, updateDoc } from "firebase/firestore";
import { createFeedbackMinimal } from "@/lib/createFeedbackMinimal";
import { incrementNewFeedbackCountersRepo } from "@/lib/repositories/feedbackRepository";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { log } from "@/lib/utils/logger";
import { updateScreenshotAttachedRepo } from "@/lib/repositories/screenshotsRepository";
import { generateTicketTitle } from "@/lib/tickets/generateTicketTitle";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { corsHeaders } from "@/lib/server/cors";
import { requireAuth } from "@/lib/server/auth";
import { invalidateFeedbackCache } from "@/lib/server/cache/feedbackCache";
import { db } from "@/lib/firebase";

const WORKSPACE_BY_ID_CACHE_TTL_MS = 30_000;
const workspaceByIdCache = new Map<string, { workspace: unknown; expiresAt: number }>();

function now() {
  return Number(process.hrtime.bigint()) / 1e6; // ms with high precision
}

async function resolveWorkspaceByIdCached(workspaceId: string): Promise<{ workspace: unknown }> {
  const now = Date.now();
  const hit = workspaceByIdCache.get(workspaceId);
  if (hit && now < hit.expiresAt) {
    return { workspace: hit.workspace };
  }
  const { workspace } = await resolveWorkspaceById(workspaceId);
  workspaceByIdCache.set(workspaceId, { workspace, expiresAt: now + WORKSPACE_BY_ID_CACHE_TTL_MS });
  return { workspace };
}

/** POST /api/feedback — create feedback (ticket) for a session. Returns same shape as GET /api/tickets/:id. */
export async function POST(req: NextRequest) {
  const requestStart = now();
  console.log("[PIPELINE] START", {
    at: requestStart,
  });

  const start = Date.now();
  log("[API] POST /api/feedback start");
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

  let body: {
    sessionId?: string;
    title?: string;
    description?: string;
    suggestion?: string;
    screenshotUrl?: string;
    contextSummary?: string;
    actionSteps?: string[];
    suggestedTags?: string[];
    metadata?: {
      url?: string;
      viewportWidth?: number;
      viewportHeight?: number;
      userAgent?: string;
      clientTimestamp?: number;
    };
    clarityScore?: number;
    clarityStatus?: "clear" | "needs_improvement" | "unclear";
    clarityIssues?: string[];
    clarityConfidence?: number;
    extractedInstructions?: Array<{
      intent?: string;
      entity?: string;
      action?: string;
      confidence?: number;
    }>;
    screenshotId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "sessionId is required" },
      { status: 400, headers: corsHeaders(req) }
    );
  }
  const actionSteps =
    Array.isArray(body.actionSteps)
      ? body.actionSteps.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map((s) => s.trim())
      : [];
  const title =
    actionSteps.length > 0
      ? generateTicketTitle(actionSteps)
      : (typeof body.title === "string" ? body.title.trim() : "");
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (!title) {
    return NextResponse.json(
      { success: false, error: "title is required (or provide actionSteps)" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404, headers: corsHeaders(req) }
    );
  }
  if (session.userId !== user.uid) {
    const userWorkspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    const sessionWorkspaceId = session.workspaceId ?? session.userId ?? null;
    const ok = sessionWorkspaceId != null && sessionWorkspaceId === userWorkspaceId;
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403, headers: corsHeaders(req) }
      );
    }
  }

  const workspaceId = session.workspaceId ?? session.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  try {
    await resolveWorkspaceByIdCached(workspaceId);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403, headers: corsHeaders(req) }
      );
    }
    throw err;
  }

  const meta = body.metadata;

  const structuredData = {
    title,
    description: description || title,
    suggestion: typeof body.suggestion === "string" ? body.suggestion : undefined,
    type: "general" as const,
    contextSummary:
      typeof body.contextSummary === "string" ? body.contextSummary : undefined,
    actionSteps: actionSteps.length > 0 ? actionSteps : undefined,
    suggestedTags: Array.isArray(body.suggestedTags)
      ? body.suggestedTags
      : undefined,
    screenshotUrl:
      typeof body.screenshotUrl === "string" ? body.screenshotUrl : undefined,
    url: meta?.url,
    viewportWidth: meta?.viewportWidth,
    viewportHeight: meta?.viewportHeight,
    userAgent: meta?.userAgent,
    timestamp: meta?.clientTimestamp,
    clarityScore:
      typeof body.clarityScore === "number" && body.clarityScore >= 0 && body.clarityScore <= 100
        ? body.clarityScore
        : undefined,
    clarityStatus:
      body.clarityStatus === "clear" ||
      body.clarityStatus === "needs_improvement" ||
      body.clarityStatus === "unclear"
        ? body.clarityStatus
        : undefined,
    clarityIssues: Array.isArray(body.clarityIssues) ? body.clarityIssues : undefined,
    clarityConfidence:
      typeof body.clarityConfidence === "number" &&
      body.clarityConfidence >= 0 &&
      body.clarityConfidence <= 1
        ? body.clarityConfidence
        : undefined,
  };

  try {
    const workspaceId = session.workspaceId ?? session.userId ?? ((await getUserWorkspaceIdRepo(user.uid)) ?? user.uid);

    const dbStart = now();
    console.log("[PIPELINE] DB_WRITE_START", { at: dbStart });
    const docRef = await createFeedbackMinimal({
      workspaceId,
      sessionId,
      userId: user.uid,
      data: structuredData,
    });
    const dbEnd = now();
    console.log("[PIPELINE] DB_WRITE_END", {
      duration: dbEnd - dbStart,
    });
    console.log("[FAST WRITE] feedback created", docRef.id);

    const screenshotId =
      typeof body.screenshotId === "string" ? body.screenshotId.trim() : "";

    const response = NextResponse.json(
      {
        success: true,
        ticket: {
          id: docRef.id,
          workspaceId,
          sessionId,
          title: structuredData.title,
          description: structuredData.description,
          status: "processing",
          createdAt: Date.now(),
        },
      },
      { headers: corsHeaders(req) }
    );

    void (async () => {
      try {
        await incrementNewFeedbackCountersRepo(workspaceId, sessionId, structuredData);
        await invalidateFeedbackCache(workspaceId, sessionId);

        const isExtension =
          !!req.headers.get("x-extension-id") || !!body.metadata?.clientTimestamp;
        if (isExtension) {
          await updateDoc(doc(db, "feedback", docRef.id), {
            status: "processing",
          });
        }

        if (screenshotId) {
          await updateScreenshotAttachedRepo(screenshotId, docRef.id);
        }
      } catch (err) {
        console.log("[ASYNC DB TASK ERROR]", err);
      }
    })();

    log("[API] POST /api/feedback duration:", Date.now() - start);

    return response;
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403, headers: corsHeaders(req) }
      );
    }
    console.error("POST /api/feedback:", err);
    log("[API] POST /api/feedback duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

