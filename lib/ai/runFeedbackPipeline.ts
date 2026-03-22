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
}

function generateSmartTags(transcript: string, elementType: string | null) {
  const text = transcript.toLowerCase();

  const tags = [];

  // ELEMENT FIRST
  if (elementType === "button") tags.push("Button");
  if (elementType === "image") tags.push("Image");
  if (elementType === "heading") tags.push("Heading");
  if (elementType === "link") tags.push("Link");
  if (elementType === "icon") tags.push("Icon");

  // CONTENT SECOND
  if (text.includes("text") || text.includes("word")) {
    tags.push("Text");
  }

  if (text.includes("image")) {
    tags.push("Image");
  }

  // ACTION THIRD
  if (
    text.includes("size") ||
    text.includes("increase") ||
    text.includes("decrease")
  ) {
    tags.push("Size");
  }

  if (text.includes("color") || text.includes("colour")) {
    tags.push("Color");
  }

  // Replace section-based intent with Layout
  if (
    text.includes("section") ||
    text.includes("layout") ||
    text.includes("block")
  ) {
    tags.push("Layout");
  }

  // SECONDARY CONTEXT
  if (text.includes("button")) {
    tags.push("Button");
  }

  if (text.includes("icon")) {
    tags.push("Icon");
  }

  if (text.includes("link")) {
    tags.push("Link");
  }

  if (text.includes("heading")) {
    tags.push("Heading");
  }

  // REMOVE DUPLICATES
  const unique = [...new Set(tags)];

  // LIMIT TO 5
  return unique.slice(0, 5);
}

/**
 * Run the minimal feedback pipeline: one transcript → one ticket.
 * Called from POST /api/structure-feedback.
 */
export async function runFeedbackPipeline(
  client: OpenAI,
  input: PipelineCaptureInput
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
    suggestedTags: generateSmartTags(
      transcript,
      (context as { elementType?: string } | null)?.elementType || null
    ),
  };

  console.log("[SMART_TAGS]", {
    transcriptPreview: transcript.slice(0, 80),
    elementType: (context as { elementType?: string } | null)?.elementType || null,
    tagCount: ticketPayload.suggestedTags.length,
    tags: ticketPayload.suggestedTags,
  });

  return {
    success: result.success,
    tickets: [ticketPayload],
  };
}
