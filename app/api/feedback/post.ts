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
  FeedbackElement,
  NetworkRequestEntry,
  UserAction,
  ElementDescriptor,
  ActionType,
  NavigationMethod,
  ActionVisibilityState,
} from "@/lib/domain/feedback";
import {
  getScreenshotByIdRepo,
} from "@/lib/repositories/screenshotsRepository";
import { corsHeaders } from "@/lib/server/cors";
import { evictOldestUntilFits } from "@/lib/server/evictOldestUntilFits";
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
    // Capture-window honesty stamp: epoch-ms watermark cut when a prior ticket
    // in the same engagement already filed the earlier entries.
    captureWindowStartAt?: unknown;
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
    // Phase A4: user-actions capture from the extension's MAIN-world wrapper.
    userActions?: unknown;
    userActionCount?: unknown;
    // Element identity block: compact identity of the element the recorder
    // selected at ticket-creation time.
    element?: unknown;
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
  //   • cap array length (200, keep newest) and total byte size (100KB,
  //     evict oldest until it fits) so a buggy or compromised client can't
  //     write unbounded blobs to Firestore.
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
    // Keep the NEWEST entries: the merged capture arrays arrive time-ascending,
    // so slice from the END — the entries nearest the report are the evidence;
    // the oldest tail is what a cap should sacrifice.
    const capped = raw.slice(-MAX_LOG_ENTRIES);
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

  // Combined byte cap over logs ∪ exceptions: evict the OLDEST entries (by
  // timestamp, across both streams) until the union fits. The old behaviour
  // dropped BOTH arrays wholesale — written when the client cap was 50KB and
  // an overage meant a misbehaving client; the watermark/engagement merge made
  // large payloads legitimate, and losing every entry (ticket, DevTools tabs,
  // AI analysis) over the cap was strictly worse than losing the oldest tail.
  if (validatedConsoleLogs || validatedExceptions) {
    type TaggedEntry =
      | { stream: "log"; ts: number; entry: ConsoleLogEntry }
      | { stream: "exc"; ts: number; entry: ExceptionEntry };
    const merged: TaggedEntry[] = [
      ...(validatedConsoleLogs ?? []).map(
        (entry): TaggedEntry => ({ stream: "log", ts: entry.timestamp, entry })
      ),
      ...(validatedExceptions ?? []).map(
        (entry): TaggedEntry => ({ stream: "exc", ts: entry.timestamp, entry })
      ),
    ].sort((a, b) => a.ts - b.ts);
    const { kept, evicted } = evictOldestUntilFits(merged, MAX_TOTAL_BYTES, (t) =>
      JSON.stringify(t.entry).length
    );
    if (evicted > 0) {
      console.warn(
        `[feedback] console capture over ${MAX_TOTAL_BYTES} byte cap: evicted ${evicted} oldest entries, kept ${kept.length}`,
      );
      const keptLogs = kept
        .filter((t): t is Extract<TaggedEntry, { stream: "log" }> => t.stream === "log")
        .map((t) => t.entry);
      const keptExceptions = kept
        .filter((t): t is Extract<TaggedEntry, { stream: "exc" }> => t.stream === "exc")
        .map((t) => t.entry);
      validatedConsoleLogs = keptLogs.length > 0 ? keptLogs : undefined;
      validatedExceptions = keptExceptions.length > 0 ? keptExceptions : undefined;
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
  // drops malformed entries individually; the combined byte cap evicts the
  // oldest entries until the rest fits (see evictOldestUntilFits). PII scan
  // over request/response bodies logs warnings; never rejects.
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
    // Keep the NEWEST entries (see validateLogArray) — input is time-ascending.
    const capped = raw.slice(-MAX_NETWORK_ENTRIES);
    const validated: NetworkRequestEntry[] = [];
    for (const entry of capped) {
      const v = validateNetworkRequest(entry);
      if (v !== null) validated.push(v);
    }
    if (validated.length === 0) return undefined;
    const { kept, evicted } = evictOldestUntilFits(validated, MAX_NETWORK_TOTAL_BYTES);
    if (evicted > 0) {
      console.warn(
        `[feedback] networkRequests over ${MAX_NETWORK_TOTAL_BYTES} byte cap: evicted ${evicted} oldest entries, kept ${kept.length}`,
      );
    }
    return kept.length > 0 ? kept : undefined;
  }

  const validatedNetworkRequests = validateNetworkRequestArray(body.networkRequests);

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

  // ─── Phase A4: user-actions capture validation ─────────────────────
  // Same defense-in-depth pattern as console/network. Element fields are
  // already redacted at capture time (text post-redaction; masked: true
  // when withheld). Per-entry shape validation drops malformed entries
  // individually; the combined byte cap evicts the oldest entries until the
  // rest fits. No PII regex sweep — actions don't carry free-form bodies.
  const MAX_USER_ACTIONS = 200;
  const MAX_USER_ACTIONS_TOTAL_BYTES = 100 * 1024;
  const ALLOWED_ACTION_TYPES = new Set<ActionType>([
    "click",
    "navigation",
    "visibility",
    "submit",
    "input",
    "focus",
    "blur",
    "resize",
  ]);
  const ALLOWED_NAVIGATION_METHODS = new Set<NavigationMethod>([
    "pushState",
    "replaceState",
    "popstate",
    "load",
    "hashchange",
  ]);
  const ALLOWED_VISIBILITY_STATES = new Set<ActionVisibilityState>([
    "visible",
    "hidden",
  ]);

  function validateElementDescriptor(value: unknown): ElementDescriptor | null {
    if (!isPlainObject(value)) return null;
    if (typeof value.tag !== "string" || value.tag.length === 0) return null;
    const out: ElementDescriptor = { tag: value.tag };
    if (typeof value.id === "string") out.id = value.id;
    if (Array.isArray(value.classes)) {
      const classes = value.classes.filter((c): c is string => typeof c === "string");
      if (classes.length > 0) out.classes = classes;
    }
    if (isStringRecord(value.attributes)) out.attributes = value.attributes;
    if (typeof value.text === "string") out.text = value.text;
    if (value.masked === true) out.masked = true;
    return out;
  }

  function validateUserAction(entry: unknown): UserAction | null {
    if (!isPlainObject(entry)) return null;
    if (typeof entry.id !== "string" || entry.id.length === 0) return null;
    if (typeof entry.timestamp !== "number") return null;
    if (typeof entry.type !== "string" || !ALLOWED_ACTION_TYPES.has(entry.type as ActionType)) {
      return null;
    }
    const out: UserAction = {
      id: entry.id,
      type: entry.type as ActionType,
      timestamp: entry.timestamp,
    };
    if (entry.element !== undefined) {
      const el = validateElementDescriptor(entry.element);
      if (el) out.element = el;
    }
    if (typeof entry.url === "string") out.url = entry.url;
    if (typeof entry.fromUrl === "string") out.fromUrl = entry.fromUrl;
    if (
      typeof entry.navigationMethod === "string" &&
      ALLOWED_NAVIGATION_METHODS.has(entry.navigationMethod as NavigationMethod)
    ) {
      out.navigationMethod = entry.navigationMethod as NavigationMethod;
    }
    if (
      typeof entry.visibilityState === "string" &&
      ALLOWED_VISIBILITY_STATES.has(entry.visibilityState as ActionVisibilityState)
    ) {
      out.visibilityState = entry.visibilityState as ActionVisibilityState;
    }
    if (
      isPlainObject(entry.viewport) &&
      typeof entry.viewport.width === "number" &&
      typeof entry.viewport.height === "number"
    ) {
      out.viewport = { width: entry.viewport.width, height: entry.viewport.height };
    }
    if (typeof entry.fieldLabel === "string") out.fieldLabel = entry.fieldLabel;
    return out;
  }

  function validateUserActionArray(raw: unknown): UserAction[] | undefined {
    if (raw === undefined || raw === null) return undefined;
    if (!Array.isArray(raw)) {
      console.warn("[feedback] dropped userActions: not an array");
      return undefined;
    }
    // Keep the NEWEST entries (see validateLogArray) — input is time-ascending.
    const capped = raw.slice(-MAX_USER_ACTIONS);
    const validated: UserAction[] = [];
    for (const entry of capped) {
      const v = validateUserAction(entry);
      if (v !== null) validated.push(v);
    }
    if (validated.length === 0) return undefined;
    const { kept, evicted } = evictOldestUntilFits(validated, MAX_USER_ACTIONS_TOTAL_BYTES);
    if (evicted > 0) {
      console.warn(
        `[feedback] userActions over ${MAX_USER_ACTIONS_TOTAL_BYTES} byte cap: evicted ${evicted} oldest entries, kept ${kept.length}`,
      );
    }
    return kept.length > 0 ? kept : undefined;
  }

  const validatedUserActions = validateUserActionArray(body.userActions);

  // ─── Element identity validation ────────────────────────────────────
  // Same defense-in-depth posture as console/network/actions: cap every
  // string, whitelist semanticType, and drop the whole block when neither
  // tag nor semanticIdentifier survives — a block that can't name the
  // element carries no grounding signal. Drop the offending sub-field on
  // failure but accept the rest (never reject the ticket over this).
  const MAX_ELEMENT_TAG_CHARS = 24;
  const MAX_ELEMENT_IDENTIFIER_CHARS = 120;
  const MAX_ELEMENT_STYLES_CHARS = 400;
  const MAX_ELEMENT_MODAL_CHARS = 120;
  const ALLOWED_SEMANTIC_TYPES = new Set([
    "button",
    "link",
    "input",
    "heading",
    "paragraph",
    "image",
    "icon",
    "card",
    "section",
  ]);

  function validateElement(entry: unknown): FeedbackElement | undefined {
    if (!isPlainObject(entry)) return undefined;
    const out: FeedbackElement = {};
    if (typeof entry.tag === "string" && entry.tag.trim().length > 0) {
      out.tag = entry.tag.trim().toLowerCase().slice(0, MAX_ELEMENT_TAG_CHARS);
    }
    if (
      typeof entry.semanticIdentifier === "string" &&
      entry.semanticIdentifier.trim().length > 0
    ) {
      out.semanticIdentifier = entry.semanticIdentifier
        .trim()
        .slice(0, MAX_ELEMENT_IDENTIFIER_CHARS);
    }
    if (
      typeof entry.semanticType === "string" &&
      ALLOWED_SEMANTIC_TYPES.has(entry.semanticType)
    ) {
      out.semanticType = entry.semanticType;
    }
    if (typeof entry.computedStyles === "string" && entry.computedStyles.trim().length > 0) {
      out.computedStyles = entry.computedStyles.trim().slice(0, MAX_ELEMENT_STYLES_CHARS);
    }
    if (typeof entry.modalContext === "string" && entry.modalContext.trim().length > 0) {
      out.modalContext = entry.modalContext.trim().slice(0, MAX_ELEMENT_MODAL_CHARS);
    }
    if (out.tag === undefined && out.semanticIdentifier === undefined) return undefined;
    return out;
  }

  const validatedElement = validateElement(body.element);

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
  const validatedUserActionCount = validateCount("userActionCount", body.userActionCount);

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
    captureWindowStartAt:
      typeof body.captureWindowStartAt === "number" &&
      Number.isFinite(body.captureWindowStartAt) &&
      body.captureWindowStartAt > 0
        ? body.captureWindowStartAt
        : undefined,
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
    // Phase A4: user-actions capture (post-validation). Same undefined-skip
    // contract as console/network — quiet pages produce clean docs.
    userActions: validatedUserActions,
    userActionCount: validatedUserActionCount,
    // Element identity block (post-validation). Same undefined-skip contract —
    // old extension clients that don't send it produce clean docs.
    element: validatedElement,
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

