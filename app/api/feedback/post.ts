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
import { generateTicketTitle } from "@/lib/tickets/generateTicketTitle";
import { corsHeaders } from "@/lib/server/cors";
import "@/lib/server/firebaseAdmin";
import { getStorage } from "firebase-admin/storage";
import { assert, ECHLY_STRICT_MODE } from "@/lib/guardrails";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

async function resolveScreenshotDownloadUrl(
  screenshotId: string,
  sessionId: string
): Promise<string | null> {
  const screenshotRecord = await getScreenshotByIdRepo(screenshotId);

  const storagePathRaw =
    typeof screenshotRecord?.storagePath === "string"
      ? screenshotRecord.storagePath.trim()
      : "";

  const fallbackStoragePath = `sessions/${sessionId}/screenshots/${screenshotId}.png`;

  const storagePath =
    storagePathRaw.length > 0 ? storagePathRaw : fallbackStoragePath;

  try {
    const bucket = getStorage().bucket();

    const file = bucket.file(storagePath);

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return url;
  } catch (err) {
    console.error("[feedback lifecycle] failed to resolve screenshot URL", {
      screenshotId,
      sessionId,
      storagePath,
      hasScreenshotRecord: !!screenshotRecord,
      error: err,
    });
    return null;
  }
}

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
    instruction?: string;
    suggestion?: string;
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
    screenshotId?: string;
    status?: string;
  } = {};

  try {
    body = await req.json();
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
  const actionSteps =
    Array.isArray(body.actionSteps)
      ? body.actionSteps.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map((s) => s.trim())
      : [];
  const title =
    actionSteps.length > 0
      ? generateTicketTitle(actionSteps)
      : (typeof body.title === "string" ? body.title.trim() : "");
  if (!title) {
    return apiError({
      code: "INVALID_INPUT",
      message: "title is required (or provide actionSteps)",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

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

  const built = await tryBuildRequestContext({
    req,
    authenticatedUser: { uid: user.uid, email: user.email },
    sessionId,
  });
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
  const resolvedScreenshotUrl = await resolveScreenshotDownloadUrl(normalizedScreenshotId, sessionId);
  if (!resolvedScreenshotUrl) {
    if (ECHLY_STRICT_MODE) {
      console.error("[GUARDRAIL] Invalid feedback create attempt", { feedbackId: normalizedFeedbackId });
      try {
        assert(
          Boolean(resolvedScreenshotUrl),
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
      message: "Atomic violation: screenshot URL unavailable",
      status: 409,
      init: { headers: corsHeaders(req) },
    });
  }

  const structuredData = {
    title,
    instruction:
      typeof body.instruction === "string"
        ? body.instruction
        : typeof (body as { description?: unknown }).description === "string"
          ? ((body as { description?: string }).description ?? undefined)
        : undefined,
    suggestion: typeof body.suggestion === "string" ? body.suggestion : undefined,
    type: "general" as const,
    contextSummary:
      typeof body.contextSummary === "string" ? body.contextSummary : undefined,
    actionSteps: actionSteps.length > 0 ? actionSteps : undefined,
    suggestedTags: Array.isArray(body.suggestedTags)
      ? body.suggestedTags
      : undefined,
    screenshotUrl: resolvedScreenshotUrl,
    status: normalizedIncomingStatus,
    screenshotStatus: "attached" as const,
    url: meta?.url,
    viewportWidth: meta?.viewportWidth,
    viewportHeight: meta?.viewportHeight,
    userAgent: meta?.userAgent,
    timestamp: meta?.clientTimestamp,
  };

  try {
    const result = await addFeedbackWithSessionCountersRepo(
      userId,
      sessionId,
      user.uid,
      structuredData,
      normalizedFeedbackId,
      normalizedScreenshotId
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

    return apiSuccess(
      {
        ticket: serializeTicket(created, accessCtx.access!),
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

