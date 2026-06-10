/**
 * AI Analysis context assembler (server-side, pure).
 *
 * The quality-determining step for the AI Analysis feature. We do the
 * error↔action↔request CORRELATION here, in code — NOT in the model. The model
 * receives a small, already-aligned, chronological slice where each captured
 * error sits next to the action that triggered it, rather than the full noisy
 * capture buffer.
 *
 * Pipeline:
 *   1. Merge consoleLogs ∪ exceptions ∪ networkRequests ∪ userActions into one
 *      timeline tagged {source, ts}. All four use Date.now() epoch-ms from the
 *      same MAIN-world context, so they're directly correlatable on ts.
 *   2. Find ANCHORS: every exception, every console error, every failed request.
 *   3. WINDOW: keep entries within ±WINDOW_MS of any anchor; drop the long tail
 *      of successful 200s and noise logs outside every window.
 *   4. SANITIZE: replace streaming/binary body sentinels, respect masked actions,
 *      truncate per-entry bodies, then cap the whole block with the token budget.
 *   5. RENDER a compact labeled chronological text block (voiceToTicketPipeline
 *      buildUserMessage style) + description + key metadata.
 *
 * Output { contextText, hasAnchors }. hasAnchors === false → the route takes the
 * honest no-fault path (no fabricated cause for a UX/design report).
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

/** Half-width of the correlation window around each anchor (ms). */
const WINDOW_MS = 3_000;
/** Per-entry char budget for a kept request/response body. */
const BODY_CHAR_BUDGET = 600;
/** Per-entry char budget for a console message / args blob. */
const MESSAGE_CHAR_BUDGET = 800;
/**
 * Overall char cap for the rendered timeline block (≈ tokens × 4). Tightened from
 * 12_000 → 5_000: a ~12K timeline made signal-heavy calls slow enough to time out
 * (the "stuck on pending" root trigger). 5K keeps the actual errors + their
 * triggering actions while trimming the low-signal tail — the model gets a tighter,
 * higher-signal slice that also reasons faster.
 */
const TIMELINE_CHAR_BUDGET = 5_000;
/**
 * Cap on how many anchors we build windows around. On a cascade (one root error
 * spamming dozens of follow-on console errors) the long tail of anchors is mostly
 * duplicate noise; keeping the few MOST diagnostic anchors (exceptions > network
 * faults > console errors, newest-first within a tier) preserves the real fault
 * and its trigger while keeping the windowed set small.
 */
const MAX_ANCHORS = 8;
/** Description is capped separately so a huge body can't crowd out the report. */
const DESCRIPTION_CHAR_BUDGET = 2_000;
/** Capture-site sentinels we replace with a short human note. */
const STREAMING_SENTINEL = "<streaming response>";
const BINARY_SENTINEL = "<binary content>";

type TimelineSource = "console" | "exception" | "network" | "action";

/**
 * Diagnostic weight of an anchor — higher wins a slot when MAX_ANCHORS clips the
 * set. An uncaught exception is the strongest signal, a failed request next, a
 * console error last (often a downstream symptom of the other two).
 */
const ANCHOR_PRIORITY: Record<string, number> = {
  exception: 3,
  network: 2,
  console: 1,
};

interface TimelineEntry {
  source: TimelineSource;
  ts: number;
  /** True for entries that are themselves a fault (used to find anchors). */
  isAnchor: boolean;
  /** Pre-rendered single-line label for this entry. */
  render: () => string;
}

export interface AssembledAnalysisContext {
  /** Compact labeled chronological block + description + metadata. */
  contextText: string;
  /** False → no technical fault detected → the route's no_fault path. */
  hasAnchors: boolean;
}

/** Subset of Feedback the assembler reads. Keeps the signature honest about deps. */
export type AnalyzableFeedback = Pick<
  Feedback,
  | "description"
  | "url"
  | "userAgent"
  | "consoleLogs"
  | "exceptions"
  | "networkRequests"
  | "userActions"
>;

/** Replace streaming/binary sentinels with a short note; truncate kept bodies. */
function sanitizeBody(body: string | null | undefined): string | null {
  if (body == null) return null;
  const trimmed = body.trim();
  if (trimmed.length === 0) return null;
  if (trimmed === STREAMING_SENTINEL) return "[streaming response — body not captured]";
  if (trimmed === BINARY_SENTINEL) return "[binary content — body not captured]";
  return truncateForTokenBudget(trimmed, BODY_CHAR_BUDGET);
}

/** True when a network entry counts as a fault: transport error OR HTTP >= 400. */
function isNetworkFault(req: NetworkRequestEntry): boolean {
  if (req.errored === true) return true;
  return typeof req.status === "number" && req.status >= 400;
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

/** Compact one-line description of a network request (fault-annotated). */
function renderNetwork(req: NetworkRequestEntry): string {
  const fault = isNetworkFault(req);
  const status = req.status != null ? String(req.status) : req.errored ? "ERR" : "pending";
  const dur = req.durationMs != null ? `${Math.round(req.durationMs)}ms` : "?";
  const tag = fault ? "NETWORK FAIL" : "NETWORK";
  const lines = [`[${tag}] ${req.method} ${req.url} → ${status} (${dur})`];
  if (req.errorMessage) lines.push(`    error: ${truncateForTokenBudget(req.errorMessage, 200)}`);
  // Only surface bodies for faulted requests — successful 200 bodies are noise.
  if (fault) {
    const reqBody = sanitizeBody(req.requestBody);
    const resBody = sanitizeBody(req.responseBody);
    if (reqBody) lines.push(`    request body: ${reqBody}`);
    if (resBody) lines.push(`    response body: ${resBody}`);
  }
  return lines.join("\n");
}

/** Build the flat, ts-tagged timeline from all four capture sources. */
function buildTimeline(feedback: AnalyzableFeedback): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const c of feedback.consoleLogs ?? []) {
    entries.push({
      source: "console",
      ts: c.timestamp,
      isAnchor: c.level === "error",
      render: () => renderConsole(c),
    });
  }
  for (const e of feedback.exceptions ?? []) {
    entries.push({
      source: "exception",
      ts: e.timestamp,
      isAnchor: true, // every exception is an anchor
      render: () => renderException(e),
    });
  }
  for (const a of feedback.userActions ?? []) {
    entries.push({
      source: "action",
      ts: a.timestamp,
      isAnchor: false, // actions are context, never anchors
      render: () => renderAction(a),
    });
  }
  for (const req of feedback.networkRequests ?? []) {
    entries.push({
      source: "network",
      ts: req.timestamp,
      isAnchor: isNetworkFault(req),
      render: () => renderNetwork(req),
    });
    // Emit a second virtual point at response-landing time so a request that
    // started before but landed after an action/error still falls in-window.
    if (typeof req.durationMs === "number" && req.durationMs > 0) {
      entries.push({
        source: "network",
        ts: req.timestamp + req.durationMs,
        isAnchor: false, // the landing point is not itself a fresh anchor
        render: () => `${renderNetwork(req)}  [response landed]`,
      });
    }
  }

  return entries.sort((a, b) => a.ts - b.ts);
}

/**
 * Select the MAX_ANCHORS most diagnostic anchors, then keep entries within
 * ±WINDOW_MS of one of THOSE anchors; preserve chronological order.
 *
 * Why clip anchors: a cascade (one root error → dozens of follow-on console
 * errors) produces many low-value anchors whose overlapping windows pull in the
 * whole buffer. Ranking by priority (exception > network > console), then newest
 * within a tier, keeps the real fault + its trigger and drops the duplicate tail —
 * this is what shrinks the windowed set BEFORE the char-budget truncation runs.
 */
function windowAroundAnchors(timeline: TimelineEntry[]): TimelineEntry[] {
  const anchors = timeline.filter((e) => e.isAnchor);
  if (anchors.length === 0) return [];

  const selected =
    anchors.length <= MAX_ANCHORS
      ? anchors
      : [...anchors]
          .sort((a, b) => {
            const pa = ANCHOR_PRIORITY[a.source] ?? 0;
            const pb = ANCHOR_PRIORITY[b.source] ?? 0;
            if (pa !== pb) return pb - pa; // higher priority first
            return b.ts - a.ts; // newest first within a tier
          })
          .slice(0, MAX_ANCHORS);

  const anchorTs = selected.map((e) => e.ts);
  return timeline.filter((e) =>
    anchorTs.some((a) => Math.abs(e.ts - a) <= WINDOW_MS)
  );
}

/** Admission tier for budget fitting — lower number is admitted first. */
const TIER_ANCHOR = 0; // the fault entries themselves (exception / 4xx-5xx / console error)
const TIER_NEIGHBOUR = 1; // entries within ±WINDOW_MS of an anchor (the trigger context)
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
 *   - anchors (exceptions, failed requests, console errors) — guaranteed first,
 *     strongest signal first, so a distant strong fault is never starved by a
 *     dense cluster of weaker ones;
 *   - their ±WINDOW_MS neighbours (the user actions / responses that triggered or
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
    else if (anchorTs.some((a) => Math.abs(e.ts - a) <= WINDOW_MS)) tier = TIER_NEIGHBOUR;
    // Within a tier: anchors rank by source strength (exception > network > console);
    // neighbours/others rank by recency (the trigger sits just before the fault).
    const weight = e.isAnchor ? (ANCHOR_PRIORITY[e.source] ?? 0) : e.ts;
    return { order, text: `t+${rel}ms ${e.render()}`, tier, weight };
  });
  return fitBlocksToBudget(blocks, TIMELINE_CHAR_BUDGET);
}

/**
 * Assemble the analysis context. Pure: same input → same output, no I/O, no
 * Date.now(). Uses denormalized counts to short-circuit cheaply: if there are
 * zero console errors AND zero network errors AND no exceptions, there is no
 * technical fault to analyze → hasAnchors:false (the no-fault path) without
 * even building the timeline.
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

  const metaParts: string[] = [];
  if (feedback.url) metaParts.push(`URL: ${feedback.url}`);
  if (feedback.userAgent)
    metaParts.push(`User agent: ${truncateForTokenBudget(feedback.userAgent, 200)}`);

  // Fault detection scans the ACTUAL entries (source of truth) rather than
  // trusting the denormalized counts — a stale/under-counted networkErrorCount
  // must not let a real 4xx/5xx slip into the no-fault path. The counts are a
  // capture-time hint only; here we look at the data we actually have.
  const hasExceptions = (feedback.exceptions?.length ?? 0) > 0;
  const hasConsoleError = (feedback.consoleLogs ?? []).some(
    (c) => c.level === "error"
  );
  const hasNetworkFault = (feedback.networkRequests ?? []).some((r) =>
    isNetworkFault(r)
  );

  if (!hasExceptions && !hasConsoleError && !hasNetworkFault) {
    // No technical signal in the captured data → honest no-fault path.
    return { contextText: renderNoFaultContext(description, metaParts), hasAnchors: false };
  }

  // There is at least one fault — build and window the timeline to slice it.
  const timeline = buildTimeline(feedback);
  const kept = windowAroundAnchors(timeline);

  if (kept.length === 0) {
    // Counts suggested a fault but no anchor survived (e.g. counts stale) —
    // treat as no-fault rather than feeding the model an empty timeline.
    return { contextText: renderNoFaultContext(description, metaParts), hasAnchors: false };
  }

  const timelineText = renderTimeline(kept);
  const sections: string[] = [];
  sections.push("REPORT DESCRIPTION:");
  sections.push(description || "(no description provided)");
  if (metaParts.length > 0) {
    sections.push("\nPAGE METADATA:");
    sections.push(metaParts.join("\n"));
  }
  sections.push(
    "\nCORRELATED TIMELINE (console errors, network failures, exceptions, and the user actions around them, aligned by capture time):"
  );
  sections.push(timelineText);

  return { contextText: sections.join("\n"), hasAnchors: true };
}

/** Description + metadata only, for the no-fault path (no timeline to show). */
function renderNoFaultContext(description: string, metaParts: string[]): string {
  const sections: string[] = [];
  sections.push("REPORT DESCRIPTION:");
  sections.push(description || "(no description provided)");
  if (metaParts.length > 0) {
    sections.push("\nPAGE METADATA:");
    sections.push(metaParts.join("\n"));
  }
  sections.push(
    "\nCAPTURE SIGNALS: No console errors, network failures, or uncaught exceptions were captured in the recorded window."
  );
  return sections.join("\n");
}
