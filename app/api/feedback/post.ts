import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  addFeedbackWithSessionCountersRepo,
  feedbackFromCreateInsert,
} from "@/lib/repositories/feedbackRepository.server";
import type { Feedback } from "@/lib/domain/feedback";
import {
  getScreenshotByIdRepo,
} from "@/lib/repositories/screenshotsRepository";
import { corsHeaders } from "@/lib/server/cors";
import "@/lib/server/firebaseAdmin";
import { assert, ECHLY_STRICT_MODE } from "@/lib/guardrails";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { resolveActorForActivityEvent } from "@/lib/repositories/activityEventsRepository.server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { checkFeedbackTicketLimit } from "@/lib/billing/checkPlanLimit";
import type { PlanLimitError } from "@/lib/billing/checkPlanLimit";
import { getWorkspace, incrementFeedbackCreatedThisMonthRepo } from "@/lib/repositories/workspacesRepository.server";
import { planLimitReachedApiError } from "@/lib/billing/planLimitResponse";

/** POST /api/feedback — create feedback (ticket) for a session. Returns same shape as GET /api/tickets/:id. */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    const res = toAuthorizationResponse(err);
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: { ...Object.fromEntries(res.headers.entries()), ...corsHeaders(req) },
    });
  }

  let body: {
    sessionId?: string;
    feedbackId?: string;
    title?: string;
    description?: string;
    tags?: string[];
    pageArea?: string;
    metadata?: {
      url?: string;
      viewportWidth?: number;
      viewportHeight?: number;
      userAgent?: string;
      clientTimestamp?: number;
    };
    screenshotId?: string;
    status?: string;
    screenWidth?: number;
    screenHeight?: number;
    devicePixelRatio?: number;
  } = {};

  try {
    body = await req.json();
    console.log("[FEEDBACK_DEBUG] received body:", JSON.stringify(body, null, 2));
  } catch (err) {
    console.error("[feedback] invalid JSON body:", err);
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const incomingStatusRaw =
    typeof body.status === "string" ? body.status.trim().toLowerCase() : "open";
  if (incomingStatusRaw === "failed") {
    return apiError({
      code: "INVALID_INPUT",
      message: "invalid status",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }
  if (
    incomingStatusRaw !== "open" &&
    incomingStatusRaw !== "resolved" &&
    incomingStatusRaw !== "processing"
  ) {
    return apiError({
      code: "INVALID_INPUT",
      message: "invalid status",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }
  type FeedbackStatus = "open" | "resolved" | "processing";
  const incomingStatus = incomingStatusRaw as FeedbackStatus;
  const normalizedIncomingStatus: FeedbackStatus =
    incomingStatus === "processing" ? "open" : incomingStatus;

  const feedbackId = body?.feedbackId;
  if (!feedbackId) {
    console.warn("[IDEMPOTENCY WARNING] Missing feedbackId in request", {
      time: new Date().toISOString(),
      route: "/api/feedback",
      bodyKeys: Object.keys(body || {}),
    });
  }
  if (feedbackId && typeof feedbackId !== "string") {
    console.warn("[IDEMPOTENCY WARNING] Invalid feedbackId type", {
      feedbackId,
      type: typeof feedbackId,
    });
  }
  if (typeof feedbackId === "string" && feedbackId.startsWith("fb-")) {
    console.warn("[IDEMPOTENCY NOTICE] Fallback ID detected (non-UUID)", {
      feedbackId,
    });
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  const feedbackIdRaw =
    typeof body.feedbackId === "string" ? body.feedbackId.trim() : "";
  const normalizedFeedbackId =
    feedbackIdRaw.length > 0 ? feedbackIdRaw : undefined;
  if (!sessionId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "sessionId is required",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }
  const title =
    typeof body.title === "string" && body.title.trim().length > 0
      ? body.title.trim().slice(0, 100)
      : "";
  if (!title) {
    return apiError({
      code: "INVALID_INPUT",
      message: "title is required",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 2000) : "";
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    : [];

  const screenshotIdRaw =
    typeof body.screenshotId === "string" ? body.screenshotId.trim() : "";
  const hasScreenshotId = screenshotIdRaw.length > 0;
  const normalizedScreenshotId = hasScreenshotId ? screenshotIdRaw : "";
  if (!hasScreenshotId) {
    if (ECHLY_STRICT_MODE) {
      console.error("[GUARDRAIL] Invalid feedback create attempt", { feedbackId: normalizedFeedbackId });
      try {
        assert(hasScreenshotId, "ARCHITECTURE VIOLATION: screenshotId required");
      } catch {
        return apiError({
          code: "INVALID_INPUT",
          message: "ARCHITECTURE VIOLATION: screenshotId required",
          status: 400,
          init: { headers: corsHeaders(req) },
        });
      }
    }
    return apiError({
      code: "INVALID_INPUT",
      message: "Atomic violation: screenshotId required",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const [built, screenshotRecord] = await Promise.all([
    tryBuildRequestContext({
      req,
      authenticatedUser: { uid: user.uid, email: user.email },
      sessionId,
    }),
    getScreenshotByIdRepo(normalizedScreenshotId),
  ]);
  if (!built.ok) {
    return new Response(built.response.body, {
      status: built.response.status,
      statusText: built.response.statusText,
      headers: { ...Object.fromEntries(built.response.headers), ...corsHeaders(req) },
    });
  }
  const accessCtx = built.ctx;
  if (!accessCtx.access?.capabilities.canView) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have access",
      status: 403,
      init: { headers: corsHeaders(req) },
    });
  }
  if (!accessCtx.access?.capabilities.canComment) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have access",
      status: 403,
      init: { headers: corsHeaders(req) },
    });
  }
  if (!accessCtx.session) {
    return apiError({
      code: "NOT_FOUND",
      message: "Session not found",
      status: 404,
      init: { headers: corsHeaders(req) },
    });
  }

  const userId = user.uid;

  const meta = body.metadata;
  const hasValidScreenshotReference =
    typeof screenshotRecord?.storagePath === "string" &&
    screenshotRecord.storagePath.trim().length > 0;
  if (!hasValidScreenshotReference) {
    if (ECHLY_STRICT_MODE) {
      console.error("[GUARDRAIL] Invalid feedback create attempt", { feedbackId: normalizedFeedbackId });
      try {
        assert(
          hasValidScreenshotReference,
          "ARCHITECTURE VIOLATION: screenshot must exist before create"
        );
      } catch {
        return apiError({
          code: "INVALID_INPUT",
          message: "ARCHITECTURE VIOLATION: screenshot must exist before create",
          status: 409,
          init: { headers: corsHeaders(req) },
        });
      }
    }
    return apiError({
      code: "INVALID_INPUT",
      message: "Atomic violation: screenshot reference unavailable",
      status: 409,
      init: { headers: corsHeaders(req) },
    });
  }

  const sessionWorkspaceId = accessCtx.session.workspaceId?.trim() ?? "";
  const screenshotWorkspaceId = screenshotRecord.workspaceId?.trim() ?? "";
  if (!screenshotWorkspaceId || screenshotWorkspaceId !== sessionWorkspaceId) {
    return apiError({
      code: "FORBIDDEN",
      message: "Screenshot does not belong to this workspace",
      status: 403,
      init: { headers: corsHeaders(req) },
    });
  }

  // Check monthly feedback ticket limit before creating
  if (sessionWorkspaceId) {
    const workspace = await getWorkspace(sessionWorkspaceId);
    if (workspace) {
      try {
        await checkFeedbackTicketLimit(workspace);
      } catch (limitErr) {
        const planErr = limitErr as PlanLimitError;
        if (planErr.code === "PLAN_LIMIT_REACHED") {
          // Phase 5: plan-limit-hit email. Fire-and-forget; once-per-cycle
          // dedupe lives in maybeSendPlanLimitHit. Never block the 4xx.
          void (async () => {
            try {
              const { maybeSendPlanLimitHit } = await import(
                "@/lib/email/planLimitDispatch.server"
              );
              await maybeSendPlanLimitHit({ workspace });
            } catch (e) {
              console.error("[plan-hit-email] failed:", e);
            }
          })();
          const errParams = planLimitReachedApiError(planErr);
          return apiError({ ...errParams, init: { headers: corsHeaders(req) } });
        }
        throw limitErr;
      }
    }
  }

  let resolvedCreatorName: string | null = null;
  let resolvedCreatorAvatarUrl: string | null = null;
  try {
    const actor = await resolveActorForActivityEvent(userId);
    resolvedCreatorName = actor.actorName || null;
    resolvedCreatorAvatarUrl = actor.actorPhotoURL ?? null;
  } catch {
    // Non-fatal: fallback to null if name unresolvable
  }

  const structuredData = {
    title,
    description,
    type:
      Array.isArray(tags) && tags.length > 0 && typeof tags[0] === "string"
        ? tags[0]
        : "feedback",
    tags: tags.length > 0 ? tags : undefined,
    pageArea:
      typeof body.pageArea === "string" && body.pageArea.trim().length > 0
        ? body.pageArea.trim().slice(0, 40)
        : undefined,
    screenshotId: normalizedScreenshotId,
    status: normalizedIncomingStatus,
    screenshotStatus: "attached" as const,
    url: meta?.url,
    viewportWidth: meta?.viewportWidth,
    viewportHeight: meta?.viewportHeight,
    userAgent: meta?.userAgent,
    timestamp: meta?.clientTimestamp,
    screenWidth: typeof body.screenWidth === "number" ? body.screenWidth : undefined,
    screenHeight: typeof body.screenHeight === "number" ? body.screenHeight : undefined,
    devicePixelRatio: typeof body.devicePixelRatio === "number" ? body.devicePixelRatio : undefined,
    creatorName: typeof resolvedCreatorName === "string" ? resolvedCreatorName : null,
    creatorAvatarUrl: typeof resolvedCreatorAvatarUrl === "string" ? resolvedCreatorAvatarUrl : null,
  };

  try {
    const result = await addFeedbackWithSessionCountersRepo(
      userId,
      sessionId,
      user.uid,
      structuredData,
      normalizedFeedbackId,
      normalizedScreenshotId,
      { preloadedWorkspaceId: sessionWorkspaceId }
    );
    const { ref, inserted } = result;
    let created: Feedback;
    if (inserted) {
      created = feedbackFromCreateInsert({
        id: ref.id,
        userId,
        sessionId,
        data: structuredData,
        createdAt: result.createdAt!,
      });
      // Increment monthly ticket counter (best-effort; does not fail the request)
      if (sessionWorkspaceId) {
        incrementFeedbackCreatedThisMonthRepo(sessionWorkspaceId)
          .then(async () => {
            // Phase 5: plan-limit-approaching email. Re-read the workspace so
            // usage.feedbackCreatedThisMonth reflects THIS create (and any
            // month-rollover reset checkFeedbackTicketLimit performed). The
            // 80%-crossing + once-per-cycle logic lives in the dispatcher.
            try {
              const fresh = await getWorkspace(sessionWorkspaceId);
              if (!fresh) return;
              const { maybeSendPlanLimitApproaching } = await import(
                "@/lib/email/planLimitDispatch.server"
              );
              await maybeSendPlanLimitApproaching({
                workspace: fresh,
                postIncrementUsage:
                  fresh.usage?.feedbackCreatedThisMonth ?? 0,
              });
            } catch (e) {
              console.error("[plan-approaching-email] failed:", e);
            }
          })
          .catch((e) =>
            console.error("Failed to increment feedbackCreatedThisMonth:", e)
          );
      }
    } else {
      const existing = result.existingFeedback;
      if (!existing) {
        return apiError({
          code: "INTERNAL_ERROR",
          message: "Idempotent create returned no document",
          status: 500,
          init: { headers: corsHeaders(req) },
        });
      }
      created = existing;
    }

    // 🚨 ARCHITECTURE RULE:
    // Backend must NEVER generate or return access URLs.
    // Only return storage references (screenshotId, storagePath).
    const serializedTicket = serializeTicket(created, accessCtx.access!);
    if (
      ECHLY_STRICT_MODE &&
      typeof serializedTicket === "object" &&
      serializedTicket !== null &&
      ((`screenshot${"Url"}` in serializedTicket) || (`image${"Url"}` in serializedTicket))
    ) {
      throw new Error("ARCHITECTURE VIOLATION: backend response must not contain legacy URL fields");
    }

    return apiSuccess(
      {
        ticket: serializedTicket,
        ...(inserted ? {} : { alreadyExists: true }),
      },
      accessCtx.access!,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("POST /api/feedback:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Server error",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}

