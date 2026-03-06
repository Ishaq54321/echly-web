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
 *   → Optional review pass if confidence < 0.85
 *   → Return to UI
 *
 * No instruction graph, no refinement, no clause splitting, no verification layer.
 */

import type OpenAI from "openai";
import { runVoiceToTicket } from "@/lib/ai/voiceToTicketPipeline";

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
  ticket?: { title: string; actionSteps: string[]; confidence: number };
  error?: string;
  clarityScore?: number;
  clarityIssues?: string[];
  suggestedRewrite?: string | null;
  confidence?: number;
  needsClarification?: boolean;
  verificationIssues?: string[];
  verificationWarnings?: string[];
  instructionLimitWarning?: string | null;
  extractedInstructions?: unknown[];
}

export interface RunPipelineOptions {
  /** Use AI transcript normalization. Unused in minimal pipeline (no extra LLM). */
  useTranscriptNormalization?: boolean;
  /** Run optional review pass when confidence < this. Default 0.85. */
  useVerification?: boolean;
}

/**
 * Run the minimal feedback pipeline: one transcript → one ticket.
 * Called from POST /api/structure-feedback.
 */
export async function runFeedbackPipeline(
  client: OpenAI,
  input: PipelineCaptureInput,
  options: RunPipelineOptions = {}
): Promise<PipelineOutput> {
  const { transcript, context } = normalizeInput(input);

  let result;
  try {
    result = await runVoiceToTicket(client, transcript, context, {
      runReviewBelowConfidence: options.useVerification !== false ? 0.85 : 1,
    });
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
    description: result.ticket.notes || result.ticket.title || "",
    actionSteps: result.ticket.actionSteps,
    suggestedTags: ["Feedback"],
    confidenceScore: result.ticket.confidence,
  };

  return {
    success: result.success,
    tickets: [ticketPayload],
    ticket: {
      title: result.ticket.title,
      actionSteps: result.ticket.actionSteps,
      confidence: result.ticket.confidence,
    },
    clarityScore: result.clarityScore,
    clarityIssues: result.clarityIssues,
    suggestedRewrite: result.suggestedRewrite,
    confidence: result.ticket.confidence,
    needsClarification: result.needsClarification,
    verificationIssues: result.needsClarification ? result.clarityIssues : undefined,
  };
}
