import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  addFeedbackWithSessionCountersRepo,
  feedbackFromCreateInsert,
} from "@/lib/repositories/feedbackRepository.server";
import type {
  ConsoleLogEntry,
  ExceptionEntry,
  Feedback,
  NetworkRequestEntry,
} from "@/lib/domain/feedback";
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
    // Phase 4: console-log capture from the extension's MAIN-world wrapper.
    // All entries are redacted at capture time before they reach this route.
    consoleLogs?: unknown;
    exceptions?: unknown;
    consoleLogCount?: unknown;
    exceptionCount?: unknown;
    errorCount?: unknown;
    warningCount?: unknown;
    // Phase N4: network-request capture from the extension's MAIN-world wrapper.
    networkRequests?: unknown;
    networkRequestCount?: unknown;
    networkErrorCount?: unknown;
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

  // ─── Phase 4: console-log capture validation ────────────────────────
  // Defense-in-depth. The extension already redacts at capture time, but we
  // re-validate here to:
  //   • cap array length (200) and total byte size (100KB) so a buggy or
  //     compromised client can't write unbounded blobs to Firestore.
  //   • require well-formed entry shapes; drop the offending field on
  //     failure but accept the rest of the payload (spec: don't reject the
  //     whole ticket over malformed logs).
  //   • run a PII regex over consoleLogs[].message for JWT prefix ("eyJ")
  //     and Stripe key prefix ("sk_"). Log-only; don't reject. If the
  //     extension's redact pipeline ever regresses, this catches the leak
  //     before it lands in Firestore.
  const MAX_LOG_ENTRIES = 200;
  const MAX_TOTAL_BYTES = 100 * 1024;
  const ALLOWED_LEVELS = new Set(["log", "info", "warn", "error", "debug"]);
  const ALLOWED_EXCEPTION_TYPES = new Set(["error", "unhandledrejection"]);

  function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
  }

  function validateConsoleLog(entry: unknown): ConsoleLogEntry | null {
    if (!isPlainObject(entry)) return null;
    if (typeof entry.timestamp !== "number") return null;
    if (typeof entry.level !== "string" || !ALLOWED_LEVELS.has(entry.level)) return null;
    if (typeof entry.message !== "string") return null;
    const out: ConsoleLogEntry = {
      timestamp: entry.timestamp,
      level: entry.level as ConsoleLogEntry["level"],
      message: entry.message,
    };
    if (Array.isArray(entry.args)) {
      const args = entry.args.filter((a): a is string => typeof a === "string");
      if (args.length > 0) out.args = args;
    }
    if (typeof entry.source === "string") out.source = entry.source;
    return out;
  }

  function validateException(entry: unknown): ExceptionEntry | null {
    if (!isPlainObject(entry)) return null;
    if (typeof entry.timestamp !== "number") return null;
    if (typeof entry.message !== "string") return null;
    if (typeof entry.type !== "string" || !ALLOWED_EXCEPTION_TYPES.has(entry.type)) return null;
    const out: ExceptionEntry = {
      timestamp: entry.timestamp,
      message: entry.message,
      type: entry.type as ExceptionEntry["type"],
    };
    if (typeof entry.stack === "string") out.stack = entry.stack;
    else if (entry.stack === null) out.stack = null;
    if (typeof entry.source === "string") out.source = entry.source;
    else if (entry.source === null) out.source = null;
    if (typeof entry.line === "number") out.line = entry.line;
    else if (entry.line === null) out.line = null;
    if (typeof entry.column === "number") out.column = entry.column;
    else if (entry.column === null) out.column = null;
    return out;
  }

  function validateLogArray<T>(
    field: "consoleLogs" | "exceptions",
    raw: unknown,
    validator: (entry: unknown) => T | null,
  ): T[] | undefined {
    if (raw === undefined || raw === null) return undefined;
    if (!Array.isArray(raw)) {
      console.warn(`[feedback] dropped ${field}: not an array`);
      return undefined;
    }
    const capped = raw.slice(0, MAX_LOG_ENTRIES);
    const validated: T[] = [];
    for (const entry of capped) {
      const v = validator(entry);
      if (v !== null) validated.push(v);
    }
    return validated.length > 0 ? validated : undefined;
  }

  let validatedConsoleLogs = validateLogArray<ConsoleLogEntry>(
    "consoleLogs",
    body.consoleLogs,
    validateConsoleLog,
  );
  let validatedExceptions = validateLogArray<ExceptionEntry>(
    "exceptions",
    body.exceptions,
    validateException,
  );

  // Combined byte cap. If over, drop both rather than truncate selectively —
  // the client buffer already enforced a 50KB cap, so 100KB here is a wide
  // margin and breaching it indicates a misbehaving client.
  if (validatedConsoleLogs || validatedExceptions) {
    const sizeProbe = JSON.stringify({
      consoleLogs: validatedConsoleLogs ?? [],
      exceptions: validatedExceptions ?? [],
    });
    if (sizeProbe.length > MAX_TOTAL_BYTES) {
      console.warn(
        `[feedback] dropped console capture: combined size ${sizeProbe.length} bytes exceeds ${MAX_TOTAL_BYTES} cap`,
      );
      validatedConsoleLogs = undefined;
      validatedExceptions = undefined;
    }
  }

  // Defense in depth — scan for tokens that should already be redacted.
  // Log-only; never reject. If you see this warning, the extension's
  // redact.ts has a regex hole that needs fixing.
  if (validatedConsoleLogs) {
    const piiLeakHits: string[] = [];
    for (const entry of validatedConsoleLogs) {
      if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(entry.message)) {
        piiLeakHits.push("jwt");
      }
      if (/\b(?:sk_live_|sk_test_)[A-Za-z0-9_-]+/.test(entry.message)) {
        piiLeakHits.push("stripe_secret");
      }
    }
    if (piiLeakHits.length > 0) {
      console.warn(
        `[WARN] potential unredacted PII in console log (${[...new Set(piiLeakHits)].join(",")}): feedbackId=${normalizedFeedbackId ?? "<none>"} sessionId=${sessionId}`,
      );
    }
  }

  // ─── Phase N4: network-request capture validation ──────────────────
  // Same defense-in-depth pattern as console. Per-entry shape validation
  // drops malformed entries individually; combined byte cap drops the
  // whole field rather than truncating (client buffer already enforced
  // 100KB so 200KB here is a wide margin). PII scan over request/response
  // bodies logs warnings; never rejects.
  const MAX_NETWORK_ENTRIES = 200;
  const MAX_NETWORK_TOTAL_BYTES = 200 * 1024;
  const ALLOWED_NETWORK_SOURCES = new Set(["fetch", "xhr"]);

  function isStringRecord(v: unknown): v is Record<string, string> {
    if (!isPlainObject(v)) return false;
    for (const k of Object.keys(v)) {
      if (typeof (v as Record<string, unknown>)[k] !== "string") return false;
    }
    return true;
  }

  function validateNetworkRequest(entry: unknown): NetworkRequestEntry | null {
    if (!isPlainObject(entry)) return null;
    if (typeof entry.id !== "string" || entry.id.length === 0) return null;
    if (typeof entry.url !== "string") return null;
    if (typeof entry.method !== "string") return null;
    if (typeof entry.source !== "string" || !ALLOWED_NETWORK_SOURCES.has(entry.source)) {
      return null;
    }
    const out: NetworkRequestEntry = {
      id: entry.id,
      timestamp: typeof entry.timestamp === "number" ? entry.timestamp : 0,
      url: entry.url,
      method: entry.method,
      status: typeof entry.status === "number" ? entry.status : null,
      statusText: typeof entry.statusText === "string" ? entry.statusText : null,
      durationMs: typeof entry.durationMs === "number" ? entry.durationMs : null,
      source: entry.source as NetworkRequestEntry["source"],
      requestHeaders: isStringRecord(entry.requestHeaders) ? entry.requestHeaders : {},
      responseHeaders: isStringRecord(entry.responseHeaders) ? entry.responseHeaders : {},
      requestBody: typeof entry.requestBody === "string" ? entry.requestBody : null,
      requestBodyOriginalSize:
        typeof entry.requestBodyOriginalSize === "number"
          ? entry.requestBodyOriginalSize
          : null,
      requestBodyTruncated: entry.requestBodyTruncated === true,
      responseBody: typeof entry.responseBody === "string" ? entry.responseBody : null,
      responseBodyOriginalSize:
        typeof entry.responseBodyOriginalSize === "number"
          ? entry.responseBodyOriginalSize
          : null,
      responseBodyTruncated: entry.responseBodyTruncated === true,
      responseContentType:
        typeof entry.responseContentType === "string" ? entry.responseContentType : null,
      errored: entry.errored === true,
      errorMessage: typeof entry.errorMessage === "string" ? entry.errorMessage : null,
      initiatorPage:
        typeof entry.initiatorPage === "string" ? entry.initiatorPage : null,
    };
    return out;
  }

  function validateNetworkRequestArray(raw: unknown): NetworkRequestEntry[] | undefined {
    if (raw === undefined || raw === null) return undefined;
    if (!Array.isArray(raw)) {
      console.warn("[feedback] dropped networkRequests: not an array");
      return undefined;
    }
    const capped = raw.slice(0, MAX_NETWORK_ENTRIES);
    const validated: NetworkRequestEntry[] = [];
    for (const entry of capped) {
      const v = validateNetworkRequest(entry);
      if (v !== null) validated.push(v);
    }
    if (validated.length === 0) return undefined;
    const sizeProbe = JSON.stringify(validated);
    if (sizeProbe.length > MAX_NETWORK_TOTAL_BYTES) {
      console.warn(
        `[feedback] dropped networkRequests: combined size ${sizeProbe.length} bytes exceeds ${MAX_NETWORK_TOTAL_BYTES} cap`,
      );
      return undefined;
    }
    return validated;
  }

  let validatedNetworkRequests = validateNetworkRequestArray(body.networkRequests);

  // PII defense-in-depth scan on bodies. Headers are already redacted at
  // capture time. Log-only; never reject.
  if (validatedNetworkRequests) {
    const jwtRe = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;
    const stripeRe = /\b(?:sk_live_|sk_test_)[A-Za-z0-9_-]+/;
    for (const entry of validatedNetworkRequests) {
      for (const surface of ["requestBody", "responseBody"] as const) {
        const text = entry[surface];
        if (typeof text !== "string" || text.length === 0) continue;
        if (jwtRe.test(text) || stripeRe.test(text)) {
          console.warn("[WARN] potential unredacted PII in network body", {
            feedbackId: normalizedFeedbackId ?? "<none>",
            sessionId,
            entryId: entry.id,
            surface,
          });
        }
      }
    }
  }

  // Counters: accept only non-negative integers. Drop the offending field on
  // failure (per spec).
  function validateCount(field: string, raw: unknown): number | undefined {
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw !== "number" || !Number.isFinite(raw) || !Number.isInteger(raw) || raw < 0) {
      console.warn(`[feedback] dropped ${field}: not a non-negative integer (got ${typeof raw})`);
      return undefined;
    }
    return raw;
  }
  const validatedConsoleLogCount = validateCount("consoleLogCount", body.consoleLogCount);
  const validatedExceptionCount = validateCount("exceptionCount", body.exceptionCount);
  const validatedErrorCount = validateCount("errorCount", body.errorCount);
  const validatedWarningCount = validateCount("warningCount", body.warningCount);
  const validatedNetworkRequestCount = validateCount("networkRequestCount", body.networkRequestCount);
  const validatedNetworkErrorCount = validateCount("networkErrorCount", body.networkErrorCount);

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
    // Phase 4: console-log capture (post-validation). Repository skips
    // undefined fields, so empty/missing values produce a clean document.
    consoleLogs: validatedConsoleLogs,
    exceptions: validatedExceptions,
    consoleLogCount: validatedConsoleLogCount,
    exceptionCount: validatedExceptionCount,
    errorCount: validatedErrorCount,
    warningCount: validatedWarningCount,
    // Phase N4: network-request capture (post-validation). Repository skips
    // undefined fields, so empty/missing values produce a clean document.
    networkRequests: validatedNetworkRequests,
    networkRequestCount: validatedNetworkRequestCount,
    networkErrorCount: validatedNetworkErrorCount,
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

