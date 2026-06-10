/**
 * Shared AI-Analysis constants — client- AND server-safe (no firebase-admin /
 * openai imports, so this is importable from both the analyze route and the
 * dashboard client).
 *
 * PENDING_STALE_MS is the contract that makes the stuck-state recovery work: the
 * server treats a "pending" lock older than this as reclaimable
 * (claimAnalysisLock), and the client re-fires the analysis when it sees a
 * "pending" doc older than this. Both halves MUST use the same value or they
 * deadlock — a fresh pending the client won't re-fire vs. a stale pending the
 * server won't reclaim. Keep them reading from here.
 */

import { SIGNAL_RELATIONS } from "@/lib/ai/analysisSanitize";

/** A "pending" lock older than this is treated as stale (a crashed prior run). */
export const PENDING_STALE_MS = 2 * 60 * 1000; // 2m

/**
 * Model for AI Analysis. Vision-capable (the analyze route attaches the ticket
 * screenshot as a low-detail image on gated paths). Named constant so it's
 * bumpable in one place — shared by the route and the live verification
 * harness (scripts/verifyAiAnalysis.ts) so they can never drift.
 */
export const AI_ANALYSIS_MODEL = "gpt-5.4-nano";

/**
 * Strict JSON schema for the model's output (voiceToTicketPipeline pattern).
 * Structured shape: a tight summary, a verdict (the four SIGNAL_RELATIONS), a
 * one-line cause/assessment, and an ARRAY of discrete steps (so they render as
 * a list, not "(1)…(2)…" inside a paragraph).
 */
export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    aiSummary: { type: "string" },
    // The verdict (constrained to the four values the prompt defines) so the
    // model commits to a judgment the panel can render, not just prose.
    aiSignalRelation: {
      type: "string",
      enum: SIGNAL_RELATIONS as unknown as string[],
    },
    aiCause: { type: "string" },
    aiFixSteps: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 5,
    },
    aiConfidence: { type: "number" },
  },
  required: [
    "aiSummary",
    "aiSignalRelation",
    "aiCause",
    "aiFixSteps",
    "aiConfidence",
  ],
} as const;
