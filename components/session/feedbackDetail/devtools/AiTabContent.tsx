"use client";

import * as React from "react";
import { Sparkles, RotateCw } from "lucide-react";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoActivityIllu } from "@/components/empty/canvasIllustrations";

export type AiAnalysisStatus =
  | "pending"
  | "complete"
  | "no_fault"
  | "error"
  | null
  | undefined;

/**
 * The model's verdict on how the captured signals relate to the report. Rendered
 * as a verdict badge above the cause so the developer sees WHY the AI did or did not
 * connect the evidence to what the user described:
 *   "related"        — a captured signal plausibly explains the report;
 *   "unrelated"      — signals were captured but look disconnected from the report;
 *   "design_request" — the report is a design/UX/content change, not a defect;
 *   "no_signal"      — nothing captured confirms OR rules out the report; it may
 *                      well be a real defect the capture didn't see.
 */
export type AiSignalRelation =
  | "related"
  | "unrelated"
  | "design_request"
  | "no_signal"
  | null
  | undefined;

export interface AiTabContentProps {
  aiSummary?: string | null;
  /**
   * Legacy/compat run-on cause+fix. Rendered as prose ONLY when the structured
   * fields below are absent (old-shape tickets) and on the no-fault path.
   */
  aiFixSuggestion?: string | null;
  /** Structured: one-line likely cause (new shape). */
  aiCause?: string | null;
  /** Structured: discrete fix steps, rendered as an ordered list (new shape). */
  aiFixSteps?: string[] | null;
  /** Structured: the model's relatedness verdict, rendered as a badge (new shape). */
  aiSignalRelation?: AiSignalRelation;
  /** Model confidence 0-1 IN THE VERDICT (not in a technical cause). */
  aiConfidence?: number | null;
  aiAnalysisStatus?: AiAnalysisStatus;
  /**
   * Capture-window honesty stamp (epoch ms) — present when this ticket's USER
   * ACTIONS were cut at a prior ticket's watermark. Scoped to actions only:
   * console/exceptions/network are full live-buffer snapshots, not windowed.
   * Rendered as a small framing note so "no related actions" reads as "none
   * since the prior ticket".
   */
  captureWindowStartAt?: number | null;
  /**
   * Ticket id — used only to reset the bounded-loading timer when the open
   * ticket changes (so switching tickets restarts the clock, never inherits a
   * stale "taking too long" from a previous ticket).
   */
  ticketId?: string | null;
  /**
   * Client-side request error (the analyze POST failed/returned non-OK without a
   * terminal doc status — auth/access/rate/quota/500). When true the panel shows
   * the unavailable+retry state instead of an infinite spinner, even though the
   * doc status is still null/pending. See the analyze-trigger in SessionPageClient.
   */
  clientError?: boolean;
  /** Manual retry — re-fires the analyze POST (clears the fired-guard + error). */
  onRetry?: () => void;
}

/**
 * Bounded-loading ceiling. The route's single model call is capped at ~22s
 * (MODEL_CALL_TIMEOUT_MS) plus the terminal write; 35s leaves comfortable margin
 * past that. If the panel is still "loading" after this, SOMETHING upstream broke
 * silently (request never sent, listener never delivered, doc frozen) — we show a
 * "taking longer than expected" + retry affordance so the user is NEVER stuck on
 * an infinite spinner. This is the final safety net behind all the other fixes.
 */
const LOADING_TIMEOUT_MS = 35 * 1000;

/**
 * Presentation-only enrichment: wrap recognizable technical tokens in a
 * monospace code-pill so endpoints / status codes / durations / ids / hex
 * codes separate from prose and become instantly scannable — the marketing
 * card's signature move, brought to the AI tab's free-text summary & cause.
 *
 * This is STRICTLY visual: the model's text is untouched; we only segment it
 * for rendering. Patterns are deliberately conservative — each must look
 * unambiguously technical so ordinary prose (years, plain numbers, sentence
 * words) is never pilled. Order matters: the alternation is tried left-to-
 * right per match position, longest/most-specific first.
 */
const TECH_TOKEN_RE = new RegExp(
  [
    // Backtick / single-quote wrapped code: `foo`, 'GET /x' (strip the marks)
    "`[^`]+`",
    // HTTP method + path optionally followed by a status (GET /api/me → 500).
    // The prompt forbids backticks, so this un-fenced shape is the common one.
    // Named group `mps` flags the trailing status so the renderer can colour
    // just that segment (e.g. the 500 in red) while pilling the whole thing.
    "\\b(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\\s+/[\\w\\-./:{}?=&%]*(?:\\s*(?:→|->|—|-|:)?\\s*(?<mps>[1-5]\\d\\d))?\\b",
    // Bare API-ish path: /api/..., /v1/..., at least one more segment
    "/(?:api|v\\d+|graphql|auth|users?|sessions?)\\b[\\w\\-./:{}?=&%]*",
    // HTTP status code in prose, but ONLY when a trigger word makes it
    // unambiguous (status / code / returned / responded / HTTP / a/an + 3 digits).
    // The trigger is matched as context; named group `st` is the code itself, so
    // ordinary 3-digit numbers (years, counts) in prose are never pilled.
    "(?:\\b(?:status(?:\\scode)?|code|returned|returning|responded|response|HTTP|with|threw|got|a|an)\\s+)(?<st>[1-5]\\d\\d)\\b",
    // Durations: 38ms, 1.2s, 250 ms
    "\\b\\d+(?:\\.\\d+)?\\s?(?:ms|s)\\b",
    // Hex color: #15101F or #fff. A BALANCED wrapping "( … )" is consumed and
    // stripped from the pill so the model's "(#15101F)" renders as a clean
    // chip — the first alternative matches the parenthesised form, the second
    // the bare form, so a lone prose paren is never swallowed.
    "\\(#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\)",
    "#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b",
    // camelCase / snake technical identifiers: userId, sessionId, request_id
    "\\b[a-z]+(?:[A-Z][a-z0-9]+)+\\b",
    "\\b[a-z]+_[a-z0-9_]+\\b",
  ].join("|"),
  "g"
);

/** Pill class for an HTTP status code, colour-coded exactly like the Network
 *  status badges: green 2xx · violet 3xx · amber 4xx · red 5xx. */
function statusPillClass(code: number): string {
  if (code >= 500) return "aitab-code dt-code--err";
  if (code >= 400) return "aitab-code dt-code--warn";
  if (code >= 300) return "aitab-code dt-code--info";
  if (code >= 200) return "aitab-code dt-code--ok";
  return "aitab-code";
}

/** A bare 3-digit HTTP status code (string) → its colour-coded pill class. */
function statusClassFor(code: string): string {
  return statusPillClass(Number(code));
}

/** Splits a string into plain-text and code-pill React nodes. Returns the
 *  original string as a single text node when nothing technical is found. */
function renderTechnical(text: string): React.ReactNode {
  if (!text) return text;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  TECH_TOKEN_RE.lastIndex = 0;
  while ((m = TECH_TOKEN_RE.exec(text)) !== null) {
    const raw = m[0];
    const start = m.index;
    const groups = m.groups ?? {};
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));

    // Case 1: prose status code with a trigger word ("returned a 500"). Only
    // the digits pill (coloured); the trigger word stays plain text.
    if (groups.st) {
      const codeStart = raw.lastIndexOf(groups.st);
      const lead = raw.slice(0, codeStart); // e.g. "returned a "
      if (lead) nodes.push(lead);
      nodes.push(
        <code key={`c${key++}`} className={statusClassFor(groups.st)}>
          {groups.st}
        </code>
      );
      lastIndex = start + raw.length;
      continue;
    }

    // Case 2: method+path with a trailing status ("GET /checkout → 500"). The
    // path pills neutral, the status pills coloured, separator stays plain.
    if (groups.mps) {
      const codeStart = raw.lastIndexOf(groups.mps);
      const head = raw.slice(0, codeStart); // "GET /checkout → "
      // Trim a trailing separator/space off the head so it renders as prose.
      const sepMatch = head.match(/(\s*(?:→|->|—|-|:)?\s*)$/);
      const sep = sepMatch ? sepMatch[0] : "";
      const path = sep ? head.slice(0, head.length - sep.length) : head;
      nodes.push(
        <code key={`c${key++}`} className="aitab-code">
          {path}
        </code>
      );
      if (sep) nodes.push(sep);
      nodes.push(
        <code key={`c${key++}`} className={statusClassFor(groups.mps)}>
          {groups.mps}
        </code>
      );
      lastIndex = start + raw.length;
      continue;
    }

    // Case 3: everything else — pill the whole token. Strip wrapping marks:
    // backticks/quotes around code, and a balanced "( … )" around a hex colour.
    const display =
      raw.length >= 2 &&
      (raw[0] === "`" || raw[0] === "'" || (raw[0] === "(" && raw.endsWith(")")))
        ? raw.slice(1, -1)
        : raw;
    // A standalone status code inside backticks still colour-codes.
    const asStatus = /^[1-5]\d\d$/.test(display) ? Number(display) : null;
    nodes.push(
      <code
        key={`c${key++}`}
        className={asStatus != null ? statusPillClass(asStatus) : "aitab-code"}
      >
        {display}
      </code>
    );
    lastIndex = start + raw.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length === 0 ? text : nodes;
}

/** Human label for the model's 0-1 confidence, or null to hide. */
function confidenceLabel(c: number | null | undefined): string | null {
  if (typeof c !== "number" || !Number.isFinite(c)) return null;
  if (c >= 0.75) return "High confidence";
  if (c >= 0.45) return "Moderate confidence";
  return "Low confidence";
}

export function AiTabContent({
  aiSummary,
  aiFixSuggestion,
  aiCause,
  aiFixSteps,
  aiSignalRelation,
  aiConfidence,
  aiAnalysisStatus,
  ticketId,
  clientError = false,
  onRetry,
  captureWindowStartAt,
}: AiTabContentProps) {
  // Treat absent status as "not analyzed yet" — the dashboard fires the analyze
  // request on open, which flips this to "pending" then a terminal state via the
  // realtime listener. Show the loading state for both absent and pending so the
  // panel never looks broken in the gap before the first write lands.
  const status: AiAnalysisStatus = aiAnalysisStatus ?? null;
  const docLoading = status == null || status === "pending";

  // Bounded-loading safety net. Start a timer whenever we're in a loading state;
  // if it elapses before a terminal status (or a client error) arrives, flip
  // `loadingTimedOut` so the panel offers a manual retry instead of spinning
  // forever. Reset on every change of ticket or status so genuine fresh loading
  // always gets the full window, and a state transition cancels a pending timeout.
  const [loadingTimedOut, setLoadingTimedOut] = React.useState(false);
  React.useEffect(() => {
    setLoadingTimedOut(false);
    if (!docLoading) return; // terminal status → no timer needed
    if (clientError) return; // already terminal on the client → no timer needed
    const handle = window.setTimeout(
      () => setLoadingTimedOut(true),
      LOADING_TIMEOUT_MS
    );
    return () => window.clearTimeout(handle);
  }, [ticketId, status, docLoading, clientError]);

  // Terminal-on-client states take precedence over the doc's null/pending so the
  // user is never stuck: an explicit request error, or a loading window that blew
  // past the bound, both surface a retry affordance.
  const showRequestError = docLoading && clientError;
  const showTimedOut = docLoading && !clientError && loadingTimedOut;
  // Genuine bounded loading: doc says null/pending, no client error, within window.
  const isLoading = docLoading && !clientError && !loadingTimedOut;

  return (
    <div className="relative">
      <style>{`
        .aitab-wrap { padding: 16px 16px 24px; }
        /* Row holding the AI-generated affordance + the relatedness verdict
           badge. A flex row with align-items:center keeps the two pills
           vertically centred on each other (they have slightly different
           heights), and the gap gives them clear horizontal separation
           instead of butting together. flex-wrap lets the verdict drop to a
           second line on narrow panels. */
        .aitab-badges {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }
        .aitab-affordance {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 24px;
          padding: 0 9px 0 7px;
          border-radius: 999px;
          background: var(--surface-subtle);
          border: 1px solid var(--border);
          color: var(--text-tertiary);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          user-select: none;
        }
        .aitab-relation {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 24px;
          padding: 0 10px 0 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.01em;
          border: 1px solid var(--border);
        }
        .aitab-relation-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          flex: 0 0 auto;
        }
        .aitab-relation-note {
          margin-top: 8px;
          font-size: 12px;
          line-height: 1.55;
          color: var(--text-secondary);
          overflow-wrap: anywhere;
        }
        .aitab-section { margin-top: 22px; }
        .aitab-section:first-of-type { margin-top: 18px; }
        /* Hairline divider between labeled blocks so SUMMARY / cause / steps
           read as distinct chunks rather than one continuous column — the
           marketing card's .dx-divider, scaled to the panel. */
        .aitab-section--divided {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .aitab-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 8px;
        }
        .aitab-body {
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--text-heading);
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        .aitab-cause {
          font-size: 14.5px;
          line-height: 1.55;
          color: var(--text-heading);
          padding: 12px 14px;
          border-radius: 10px;
          background: var(--surface-subtle);
          border: 1px solid var(--border);
          overflow-wrap: anywhere;
        }
        .aitab-steps {
          list-style: none;
          margin: 0;
          padding: 0;
          counter-reset: aitab-step;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .aitab-step {
          counter-increment: aitab-step;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14.5px;
          line-height: 1.55;
          color: var(--text-heading);
          overflow-wrap: anywhere;
        }
        .aitab-step::before {
          content: counter(aitab-step);
          flex: 0 0 auto;
          width: 20px;
          height: 20px;
          margin-top: 1px;
          border-radius: 999px;
          background: var(--brand-subtle);
          border: 1px solid var(--brand-muted);
          color: var(--brand-text);
          font-size: 11px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          line-height: 18px;
          text-align: center;
        }
        .aitab-confidence {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          font-size: 12.5px;
          color: var(--text-secondary);
        }
        .aitab-confidence-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
        }
        .aitab-skeleton {
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            var(--surface-subtle) 25%,
            var(--surface-hover) 37%,
            var(--surface-subtle) 63%
          );
          background-size: 400% 100%;
          animation: aitab-shimmer 1.4s ease infinite;
        }
        @keyframes aitab-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .aitab-analyzing {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .aitab-spin { animation: aitab-rotate 1.6s linear infinite; }
        @keyframes aitab-rotate { to { transform: rotate(360deg); } }
        .aitab-no-fault {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          background: var(--surface-subtle);
          border: 1px solid var(--border);
        }
        .aitab-no-fault-title {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-heading);
          margin-bottom: 4px;
        }
        /* Inline technical tokens render as pills matching the Network tab's
           status/method badges (e.g. the green "204" / "POST" chips):
           monospace, weight 700, 5px radius, a tinted background + hairline
           border. The DEFAULT pill uses the same GREEN tint as those Network
           badges so every code token reads with that look. HTTP status codes
           keep their semantic colour (4xx amber / 5xx red / 3xx violet) by
           layering the .dt-code--warn/err/info set on top. */
        .aitab-code {
          display: inline-flex;
          align-items: center;
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 0.82em;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          background: var(--dt-status-ok-bg);
          border: 1px solid var(--dt-status-ok-border);
          color: var(--dt-status-ok-text);
          padding: 1px 6px;
          border-radius: 5px;
          letter-spacing: 0.01em;
          white-space: nowrap;
          word-break: keep-all;
          vertical-align: baseline;
          line-height: 1.35;
        }
        /* Status-coded variants defined in THIS block (after .aitab-code) so
           their tint reliably wins regardless of stylesheet order — same
           palette as the Network status pills. */
        .aitab-code.dt-code--ok {
          background: var(--dt-status-ok-bg);
          border-color: var(--dt-status-ok-border);
          color: var(--dt-status-ok-text);
        }
        .aitab-code.dt-code--warn {
          background: var(--dt-status-warn-bg);
          border-color: var(--dt-status-warn-border);
          color: var(--dt-status-warn-text);
        }
        .aitab-code.dt-code--err {
          background: var(--dt-status-err-bg);
          border-color: var(--dt-status-err-border);
          color: var(--dt-status-err-text);
        }
        .aitab-code.dt-code--info {
          background: var(--dt-status-info-bg);
          border-color: var(--dt-status-info-border);
          color: var(--dt-status-info-text);
        }
        @media (prefers-reduced-motion: reduce) {
          .aitab-skeleton, .aitab-spin { animation: none !important; }
        }
      `}</style>

      <div className="aitab-wrap">
        {showRequestError ? (
          // The analyze request failed (auth/access/rate/quota/500) without a
          // terminal doc status — show unavailable + retry, never a spinner.
          <ErrorState onRetry={onRetry} />
        ) : showTimedOut ? (
          // Loading blew past the bound — final safety net with manual retry.
          <TimedOutState onRetry={onRetry} />
        ) : isLoading ? (
          <LoadingState />
        ) : status === "error" ? (
          <ErrorState onRetry={onRetry} />
        ) : status === "no_fault" ? (
          <NoFaultState
            aiSummary={aiSummary}
            aiFixSuggestion={aiFixSuggestion}
          />
        ) : status === "complete" ? (
          <CompleteState
            aiSummary={aiSummary}
            aiFixSuggestion={aiFixSuggestion}
            aiCause={aiCause}
            aiFixSteps={aiFixSteps}
            aiSignalRelation={aiSignalRelation}
            aiConfidence={aiConfidence}
            captureWindowStartAt={captureWindowStartAt}
          />
        ) : (
          // Defensive: unknown status → treat like not-yet-analyzed.
          <LoadingState />
        )}
      </div>
    </div>
  );
}

/** Small "this is an AI suggestion" affordance shown above real analysis. */
function AiAffordance() {
  return (
    <span className="aitab-affordance">
      <Sparkles size={11} strokeWidth={2} />
      AI-generated · review before acting
    </span>
  );
}

function LoadingState() {
  return (
    <div>
      <span
        className="aitab-analyzing"
        role="status"
        aria-live="polite"
      >
        <Sparkles size={14} strokeWidth={2} className="aitab-spin" />
        Analyzing…
      </span>
      <div className="aitab-section" aria-hidden="true">
        <div className="aitab-label">Summary</div>
        <div className="aitab-skeleton" style={{ width: "92%" }} />
        <div className="aitab-skeleton" style={{ width: "70%", marginTop: 8 }} />
      </div>
      <div className="aitab-section" aria-hidden="true">
        <div className="aitab-label">Likely cause &amp; fix</div>
        <div className="aitab-skeleton" style={{ width: "96%" }} />
        <div className="aitab-skeleton" style={{ width: "88%", marginTop: 8 }} />
        <div className="aitab-skeleton" style={{ width: "60%", marginTop: 8 }} />
      </div>
    </div>
  );
}

/** Subtle inline retry button reused by the error + timed-out states. */
function RetryButton({ onRetry }: { onRetry?: () => void }) {
  if (!onRetry) return null;
  return (
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium text-[var(--text-secondary)] bg-[var(--surface-subtle)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
    >
      <RotateCw size={12} strokeWidth={2} />
      Retry analysis
    </button>
  );
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="pt-2">
      <CanvasEmptyState
        illustration={<NoActivityIllu />}
        title="AI analysis unavailable"
        description="We couldn't generate an analysis for this ticket. The ticket and its captured data are unaffected — try again."
        density="compact"
        cta={<RetryButton onRetry={onRetry} />}
      />
    </div>
  );
}

function TimedOutState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="pt-2">
      <CanvasEmptyState
        illustration={<NoActivityIllu />}
        title="Analysis is taking longer than expected"
        description="This is taking unusually long. The ticket and its captured data are unaffected — retry to generate the analysis."
        density="compact"
        cta={<RetryButton onRetry={onRetry} />}
      />
    </div>
  );
}

/**
 * LEGACY layout for docs analyzed by the pre-overhaul templated no-fault path
 * (aiAnalysisStatus === "no_fault"). New analyses always run the model and land
 * in CompleteState with a verdict; this stays only so old tickets keep rendering
 * until a re-analysis upgrades them.
 */
function NoFaultState({
  aiSummary,
  aiFixSuggestion,
}: {
  aiSummary?: string | null;
  aiFixSuggestion?: string | null;
}) {
  return (
    <div>
      <AiAffordance />
      {aiSummary ? (
        <div className="aitab-section">
          <div className="aitab-label">Summary</div>
          <div className="aitab-body">{renderTechnical(aiSummary)}</div>
        </div>
      ) : null}
      <div className="aitab-no-fault">
        <div className="aitab-no-fault-title">
          No code fault detected
        </div>
        <div className="aitab-body" style={{ fontSize: 13 }}>
          {aiFixSuggestion
            ? renderTechnical(aiFixSuggestion)
            : "No console or network errors in the captured window — this appears to be a usability or design observation rather than a code defect."}
        </div>
      </div>
    </div>
  );
}

/** Confidence dot + label, or null when there's no usable confidence value. */
function ConfidenceIndicator({ aiConfidence }: { aiConfidence?: number | null }) {
  const conf = confidenceLabel(aiConfidence);
  if (!conf) return null;
  const confColor =
    typeof aiConfidence === "number"
      ? aiConfidence >= 0.75
        ? "var(--color-success)"
        : aiConfidence >= 0.45
          ? "var(--color-warning-text)"
          : "var(--text-tertiary)"
      : "var(--text-tertiary)";
  return (
    <div className="aitab-confidence">
      <span
        className="aitab-confidence-dot"
        style={{ background: confColor }}
        aria-hidden
      />
      {conf}
    </div>
  );
}

/**
 * Per-verdict presentation for the relatedness badge + the cause/fix labels.
 * "related" keeps the original "Likely cause" / "Suggested fix" wording; the
 * others reframe the section so the panel reads honestly: the AI did NOT pin the
 * captured errors as the bug ("unrelated"), it's a change request not a defect
 * ("design_request"), or the capture simply holds nothing that bears on the
 * report either way ("no_signal" — which must NOT read as "probably not a bug").
 */
const RELATION_PRESENTATION: Record<
  NonNullable<AiSignalRelation>,
  { badge: string; color: string; causeLabel: string; fixLabel: string }
> = {
  related: {
    badge: "Captured signals relate to this report",
    color: "var(--color-success)",
    causeLabel: "Likely cause",
    fixLabel: "Suggested fix",
  },
  unrelated: {
    badge: "Captured errors appear unrelated",
    color: "var(--color-warning-text)",
    causeLabel: "Relatedness assessment",
    fixLabel: "Suggested next steps",
  },
  design_request: {
    badge: "Design / UX request — no code fault",
    color: "var(--text-tertiary)",
    causeLabel: "Assessment",
    fixLabel: "Suggested next steps",
  },
  no_signal: {
    badge: "No related capture — defect not ruled out",
    color: "var(--color-accent)",
    causeLabel: "Assessment",
    fixLabel: "How to confirm",
  },
};

/** Relatedness verdict pill. Null for legacy tickets that have no verdict. */
function RelationBadge({ relation }: { relation?: AiSignalRelation }) {
  if (relation == null) return null;
  const p = RELATION_PRESENTATION[relation];
  if (!p) return null;
  return (
    <div
      className="aitab-relation"
      style={{ color: p.color }}
    >
      <span
        className="aitab-relation-dot"
        style={{ background: p.color }}
        aria-hidden
      />
      {p.badge}
    </div>
  );
}

function CompleteState({
  aiSummary,
  aiFixSuggestion,
  aiCause,
  aiFixSteps,
  aiSignalRelation,
  aiConfidence,
  captureWindowStartAt,
}: {
  aiSummary?: string | null;
  aiFixSuggestion?: string | null;
  aiCause?: string | null;
  aiFixSteps?: string[] | null;
  aiSignalRelation?: AiSignalRelation;
  aiConfidence?: number | null;
  captureWindowStartAt?: number | null;
}) {
  // Prefer the structured shape (new tickets): a labeled one-line cause + a list of
  // discrete steps. Fall back to the legacy run-on `aiFixSuggestion` for old tickets
  // analyzed before the structured fields existed — they still render, just as prose.
  const steps = Array.isArray(aiFixSteps)
    ? aiFixSteps.filter((s) => typeof s === "string" && s.trim() !== "")
    : [];
  const hasStructured =
    typeof aiCause === "string" && aiCause.trim() !== "" && steps.length > 0;

  // Reframe the cause/fix labels by verdict (related → original wording). Legacy
  // tickets with no verdict fall back to "related" so their rendering is unchanged.
  const relation = aiSignalRelation ?? "related";
  const presentation =
    RELATION_PRESENTATION[relation] ?? RELATION_PRESENTATION.related;

  // Window-start framing: when this ticket's USER ACTIONS were cut at a prior
  // ticket's watermark, absence-of-evidence verdicts need the context to read
  // honestly. Scoped to actions — console/network are full live snapshots.
  // Most load-bearing for no_signal/unrelated, harmless elsewhere.
  const showWindowNote = typeof captureWindowStartAt === "number";

  return (
    <div>
      <div className="aitab-badges">
        <AiAffordance />
        <RelationBadge relation={aiSignalRelation} />
      </div>
      {showWindowNote ? (
        <div className="aitab-relation-note">
          User actions begin after an earlier ticket from this session — older
          actions were filed with that ticket. Console and network show the live
          buffer at capture time.
        </div>
      ) : null}
      <div className="aitab-section">
        <div className="aitab-label">Summary</div>
        <div className="aitab-body">
          {aiSummary ? renderTechnical(aiSummary) : "No summary available."}
        </div>
      </div>

      {hasStructured ? (
        <>
          <div className="aitab-section aitab-section--divided">
            <div className="aitab-label">{presentation.causeLabel}</div>
            <div className="aitab-cause">{renderTechnical(aiCause ?? "")}</div>
          </div>
          <div className="aitab-section">
            <div className="aitab-label">{presentation.fixLabel}</div>
            <ol className="aitab-steps">
              {steps.map((step, i) => (
                <li key={i} className="aitab-step">
                  <span>{renderTechnical(step)}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        // Legacy shape — single prose block, unchanged structure.
        <div className="aitab-section aitab-section--divided">
          <div className="aitab-label">Likely cause &amp; fix</div>
          <div className="aitab-body">
            {aiFixSuggestion
              ? renderTechnical(aiFixSuggestion)
              : "No suggestion available."}
          </div>
        </div>
      )}

      {/* Confidence is the model's confidence in its VERDICT (not in a technical
          cause), so it renders for every verdict — a certain design-request call
          shows as high confidence rather than being suppressed. */}
      <ConfidenceIndicator aiConfidence={aiConfidence} />
    </div>
  );
}

export default AiTabContent;
