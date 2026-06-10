/**
 * AI Analysis context assembler (server-side, pure).
 *
 * The quality-determining step for the AI Analysis feature. We do the
 * error↔action↔request CORRELATION here, in code — NOT in the model. The model
 * receives a small, already-aligned, chronological slice where each captured
 * fault sits next to the action that triggered it, rather than the full noisy
 * capture buffer.
 *
 * Pipeline (anchor path — at least one anchor exists):
 *   1. Merge consoleLogs ∪ exceptions ∪ networkRequests ∪ userActions into one
 *      timeline tagged {source, ts}. All four use Date.now() epoch-ms from the
 *      same MAIN-world context, so they're directly correlatable on ts.
 *   2. Find ANCHORS: every exception, every console error, every failed request
 *      (incl. GraphQL errors inside a 2xx body), and — weakly — every slow
 *      successful request (≥ SLOW_REQUEST_MS).
 *   3. DEDUP anchors on a normalized (message-prefix, source) key: a cascade of
 *      identical errors keeps its FIRST occurrence (annotated ×N) instead of
 *      eating every anchor slot with repeats.
 *   4. WINDOW: keep entries inside the asymmetric −LOOKBACK/+LOOKAHEAD band of
 *      any selected anchor (causes precede symptoms, so the lookback is wider);
 *      drop the long tail of successful 200s and noise logs outside every band.
 *   5. SANITIZE: replace streaming/binary body sentinels, respect masked
 *      actions, truncate per-entry bodies (faulted requests get the full body
 *      budget; action-correlated 2xx responses get a tighter one — that's the
 *      "user clicked Save, the response came back wrong" evidence), then cap
 *      the whole block with the char budget by diagnostic priority.
 *   6. RENDER the journey + the compact labeled chronological block +
 *      description + key metadata.
 *
 * No-anchor path (no fault-shaped or slow signal in the capture): the model
 * STILL runs — zero anchors means "no error-shaped defect", NOT "no defect"
 * (wrong-data and visual defects produce zero anchors). The context carries the
 * description, the ticket metadata, the user journey, a slowest-requests
 * summary, and an honest statement of what was and wasn't captured; the MODEL
 * decides between design request, non-error defect, and insufficient signal —
 * never a template.
 *
 * Both paths state the capture-window bounds (including the prior-ticket
 * watermark cut when `captureWindowStartAt` is stamped) so the model can reason
 * about absence of evidence honestly.
 *
 * Output { contextText, hasAnchors }. hasAnchors only tells the route which
 * sanitization fallback applies — both values lead to a model call.
 */

import { truncateForTokenBudget } from "@/lib/ai/pipelineTokenBudget";
import { filterExtensionNoise } from "@/lib/domain/filterExtensionNoise";
import type {
  ConsoleLogEntry,
  ExceptionEntry,
  Feedback,
  NetworkRequestEntry,
  UserAction,
} from "@/lib/domain/feedback";

/**
 * Asymmetric correlation window around each anchor (ms). Causes precede
 * symptoms — the click/navigation/request that TRIGGERED a fault happens before
 * it, often well before (a slow request fails 8s after the click that fired
 * it), while what follows a fault is mostly cascade noise. So we look back
 * further than we look ahead.
 */
const LOOKBACK_MS = 10_000;
const LOOKAHEAD_MS = 3_000;
/** Per-entry char budget for a kept FAULTED request/response body. */
const BODY_CHAR_BUDGET = 600;
/**
 * Tighter per-body budget for action-correlated SUCCESSFUL responses. A 2xx
 * body that came back right after a user action is the only evidence for
 * wrong-data bugs ("the total is wrong") and for GraphQL apps — but it's weaker
 * than a fault body, so it gets a smaller slice of the budget.
 */
const SUCCESS_BODY_CHAR_BUDGET = 300;
/** A 2xx response landing within this window after a click/submit/input counts as action-correlated. */
const ACTION_CORRELATION_MS = 3_000;
/** A successful request at or above this duration is a WEAK anchor (performance evidence). */
const SLOW_REQUEST_MS = 3_000;
/** Per-entry char budget for a console message / args blob. */
const MESSAGE_CHAR_BUDGET = 800;
/**
 * Overall char cap for the rendered timeline block (≈ tokens × 4). History: cut
 * to 5K when a ~12K timeline made signal-heavy calls outrun the function budget
 * — but that failure mode has since been properly fixed by the in-process model
 * call abort (MODEL_CALL_TIMEOUT_MS + maxRetries:0 in the route), so the
 * latency rationale is stale. 11K buys room for the response bodies and journey
 * that diagnose non-error bugs while staying far under the model's context.
 */
const TIMELINE_CHAR_BUDGET = 11_000;
/**
 * Cap on how many anchors we build windows around. Dedup collapses cascades
 * BEFORE this cap applies, so the slots go to DISTINCT faults ranked by
 * diagnostic priority (exceptions > network faults > console errors > slow
 * requests), newest-first within a tier.
 */
const MAX_ANCHORS = 8;
/** Description is capped separately so a huge body can't crowd out the report. */
const DESCRIPTION_CHAR_BUDGET = 2_000;
/**
 * Char cap for the USER JOURNEY section (navigations + clicks/submits/inputs).
 * Actions are one short line each, so this comfortably holds dozens; when a long
 * engagement overflows it we keep the NEWEST actions (closest to filing) and say
 * how many earlier ones were dropped.
 */
const JOURNEY_CHAR_BUDGET = 2_500;
/** How many slowest requests the no-anchor summary lists. */
const SLOW_SUMMARY_COUNT = 5;
/** Anchor message prefix length used for the cascade-dedup key. */
const DEDUP_MESSAGE_PREFIX = 80;
/** Capture-site sentinels we replace with a short human note. */
const STREAMING_SENTINEL = "<streaming response>";
const BINARY_SENTINEL = "<binary content>";

type TimelineSource = "console" | "exception" | "network" | "action";

/**
 * Diagnostic weight of an anchor — higher wins a slot when MAX_ANCHORS clips
 * the set. An uncaught exception is the strongest signal, a failed request
 * next, a console error after that (often a downstream symptom of the other
 * two), and a slow-but-successful request is the weakest (real evidence for
 * performance complaints, but never allowed to evict a hard fault).
 */
const PRIORITY_EXCEPTION = 4;
const PRIORITY_NETWORK_FAULT = 3;
const PRIORITY_CONSOLE_ERROR = 2;
const PRIORITY_SLOW_REQUEST = 1;

interface TimelineEntry {
  source: TimelineSource;
  ts: number;
  /** True for entries that are themselves an anchor (fault or slow request). */
  isAnchor: boolean;
  /** Anchor strength (PRIORITY_*); 0 for non-anchors. */
  anchorPriority: number;
  /**
   * Cascade-dedup identity for anchors (normalized message-prefix + source).
   * Anchors sharing a key collapse to their first occurrence, annotated ×N.
   * Undefined for non-anchors.
   */
  dedupKey?: string;
  /** Pre-rendered single-line label for this entry. */
  render: () => string;
}

export interface AssembledAnalysisContext {
  /** Compact labeled chronological block + description + metadata. */
  contextText: string;
  /**
   * False → no anchor-shaped signal in the capture; the context carries the
   * journey/slow-summary/metadata instead of a correlated timeline. The model
   * runs either way — this only selects the route's sanitization fallback.
   */
  hasAnchors: boolean;
}

/** Subset of Feedback the assembler reads. Keeps the signature honest about deps. */
export type AnalyzableFeedback = Pick<
  Feedback,
  | "title"
  | "description"
  | "tags"
  | "pageArea"
  | "url"
  | "userAgent"
  | "viewportWidth"
  | "viewportHeight"
  | "screenWidth"
  | "screenHeight"
  | "devicePixelRatio"
  | "clientTimestamp"
  | "captureWindowStartAt"
  | "consoleLogs"
  | "exceptions"
  | "networkRequests"
  | "userActions"
>;

/** Replace streaming/binary sentinels with a short note; truncate kept bodies. */
function sanitizeBody(
  body: string | null | undefined,
  budget: number = BODY_CHAR_BUDGET
): string | null {
  if (body == null) return null;
  const trimmed = body.trim();
  if (trimmed.length === 0) return null;
  if (trimmed === STREAMING_SENTINEL) return "[streaming response — body not captured]";
  if (trimmed === BINARY_SENTINEL) return "[binary content — body not captured]";
  return truncateForTokenBudget(trimmed, budget);
}

/** True when a network entry counts as a fault: transport error OR HTTP >= 400. */
function isNetworkFault(req: NetworkRequestEntry): boolean {
  if (req.errored === true) return true;
  return typeof req.status === "number" && req.status >= 400;
}

function is2xx(req: NetworkRequestEntry): boolean {
  return typeof req.status === "number" && req.status >= 200 && req.status < 300;
}

/**
 * GraphQL heuristic: a 2xx response whose body carries a top-level "errors"
 * array IS a failed request — GraphQL apps put every error inside a 200, which
 * the status-code fault test is blind to. Exact when the body parses (linear
 * time, bodies are capture-capped); for truncated/unparseable bodies, fall back
 * to a narrow prefix test for the GraphQL error shape ("errors":[{"message").
 */
function hasGraphQLErrorsBody(req: NetworkRequestEntry): boolean {
  if (!is2xx(req)) return false;
  const body = req.responseBody;
  if (typeof body !== "string" || body.length === 0) return false;
  if (!body.trimStart().startsWith("{")) return false;
  if (!body.includes('"errors"')) return false; // cheap pre-filter
  try {
    const parsed = JSON.parse(body) as { errors?: unknown };
    return Array.isArray(parsed.errors) && parsed.errors.length > 0;
  } catch {
    // Truncated body — match the canonical GraphQL error shape only.
    return /"errors"\s*:\s*\[\s*\{\s*"message"/.test(body);
  }
}

/** Fault test for the assembler's anchor model: transport/4xx+ OR GraphQL errors-in-200. */
function isAnalysisNetworkFault(req: NetworkRequestEntry): boolean {
  return isNetworkFault(req) || hasGraphQLErrorsBody(req);
}

/** True for a successful request slow enough to be performance evidence. */
function isSlowRequest(req: NetworkRequestEntry): boolean {
  return (
    !isAnalysisNetworkFault(req) &&
    typeof req.durationMs === "number" &&
    req.durationMs >= SLOW_REQUEST_MS
  );
}

/** Compact one-line description of a captured user action (privacy-aware). */
function renderAction(a: UserAction): string {
  const parts: string[] = [`[ACTION] ${a.type}`];
  const el = a.element;
  const masked = el?.masked === true;
  if (el) {
    if (masked) {
      // Respect masked actions — a privacy attribute matched, details withheld.
      parts.push(`on <${el.tag} (masked)>`);
    } else {
      const id = el.id ? `#${el.id}` : "";
      const label = el.text ? ` "${truncateForTokenBudget(el.text, 80)}"` : "";
      parts.push(`on <${el.tag}${id}>${label}`);
    }
  }
  // fieldLabel is sensitive metadata for inputs (e.g. "password", "ssn"); withhold
  // it too when the action is masked — never invent detail for a masked action.
  if (a.fieldLabel && !masked) parts.push(`field="${a.fieldLabel}"`);
  if (a.type === "navigation") {
    if (a.fromUrl) parts.push(`from ${a.fromUrl}`);
    if (a.url) parts.push(`to ${a.url}`);
    if (a.navigationMethod) parts.push(`(${a.navigationMethod})`);
  }
  return parts.join(" ");
}

/** Compact one-line description of a console entry. */
function renderConsole(c: ConsoleLogEntry): string {
  const msg = truncateForTokenBudget(c.message ?? "", MESSAGE_CHAR_BUDGET);
  const extra =
    Array.isArray(c.args) && c.args.length > 0
      ? ` | args: ${truncateForTokenBudget(c.args.join(" "), 200)}`
      : "";
  return `[CONSOLE ${c.level.toUpperCase()}] ${msg}${extra}`;
}

/** Compact one-line description of an uncaught error / rejection. */
function renderException(e: ExceptionEntry): string {
  const where =
    e.line != null ? ` @${e.source ?? "?"}:${e.line}:${e.column ?? "?"}` : "";
  const stack = e.stack
    ? `\n    stack: ${truncateForTokenBudget(e.stack, 400)}`
    : "";
  return `[EXCEPTION ${e.type}] ${truncateForTokenBudget(e.message ?? "", MESSAGE_CHAR_BUDGET)}${where}${stack}`;
}

/** Per-request render decisions, computed once in buildTimeline. */
interface NetworkRenderFlags {
  /** Transport error / HTTP >= 400 / GraphQL errors-in-200. */
  fault: boolean;
  /** Fault came from the GraphQL errors-in-200 heuristic (annotated). */
  graphQLFault: boolean;
  /** Successful but ≥ SLOW_REQUEST_MS (weak anchor, annotated). */
  slow: boolean;
  /** 2xx that landed shortly after a click/submit/input → include its body. */
  actionCorrelated: boolean;
}

/** Compact description of a network request (fault/slow annotated, body-budgeted). */
function renderNetwork(req: NetworkRequestEntry, flags: NetworkRenderFlags): string {
  const status = req.status != null ? String(req.status) : req.errored ? "ERR" : "pending";
  const dur = req.durationMs != null ? `${Math.round(req.durationMs)}ms` : "?";
  const tag = flags.fault ? "NETWORK FAIL" : flags.slow ? "NETWORK SLOW" : "NETWORK";
  const gqlNote = flags.graphQLFault ? " (GraphQL errors in 2xx body)" : "";
  const lines = [`[${tag}] ${req.method} ${req.url} → ${status} (${dur})${gqlNote}`];
  if (req.errorMessage) lines.push(`    error: ${truncateForTokenBudget(req.errorMessage, 200)}`);
  if (flags.fault) {
    // Faulted requests carry their bodies at the full budget — the error payload
    // is usually the diagnosis.
    const reqBody = sanitizeBody(req.requestBody);
    const resBody = sanitizeBody(req.responseBody);
    if (reqBody) lines.push(`    request body: ${reqBody}`);
    if (resBody) lines.push(`    response body: ${resBody}`);
  } else if (flags.actionCorrelated) {
    // Action-correlated 2xx: the response the user's action produced. This is
    // the only evidence for "the data that came back is wrong" — included at a
    // tighter budget since nothing in it is error-shaped.
    const resBody = sanitizeBody(req.responseBody, SUCCESS_BODY_CHAR_BUDGET);
    if (resBody) lines.push(`    response body: ${resBody}`);
  }
  return lines.join("\n");
}

/**
 * Ticket metadata lines for the model. All of this is already persisted on the
 * doc and costs a handful of tokens: the title carries the interpreter's
 * distilled claim, tags carry its bug-vs-request classification, and the
 * viewport/screen/DPR are the only numbers that matter for layout reports.
 */
function buildMetaParts(feedback: AnalyzableFeedback): string[] {
  const parts: string[] = [];
  if (feedback.title) parts.push(`Title: ${truncateForTokenBudget(feedback.title, 150)}`);
  if (Array.isArray(feedback.tags) && feedback.tags.length > 0) {
    parts.push(`Tags: ${feedback.tags.slice(0, 8).join(", ")}`);
  }
  if (feedback.pageArea) parts.push(`Page area: ${truncateForTokenBudget(feedback.pageArea, 60)}`);
  if (feedback.url) parts.push(`URL: ${feedback.url}`);
  if (feedback.viewportWidth != null && feedback.viewportHeight != null) {
    parts.push(`Viewport: ${feedback.viewportWidth}×${feedback.viewportHeight}`);
  }
  if (feedback.screenWidth != null && feedback.screenHeight != null) {
    const dpr = feedback.devicePixelRatio != null ? ` @${feedback.devicePixelRatio}x` : "";
    parts.push(`Screen: ${feedback.screenWidth}×${feedback.screenHeight}${dpr}`);
  }
  if (feedback.userAgent)
    parts.push(`User agent: ${truncateForTokenBudget(feedback.userAgent, 200)}`);
  return parts;
}

/** Action types that constitute the user's journey; focus/blur/visibility/resize are noise here. */
const JOURNEY_ACTION_TYPES = new Set<UserAction["type"]>([
  "click",
  "navigation",
  "submit",
  "input",
]);

/** Action types that can plausibly trigger a request whose response we should show. */
const CORRELATING_ACTION_TYPES = new Set<UserAction["type"]>([
  "click",
  "submit",
  "input",
]);

/**
 * Compact USER JOURNEY block: every navigation/click/submit/input across the
 * captured engagement, one line each, relative-timed from the first kept action,
 * closed with a "ticket filed at t+N" marker (from clientTimestamp) so the model
 * can judge how stale each step is. Returns null when nothing was captured.
 * Overflow keeps the NEWEST actions — the steps nearest the report matter most.
 */
function renderJourney(feedback: AnalyzableFeedback): string | null {
  const actions = (feedback.userActions ?? [])
    .filter((a) => JOURNEY_ACTION_TYPES.has(a.type))
    .sort((a, b) => a.timestamp - b.timestamp);
  if (actions.length === 0) return null;

  const t0 = actions[0].timestamp;
  let lines = actions.map(
    (a) => `t+${Math.max(0, Math.round(a.timestamp - t0))}ms ${renderAction(a)}`
  );
  let omitted = 0;
  // Trim oldest-first until the block fits — whole lines only.
  while (lines.length > 1 && lines.join("\n").length > JOURNEY_CHAR_BUDGET) {
    lines = lines.slice(1);
    omitted += 1;
  }
  if (omitted > 0) {
    lines.unshift(`… (${omitted} earlier actions omitted for length)`);
  }
  if (
    typeof feedback.clientTimestamp === "number" &&
    feedback.clientTimestamp >= t0
  ) {
    lines.push(`t+${Math.round(feedback.clientTimestamp - t0)}ms [TICKET FILED]`);
  }
  return lines.join("\n");
}

/** How many action-correlated responses the no-anchor context lists. */
const ACTION_RESPONSE_COUNT = 3;

/**
 * Action-correlated responses for the no-anchor path. A wrong-data bug ("the
 * total is wrong") produces ZERO anchors — the only evidence is the successful
 * response the user's action came back with. With no timeline to window, this
 * section carries that evidence directly: the LATEST few 2xx responses that
 * landed right after a click/submit/input, bodies at the tight success budget.
 */
function renderActionResponseSummary(feedback: AnalyzableFeedback): string | null {
  const correlatingActionTs = (feedback.userActions ?? [])
    .filter((a) => CORRELATING_ACTION_TYPES.has(a.type))
    .map((a) => a.timestamp);
  if (correlatingActionTs.length === 0) return null;

  const correlated = (feedback.networkRequests ?? []).filter(
    (r) =>
      is2xx(r) &&
      typeof r.responseBody === "string" &&
      r.responseBody.length > 0 &&
      correlatingActionTs.some(
        (ts) => r.timestamp >= ts && r.timestamp - ts <= ACTION_CORRELATION_MS
      )
  );
  if (correlated.length === 0) return null;

  // Newest first — the responses nearest the report are the likeliest evidence.
  const latest = [...correlated]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, ACTION_RESPONSE_COUNT);
  return latest
    .map((r) => {
      const dur = r.durationMs != null ? `${Math.round(r.durationMs)}ms` : "?";
      const body = sanitizeBody(r.responseBody, SUCCESS_BODY_CHAR_BUDGET);
      const bodyLine = body ? `\n    response body: ${body}` : "";
      return `${r.method} ${r.url} → ${r.status} (${dur})${bodyLine}`;
    })
    .join("\n");
}

/**
 * Slowest-requests summary for the no-anchor path: when nothing failed, request
 * timing is the strongest remaining technical signal (it is the ONLY evidence
 * for a performance complaint). Lists the top SLOW_SUMMARY_COUNT by duration.
 */
function renderSlowRequestSummary(feedback: AnalyzableFeedback): string | null {
  const timed = (feedback.networkRequests ?? []).filter(
    (r): r is NetworkRequestEntry & { durationMs: number } =>
      typeof r.durationMs === "number" && r.durationMs > 0
  );
  if (timed.length === 0) return null;
  const slowest = [...timed]
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, SLOW_SUMMARY_COUNT);
  return slowest
    .map((r) => {
      const status = r.status != null ? String(r.status) : r.errored ? "ERR" : "pending";
      return `${r.method} ${r.url} → ${status} (${Math.round(r.durationMs)}ms)`;
    })
    .join("\n");
}

/**
 * Honest statement of the capture window's bounds. When the prior-ticket
 * watermark cut applies (captureWindowStartAt stamped at file time), the model
 * must know the window BEGINS there — "no signals" on such a ticket means "none
 * since the prior ticket", not "none at all".
 */
function captureWindowNote(feedback: AnalyzableFeedback): string | null {
  if (typeof feedback.captureWindowStartAt !== "number") return null;
  const filedAt = feedback.clientTimestamp;
  const span =
    typeof filedAt === "number" && filedAt > feedback.captureWindowStartAt
      ? ` (~${Math.round((filedAt - feedback.captureWindowStartAt) / 1000)}s before this ticket was filed)`
      : "";
  return (
    `NOTE: the captured window BEGINS after a prior ticket was filed from the same browsing session${span}. ` +
    `Anything that happened before that prior ticket is not in view here — it was filed with that ticket, not lost.`
  );
}

/** Normalized message prefix for the cascade-dedup key. */
function dedupPrefix(message: string | null | undefined): string {
  return (message ?? "").trim().slice(0, DEDUP_MESSAGE_PREFIX);
}

/** Build the flat, ts-tagged timeline from all four capture sources. */
function buildTimeline(feedback: AnalyzableFeedback): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const c of feedback.consoleLogs ?? []) {
    const isError = c.level === "error";
    entries.push({
      source: "console",
      ts: c.timestamp,
      isAnchor: isError,
      anchorPriority: isError ? PRIORITY_CONSOLE_ERROR : 0,
      dedupKey: isError ? `console|${dedupPrefix(c.message)}|${c.source ?? ""}` : undefined,
      render: () => renderConsole(c),
    });
  }
  for (const e of feedback.exceptions ?? []) {
    entries.push({
      source: "exception",
      ts: e.timestamp,
      isAnchor: true, // every exception is an anchor
      anchorPriority: PRIORITY_EXCEPTION,
      dedupKey: `exception|${dedupPrefix(e.message)}|${e.source ?? ""}`,
      render: () => renderException(e),
    });
  }
  for (const a of feedback.userActions ?? []) {
    entries.push({
      source: "action",
      ts: a.timestamp,
      isAnchor: false, // actions are context, never anchors
      anchorPriority: 0,
      render: () => renderAction(a),
    });
  }

  // Action timestamps that can mark a following 2xx response as user-triggered.
  const correlatingActionTs = (feedback.userActions ?? [])
    .filter((a) => CORRELATING_ACTION_TYPES.has(a.type))
    .map((a) => a.timestamp);

  for (const req of feedback.networkRequests ?? []) {
    const graphQLFault = hasGraphQLErrorsBody(req);
    const fault = isNetworkFault(req) || graphQLFault;
    const slow = !fault && isSlowRequest(req);
    const actionCorrelated =
      !fault &&
      is2xx(req) &&
      correlatingActionTs.some(
        (ts) => req.timestamp >= ts && req.timestamp - ts <= ACTION_CORRELATION_MS
      );
    const flags: NetworkRenderFlags = { fault, graphQLFault, slow, actionCorrelated };

    entries.push({
      source: "network",
      ts: req.timestamp,
      isAnchor: fault || slow,
      anchorPriority: fault ? PRIORITY_NETWORK_FAULT : slow ? PRIORITY_SLOW_REQUEST : 0,
      dedupKey:
        fault || slow
          ? `${fault ? "netfail" : "netslow"}|${req.method} ${req.url}|${req.status ?? "ERR"}`
          : undefined,
      render: () => renderNetwork(req, flags),
    });
    // Emit a second virtual point at response-landing time so a request that
    // started before but landed after an action/error still falls in-window.
    // A one-line stub — the full entry (bodies included) already rendered at
    // start time; duplicating it here would burn budget on repetition.
    if (typeof req.durationMs === "number" && req.durationMs > 0) {
      const status = req.status != null ? String(req.status) : req.errored ? "ERR" : "pending";
      entries.push({
        source: "network",
        ts: req.timestamp + req.durationMs,
        isAnchor: false, // the landing point is not itself a fresh anchor
        anchorPriority: 0,
        render: () => `[response landed] ${req.method} ${req.url} → ${status}`,
      });
    }
  }

  return entries.sort((a, b) => a.ts - b.ts);
}

/**
 * Collapse anchor cascades: anchors sharing a dedup key keep only their FIRST
 * occurrence (the root of the cascade — users reproduce the bug, then spend
 * 30-60s dictating, so the first hit is theirs and the tail is repeats), with
 * the kept entry annotated "(×N repeats)". Duplicate anchor entries are removed
 * from the timeline entirely — they carry no information the annotation
 * doesn't, and the budget they'd burn is better spent on bodies and journey.
 * Non-anchor entries pass through untouched.
 */
function dedupeAnchorCascades(timeline: TimelineEntry[]): TimelineEntry[] {
  const counts = new Map<string, number>();
  for (const e of timeline) {
    if (e.isAnchor && e.dedupKey) {
      counts.set(e.dedupKey, (counts.get(e.dedupKey) ?? 0) + 1);
    }
  }
  const seen = new Set<string>();
  const out: TimelineEntry[] = [];
  for (const e of timeline) {
    if (!e.isAnchor || !e.dedupKey) {
      out.push(e);
      continue;
    }
    if (seen.has(e.dedupKey)) continue; // duplicate of an earlier anchor — drop
    seen.add(e.dedupKey);
    const n = counts.get(e.dedupKey) ?? 1;
    if (n > 1) {
      const baseRender = e.render;
      out.push({ ...e, render: () => `${baseRender()}  (×${n} repeats)` });
    } else {
      out.push(e);
    }
  }
  return out;
}

/** True when `ts` falls inside the asymmetric band of anchor time `anchorTs`. */
function inWindow(ts: number, anchorTs: number): boolean {
  return ts >= anchorTs - LOOKBACK_MS && ts <= anchorTs + LOOKAHEAD_MS;
}

/**
 * Select the MAX_ANCHORS most diagnostic anchors, then keep entries within the
 * asymmetric −LOOKBACK/+LOOKAHEAD band of one of THOSE anchors; preserve
 * chronological order.
 *
 * Cascades are already collapsed by dedupeAnchorCascades, so the slots here go
 * to DISTINCT signals: ranked by priority (exception > network fault > console
 * error > slow request), then newest within a tier.
 */
function windowAroundAnchors(timeline: TimelineEntry[]): TimelineEntry[] {
  const anchors = timeline.filter((e) => e.isAnchor);
  if (anchors.length === 0) return [];

  const selected =
    anchors.length <= MAX_ANCHORS
      ? anchors
      : [...anchors]
          .sort((a, b) => {
            if (a.anchorPriority !== b.anchorPriority) {
              return b.anchorPriority - a.anchorPriority; // higher priority first
            }
            return b.ts - a.ts; // newest first within a tier
          })
          .slice(0, MAX_ANCHORS);

  const selectedSet = new Set(selected);
  const anchorTs = selected.map((e) => e.ts);
  return timeline.filter(
    (e) => selectedSet.has(e) || anchorTs.some((a) => inWindow(e.ts, a))
  );
}

/** Admission tier for budget fitting — lower number is admitted first. */
const TIER_ANCHOR = 0; // the anchor entries themselves (faults / slow requests)
const TIER_NEIGHBOUR = 1; // entries within an anchor's band (the trigger context)
const TIER_OTHER = 2; // everything else that survived windowing

interface RenderedBlock {
  /** Original chronological index — used to restore order after priority sort. */
  order: number;
  /** Relative-time labeled, possibly multi-line, entry text. */
  text: string;
  /** Admission tier (TIER_*). */
  tier: number;
  /** Tie-break weight WITHIN a tier — stronger signal admitted first. */
  weight: number;
}

/**
 * Fit blocks into the char budget by PRIORITY, not by chronological position.
 *
 * The trap this avoids: when proximity-to-an-anchor marks a whole dense early
 * region as "context", a chronological fill can spend the entire budget there and
 * truncate a later-but-stronger anchor (e.g. the uncaught exception) right out.
 * So we admit in tiers — every anchor ENTRY first (strongest signal first), then
 * the neighbouring trigger context, then the remainder — and only drop from the
 * low-signal tail. The kept set is re-sorted into chronological order before
 * joining, so the model still reads a coherent timeline. Whole entries only —
 * never cut a block mid-way (which would feed the model a garbled line).
 */
function fitBlocksToBudget(blocks: RenderedBlock[], maxChars: number): string {
  const kept = new Set<number>();
  let used = 0;
  // Admit tier 0 (anchors) → tier 1 (neighbours) → tier 2 (rest); within a tier,
  // higher weight first so the strongest signal wins the last few chars of budget.
  const byPriority = [...blocks].sort((a, b) =>
    a.tier !== b.tier ? a.tier - b.tier : b.weight - a.weight
  );
  for (const b of byPriority) {
    const cost = b.text.length + 1; // +1 for the joining newline
    if (used + cost > maxChars) continue; // skip this one, keep trying smaller later ones
    kept.add(b.order);
    used += cost;
  }
  const ordered = blocks
    .filter((b) => kept.has(b.order))
    .sort((a, b) => a.order - b.order)
    .map((b) => b.text);
  const omitted = blocks.length - ordered.length;
  if (omitted > 0) {
    ordered.push(`… (${omitted} lower-signal entries omitted for length)`);
  }
  return ordered.join("\n");
}

/**
 * Render the kept timeline as relative-time labeled entries (t+Nms from start),
 * fitting the char budget by diagnostic priority (see fitBlocksToBudget):
 *   - anchors (exceptions, failed requests, console errors, slow requests) —
 *     guaranteed first, strongest signal first, so a distant strong fault is
 *     never starved by a dense cluster of weaker ones;
 *   - their in-band neighbours (the user actions / responses that triggered or
 *     surround the fault) — the trigger context;
 *   - the remaining low-signal tail — trimmed first when the budget is tight.
 */
function renderTimeline(kept: TimelineEntry[]): string {
  if (kept.length === 0) return "";
  const t0 = kept[0].ts;
  const anchorTs = kept.filter((e) => e.isAnchor).map((e) => e.ts);
  const blocks: RenderedBlock[] = kept.map((e, order) => {
    const rel = Math.max(0, Math.round(e.ts - t0));
    let tier = TIER_OTHER;
    if (e.isAnchor) tier = TIER_ANCHOR;
    else if (anchorTs.some((a) => inWindow(e.ts, a))) tier = TIER_NEIGHBOUR;
    // Within a tier: anchors rank by strength (exception > network fault >
    // console error > slow request); neighbours/others rank by recency (the
    // trigger sits just before the fault).
    const weight = e.isAnchor ? e.anchorPriority : e.ts;
    return { order, text: `t+${rel}ms ${e.render()}`, tier, weight };
  });
  return fitBlocksToBudget(blocks, TIMELINE_CHAR_BUDGET);
}

/**
 * Assemble the analysis context. Pure: same input → same output, no I/O, no
 * Date.now(). Anchor detection scans the actual entries; when no anchor-shaped
 * signal exists the context switches from the correlated timeline to the
 * journey/slow-summary form — but a context is ALWAYS produced, because the
 * model always runs.
 */
export function assembleAnalysisContext(
  rawFeedback: AnalyzableFeedback
): AssembledAnalysisContext {
  // Strip extension-originated noise before any reasoning. New tickets are
  // already clean (the extension drops it at capture time), but RE-analyzing an
  // OLD ticket would otherwise still feed the model our widget's own
  // chrome-extension:// "Failed to fetch" — the exact entry that produced the
  // bogus "a chrome-extension script" root cause. Filtering here keeps the AI
  // input identical to what the DevTools tabs now render (both run the same
  // filter), so the two stay consistent by design. Scheme/prefix only — a
  // same-origin page fault on annote.ai or a customer's own site is preserved.
  const cleaned = filterExtensionNoise(rawFeedback);
  const feedback: AnalyzableFeedback = {
    ...rawFeedback,
    consoleLogs: cleaned.consoleLogs,
    exceptions: cleaned.exceptions,
    networkRequests: cleaned.networkRequests,
  };
  const description =
    typeof feedback.description === "string"
      ? truncateForTokenBudget(feedback.description.trim(), DESCRIPTION_CHAR_BUDGET)
      : "";

  const metaParts = buildMetaParts(feedback);
  const windowNote = captureWindowNote(feedback);
  const journey = renderJourney(feedback);

  // Anchor detection scans the ACTUAL entries (source of truth) rather than
  // trusting the denormalized counts — a stale/under-counted networkErrorCount
  // must not let a real 4xx/5xx slip onto the no-anchor path. The counts are a
  // capture-time hint only; here we look at the data we actually have. Slow
  // successful requests count: they're weak anchors (performance evidence).
  const hasExceptions = (feedback.exceptions?.length ?? 0) > 0;
  const hasConsoleError = (feedback.consoleLogs ?? []).some(
    (c) => c.level === "error"
  );
  const hasNetworkAnchor = (feedback.networkRequests ?? []).some(
    (r) => isAnalysisNetworkFault(r) || isSlowRequest(r)
  );

  // No anchor-shaped signal: build the non-fault context. The model still runs
  // and decides the verdict.
  if (!hasExceptions && !hasConsoleError && !hasNetworkAnchor) {
    return {
      contextText: renderNoAnchorContext(feedback, description, metaParts, windowNote, journey),
      hasAnchors: false,
    };
  }

  // There is at least one anchor — build, dedup, and window the timeline.
  const timeline = dedupeAnchorCascades(buildTimeline(feedback));
  const kept = windowAroundAnchors(timeline);

  if (kept.length === 0) {
    // An anchor was detected above but none survived selection (defensive —
    // should not happen since every anchor admits itself). Fall back to the
    // non-fault context rather than feeding the model an empty timeline.
    return {
      contextText: renderNoAnchorContext(feedback, description, metaParts, windowNote, journey),
      hasAnchors: false,
    };
  }

  const timelineText = renderTimeline(kept);
  const sections: string[] = [];
  sections.push("REPORT DESCRIPTION:");
  sections.push(description || "(no description provided)");
  if (metaParts.length > 0) {
    sections.push("\nTICKET METADATA:");
    sections.push(metaParts.join("\n"));
  }
  if (windowNote) {
    sections.push(`\n${windowNote}`);
  }
  // The journey rides along on the anchor path too: multi-step and intermittent
  // bugs need the cross-page flow even when a fault sits in the timeline — the
  // timeline shows ±seconds around faults; the journey shows how the user got
  // there. One line per action, capped, cheap.
  if (journey) {
    sections.push(
      "\nUSER JOURNEY (navigations, clicks, submits, and inputs captured across the engagement; t+Nms is relative to the first kept action):"
    );
    sections.push(journey);
  }
  sections.push(
    "\nCORRELATED TIMELINE (console errors, network failures, slow requests, exceptions, and the user actions around them, aligned by capture time):"
  );
  sections.push(timelineText);

  return { contextText: sections.join("\n"), hasAnchors: true };
}

/**
 * Context for the no-anchor path. No anchor-shaped signal exists, so instead of
 * a correlated timeline the model gets the strongest non-fault evidence
 * available: the user's journey, request timing, and the ticket metadata — plus
 * an explicit, honest statement of what the capture did and didn't see, so it
 * can distinguish "design request" from "non-error defect" from "insufficient
 * signal".
 */
function renderNoAnchorContext(
  feedback: AnalyzableFeedback,
  description: string,
  metaParts: string[],
  windowNote: string | null,
  journey: string | null
): string {
  const sections: string[] = [];
  sections.push("REPORT DESCRIPTION:");
  sections.push(description || "(no description provided)");
  if (metaParts.length > 0) {
    sections.push("\nTICKET METADATA:");
    sections.push(metaParts.join("\n"));
  }

  sections.push(
    "\nUSER JOURNEY (navigations, clicks, submits, and inputs captured across the engagement; t+Nms is relative to the first kept action):"
  );
  sections.push(journey ?? "(no user actions were captured)");

  const actionResponses = renderActionResponseSummary(feedback);
  if (actionResponses) {
    sections.push(
      "\nRESPONSES TO USER ACTIONS (successful requests that immediately followed a user action — shown because when nothing errored, the data that came back IS the evidence):"
    );
    sections.push(actionResponses);
  }

  const slowSummary = renderSlowRequestSummary(feedback);
  if (slowSummary) {
    sections.push("\nSLOWEST REQUESTS (all completed without error; listed by duration):");
    sections.push(slowSummary);
  }

  sections.push(
    "\nCAPTURE SIGNALS: No console errors, failed requests, or uncaught exceptions were captured in the recorded window."
  );
  if (windowNote) {
    sections.push(windowNote);
  }
  return sections.join("\n");
}
