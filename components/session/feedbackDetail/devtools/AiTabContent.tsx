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
 * The model's judgment of how the captured signals relate to the report. Rendered
 * as a verdict badge above the cause so the developer sees WHY the AI did or did not
 * connect the errors to what the user described:
 *   "related"        — a captured error plausibly explains the report;
 *   "unrelated"      — errors were captured but look disconnected from the report;
 *   "design_request" — the report is a design/UX/content change, not a defect.
 */
export type AiSignalRelation =
  | "related"
  | "unrelated"
  | "design_request"
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
  aiConfidence?: number | null;
  aiAnalysisStatus?: AiAnalysisStatus;
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
        .aitab-affordance {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 22px;
          padding: 0 8px 0 6px;
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
          margin-top: 14px;
          padding: 4px 10px 4px 8px;
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
        .aitab-section { margin-top: 18px; }
        .aitab-section:first-of-type { margin-top: 16px; }
        .aitab-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 6px;
        }
        .aitab-body {
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-heading);
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        .aitab-cause {
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-heading);
          padding: 10px 12px;
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
          gap: 8px;
        }
        .aitab-step {
          counter-increment: aitab-step;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-heading);
          overflow-wrap: anywhere;
        }
        .aitab-step::before {
          content: counter(aitab-step);
          flex: 0 0 auto;
          width: 18px;
          height: 18px;
          margin-top: 1px;
          border-radius: 999px;
          background: var(--surface-subtle);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 10.5px;
          font-weight: 600;
          line-height: 16px;
          text-align: center;
        }
        .aitab-confidence {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          font-size: 11.5px;
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
          <div className="aitab-body">{aiSummary}</div>
        </div>
      ) : null}
      <div className="aitab-no-fault">
        <div className="aitab-no-fault-title">
          No code fault detected
        </div>
        <div className="aitab-body" style={{ fontSize: 12.5 }}>
          {aiFixSuggestion ||
            "No console or network errors in the captured window — this appears to be a usability or design observation rather than a code defect."}
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
 * "related" keeps the original "Likely cause" / "Suggested fix" wording; the other
 * two reframe the section so the panel reads honestly (the AI did NOT pin the
 * captured errors as the bug, or it's a design request, not a defect).
 */
const RELATION_PRESENTATION: Record<
  NonNullable<AiSignalRelation>,
  { badge: string; color: string; causeLabel: string; fixLabel: string }
> = {
  related: {
    badge: "Captured errors relate to this report",
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
    badge: "Design / UX observation — no code fault",
    color: "var(--text-tertiary)",
    causeLabel: "Assessment",
    fixLabel: "Suggested next steps",
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
}: {
  aiSummary?: string | null;
  aiFixSuggestion?: string | null;
  aiCause?: string | null;
  aiFixSteps?: string[] | null;
  aiSignalRelation?: AiSignalRelation;
  aiConfidence?: number | null;
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
  // Confidence reads as confidence in a TECHNICAL cause — only meaningful when the
  // signals are related. For unrelated/design verdicts the badge carries the signal
  // and a low confidence number would just be noise, so suppress it there.
  const showConfidence = aiSignalRelation == null || aiSignalRelation === "related";

  return (
    <div>
      <AiAffordance />
      <RelationBadge relation={aiSignalRelation} />
      <div className="aitab-section">
        <div className="aitab-label">Summary</div>
        <div className="aitab-body">{aiSummary || "No summary available."}</div>
      </div>

      {hasStructured ? (
        <>
          <div className="aitab-section">
            <div className="aitab-label">{presentation.causeLabel}</div>
            <div className="aitab-cause">{aiCause}</div>
          </div>
          <div className="aitab-section">
            <div className="aitab-label">{presentation.fixLabel}</div>
            <ol className="aitab-steps">
              {steps.map((step, i) => (
                <li key={i} className="aitab-step">
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        // Legacy shape — single prose block, unchanged from before.
        <div className="aitab-section">
          <div className="aitab-label">Likely cause &amp; fix</div>
          <div className="aitab-body">
            {aiFixSuggestion || "No suggestion available."}
          </div>
        </div>
      )}

      {showConfidence ? <ConfidenceIndicator aiConfidence={aiConfidence} /> : null}
    </div>
  );
}

export default AiTabContent;
