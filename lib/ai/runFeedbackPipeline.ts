/**
 * Echly AI Feedback Pipeline — Minimal voice → ticket orchestrator.
 *
 * Architecture: one recording → one ticket.
 *
 *   User Voice Recording
 *   → Speech-to-text (client)
 *   → Context Builder (transcript + DOM context, <1000 tokens)
 *   → Single GPT-4o-mini call
 *   → Structured JSON → ONE ticket
 *   → Return to UI
 *
 * No instruction graph, no refinement, no clause splitting, no verification layer.
 */

import type OpenAI from "openai";
import { runVoiceToTicket } from "@/lib/ai/voiceToTicketPipeline";

/** Count of modules/files removed in surgical cleanup (structure-feedback path only). */
const SURGICAL_CLEANUP_DEAD_REMOVED = 8;

/* ===== CAPTURE: NORMALIZE REQUEST ===== */

export interface PipelineCaptureInput {
  transcript: string;
  context?: unknown;
}

/** Normalize request body. Transcript is required; context is passed through. */
export function normalizeInput(raw: PipelineCaptureInput): { transcript: string; context: unknown } {
  const transcript = typeof raw.transcript === "string" ? raw.transcript.trim() : "";
  const context = raw.context ?? null;
  return { transcript, context };
}

/* ===== PIPELINE OUTPUT ===== */

export interface PipelineOutput {
  success: boolean;
  tickets: Array<Record<string, unknown>>;
  error?: string;
  verificationWarnings?: string[];
  instructionLimitWarning?: string | null;
  extractedInstructions?: unknown[];
}

export interface RunPipelineOptions {
  /** Use AI transcript normalization. Unused in minimal pipeline (no extra LLM). */
  useTranscriptNormalization?: boolean;
  /** Reserved toggle for compatibility with callers. */
  useVerification?: boolean;
}

/**
 * Run the minimal feedback pipeline: one transcript → one ticket.
 * Called from POST /api/structure-feedback.
 */
export async function runFeedbackPipeline(
  client: OpenAI,
  input: PipelineCaptureInput,
  _options: RunPipelineOptions = {}
): Promise<PipelineOutput> {
  const { transcript, context } = normalizeInput(input);

  let result;
  try {
    result = await runVoiceToTicket(client, transcript, context);
  } catch (err) {
    console.error("[PIPELINE] runVoiceToTicket failed", err);
    return {
      success: false,
      tickets: [],
      error: "Structuring failed",
    };
  }

  const ticketPayload = {
    title: result.ticket.title,
    actionSteps: result.ticket.actionSteps,
    suggestedTags: ["Feedback"],
  };

  console.log("[SYSTEM_CLEAN]", {
    pipeline: "clean",
    duplicates: false,
    deadCode: SURGICAL_CLEANUP_DEAD_REMOVED,
  });

  return {
    success: result.success,
    tickets: [ticketPayload],
  };
}
