import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireAuth } from "@/lib/server/auth";
import { echlyDebug } from "@/lib/utils/logger";
import { segmentInstructions } from "@/lib/server/instructionSegmentation";
import { refineInstructions } from "@/lib/server/instructionRefinement";
import { buildInstructionGraph, ticketsFromGraph } from "@/lib/server/instructionGraph";
import { mapInstructionsToOntology } from "@/lib/server/instructionOntology";
import { batchIntentAndTicketsFromOntology } from "@/lib/server/pipelineStages";
import { anchorProperNouns } from "@/lib/server/properNounAnchoring";
import { normalizeUiVocabulary } from "@/lib/server/uiVocabularyNormalization";
import { normalizeTranscript } from "@/lib/server/transcriptNormalization";
import { verifyTicketsBatch, applyVerifierFinalDecision } from "@/lib/server/ticketVerification";
import type { PipelineContext } from "@/lib/server/pipelineContext";

/** Action verbs in transcript: only trigger clarification when instructionCount=0 AND no these. */
const TRANSCRIPT_ACTION_VERBS = /\b(reduce|increase|move|change|rename|hide|show|add|remove)\b/i;

function transcriptWordCount(transcript: string): number {
  return transcript.trim().split(/\s+/).filter(Boolean).length;
}

function transcriptHasActionVerbs(transcript: string): boolean {
  return TRANSCRIPT_ACTION_VERBS.test(transcript);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_INSTRUCTIONS = 12;
/** Only trigger clarification when confidence is extremely low (after extraction). */
const CLARITY_EXTREME_LOW_CONFIDENCE = 0.45;
/** Clarity score above this → skip clarification. Formula: instructionCountNorm * 0.6 + avgConfidence * 0.4 */
const CLARITY_SCORE_SKIP_THRESHOLD = 0.5;

const rateLimitMap = new Map<
  string,
  { count: number; windowStart: number }
>();

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(uid);
  if (!entry) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  return true;
}

/** Normalize request context to PipelineContext (elements from various shapes). */
function normalizeContext(raw: unknown): PipelineContext | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const elements: Array<{ type: string; label?: string | null; text?: string | null; role?: string | null }> = [];
  const push = (arr: unknown) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (item && typeof item === "object" && "type" in item) {
        const t = item as Record<string, unknown>;
        elements.push({
          type: String(t.type ?? ""),
          label: t.label != null ? String(t.label) : null,
          text: t.text != null ? String(t.text) : null,
          role: t.role != null ? String(t.role) : null,
        });
      }
    }
  };
  push(o.elements);
  push(o.visibleElements);
  push(o.interactiveElements);
  push(o.formFields);
  push(o.buttons);
  push(o.headings);

  return {
    url: typeof o.url === "string" ? o.url : undefined,
    viewportWidth: typeof o.viewportWidth === "number" ? o.viewportWidth : undefined,
    viewportHeight: typeof o.viewportHeight === "number" ? o.viewportHeight : undefined,
    domPath: o.domPath != null && typeof o.domPath === "string" ? o.domPath : null,
    nearbyText: o.nearbyText != null && typeof o.nearbyText === "string" ? o.nearbyText : null,
    visibleText: o.visibleText != null && typeof o.visibleText === "string" ? o.visibleText : null,
    elements: elements.length > 0 ? elements : undefined,
    visibleElements: elements.length > 0 ? elements : undefined,
  };
}

/** Stable response shape. Never return {} or raw AI output. */
type StructureResponse = {
  success: boolean;
  tickets: Array<Record<string, unknown>>;
  error?: string;
  clarityScore?: number;
  clarityIssues?: string[];
  suggestedRewrite?: string | null;
  confidence?: number;
  needsClarification?: boolean;
  verificationIssues?: string[];
  /** Warnings for tickets that failed verification (partial verification). */
  verificationWarnings?: string[];
  /** When instructions were truncated to max. */
  instructionLimitWarning?: string | null;
  intent?: {
    intentType: string;
    targetElement: string | null;
    changeCategory: string;
    problemSummary: string;
    confidence: number;
  };
};

export async function POST(req: Request): Promise<Response> {
  const stableFailure = (error: string): NextResponse<StructureResponse> =>
    NextResponse.json({ success: false, tickets: [], error }, { status: 200 });

  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  if (!checkRateLimit(user.uid)) {
    return NextResponse.json(
      { success: false, tickets: [], error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { success: false, tickets: [], error: "Missing OpenAI API key" },
      { status: 200 }
    );
  }

  let body: { transcript?: unknown; context?: unknown };
  try {
    body = await req.json();
    if (process.env.NODE_ENV !== "production") {
      console.log("[STRUCTURE] transcript present:", !!body?.transcript);
      console.log("[STRUCTURE] context keys:", body?.context && typeof body.context === "object" ? Object.keys(body.context as object) : []);
    }
  } catch {
    return stableFailure("Invalid request body");
  }
  const transcript = body?.transcript;
  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json(
      { success: false, tickets: [], error: "No valid transcript provided" },
      { status: 200 }
    );
  }

  echlyDebug("RAW TRANSCRIPT", transcript);

  const ctx = normalizeContext(body?.context);
  const originalTranscript = transcript;
  const correctedTranscript = anchorProperNouns(
    originalTranscript,
    ctx?.visibleText ?? null
  );

  echlyDebug("CORRECTED TRANSCRIPT", correctedTranscript);

  // ——— UI vocabulary normalization: summit→submit, model→modal, etc. (Rule 5) ———
  const transcriptAfterUiNorm = normalizeUiVocabulary(correctedTranscript);

  // ——— Transcript cleanup: fix STT/grammar before segmentation ———
  const normalizedTranscript = await normalizeTranscript(client, transcriptAfterUiNorm, { retryOnce: true });

  try {
    // ——— Stage 1: Instruction segmentation (with context, gpt-4o, retry) ———
    const {
      instructions: segmentedInstructions,
      needsClarification: segmentNeedsClarification,
      confidence: segmentConfidence,
      intentConfidenceScore: segmentIntentScore,
    } = await segmentInstructions(client, normalizedTranscript, ctx, { retryOnce: true });

    echlyDebug("SEGMENTATION RESULT", segmentedInstructions);

    // Only trigger clarification when ALL are true: instructionCount === 0, transcript < 12 words, no action verbs.
    if (segmentedInstructions.length === 0) {
      const wordCount = transcriptWordCount(normalizedTranscript);
      const hasActionVerbs = transcriptHasActionVerbs(normalizedTranscript);
      const shouldTriggerClarification = wordCount < 12 && !hasActionVerbs;
      const intentScore = segmentIntentScore ?? 0;
      const clarityLayerInput = {
        instructionCount: 0,
        averageConfidence: intentScore / 100,
        transcript: normalizedTranscript,
        wordCount,
        hasActionVerbs,
        shouldTriggerClarification,
      };
      echlyDebug("CLARITY LAYER INPUT", clarityLayerInput);
      echlyDebug("CLARITY DECISION", shouldTriggerClarification);
      return NextResponse.json({
        success: true,
        tickets: [],
        needsClarification: shouldTriggerClarification,
        verificationIssues: shouldTriggerClarification
          ? ["Vague or unclear feedback. Please specify what to change (e.g. which element and what to change)."]
          : undefined,
        clarityScore: intentScore,
        clarityIssues: shouldTriggerClarification ? ["Feedback too vague to create a ticket"] : [],
        suggestedRewrite: shouldTriggerClarification
          ? "Please specify what you'd like to change (e.g. which element and what to change)."
          : null,
        confidence: 0,
      });
    }

    // ——— Stage 2: Instruction refinement (splits compound; do not merge alternatives — see Instruction Graph) ———
    const { instructions: refinedInstructions } = await refineInstructions(client, segmentedInstructions);
    let instructions = refinedInstructions;

    // ——— Instruction limit: max 12 ———
    let instructionLimitWarning: string | null = null;
    if (instructions.length > MAX_INSTRUCTIONS) {
      instructionLimitWarning = `Only the first ${MAX_INSTRUCTIONS} instructions were processed. ${instructions.length - MAX_INSTRUCTIONS} were skipped.`;
      instructions = instructions.slice(0, MAX_INSTRUCTIONS);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[STRUCTURE] Refined instructions:", instructions.length, instructionLimitWarning ?? "");
    }

    // ——— Stage 3: Instruction Graph Builder (deterministic; groups by UI target, preserves alternatives) ———
    // Use segmented instructions for graph so we preserve multiple actions per element (refinement may merge alternatives).
    const instructionsForGraph = segmentedInstructions.length > 0 ? segmentedInstructions.slice(0, MAX_INSTRUCTIONS) : instructions;
    const { graph, needsClarification: graphNeedsClarification } = buildInstructionGraph({
      instructions: instructionsForGraph,
      context: ctx,
      transcript: normalizedTranscript,
    });

    // Structured instructions for debug: flatten graph to { action_type, target_element, confidence }[]
    let structuredInstructionsForDebug: Array<{ action_type: string; target_element: string | null; confidence: number }> = graph.targets.flatMap((t) =>
      t.actions.map((a) => ({ action_type: a.action_type, target_element: t.element, confidence: a.confidence }))
    );

    // ——— Stage 4: Ticket generation from graph (one ticket per TargetNode) ———
    let pipelineTickets = ticketsFromGraph(graph);

    // Fallback: if graph produced no tickets (e.g. target heuristics missed), use ontology path once
    if (pipelineTickets.length === 0 && instructions.length > 0) {
      const ontologyResult = await mapInstructionsToOntology(client, instructions, ctx, { retryOnce: true });
      structuredInstructionsForDebug = ontologyResult.actions.map((a) => ({
        action_type: a.action_type,
        target_element: a.target_element,
        confidence: a.confidence,
      }));
      const { tickets: ontologyTickets } = await batchIntentAndTicketsFromOntology(
        client,
        ontologyResult.actions,
        ctx,
        { instructions, retryOnce: true }
      );
      pipelineTickets = ontologyTickets;
    }

    echlyDebug("STRUCTURED INSTRUCTIONS", structuredInstructionsForDebug);
    echlyDebug("INSTRUCTION CONFIDENCE SCORES", structuredInstructionsForDebug.map((s) => s.confidence));
    echlyDebug("INSTRUCTION COUNT", instructions.length);

    if (pipelineTickets.length === 0) {
      const avgConf = structuredInstructionsForDebug.length > 0
        ? structuredInstructionsForDebug.reduce((s, a) => s + a.confidence, 0) / structuredInstructionsForDebug.length
        : 0;
      const clarityLayerInput = { instructionCount: instructions.length, averageConfidence: avgConf, transcript: normalizedTranscript };
      echlyDebug("CLARITY LAYER INPUT", clarityLayerInput);
      echlyDebug("CLARITY DECISION", true);
      return NextResponse.json({
        success: true,
        tickets: [],
        needsClarification: true,
        verificationIssues: graphNeedsClarification
          ? ["No UI target could be inferred or no actionable change. Please specify what to change (e.g. which element and what to change)."]
          : ["Could not generate tickets from instructions."],
        clarityScore: 0,
        clarityIssues: [],
        suggestedRewrite: graphNeedsClarification
          ? "Please specify what you'd like to change (e.g. which element and what to change)."
          : null,
        confidence: 0.5,
      });
    }

    // ——— Stage 5: Verification (retry once) ———
    const rawVerifications = await verifyTicketsBatch(
      client,
      normalizedTranscript,
      instructions,
      pipelineTickets,
      { retryOnce: true }
    );

    // ——— Apply verifier final decision: do not override segmentation when segmentationNeedsClarification === false ———
    const verifications = applyVerifierFinalDecision(rawVerifications, {
      instructionCount: instructions.length,
      instructions,
      transcript: normalizedTranscript,
      segmentationNeedsClarification: segmentNeedsClarification,
    });

    // ——— Partial verification: keep only tickets that pass ———
    const validIndices: number[] = [];
    const verificationWarnings: string[] = [];
    verifications.forEach((v, i) => {
      const pass = v.isAccurate && v.isActionable && !v.needsClarification;
      if (pass) validIndices.push(i);
      else verificationWarnings.push(`Ticket ${i + 1} (${pipelineTickets[i]?.title ?? "?"}): did not pass verification`);
    });

    const validTickets = validIndices.map((i) => pipelineTickets[i]);
    const validVerifications = validIndices.map((i) => verifications[i]);

    // ——— All tickets failed verification → needsClarification ———
    if (validTickets.length === 0 && pipelineTickets.length > 0) {
      const avgConfVerification =
        verifications.length > 0 ? verifications.reduce((s, v) => s + v.confidence, 0) / verifications.length : 0;
      const clarityLayerInput = {
        instructionCount: instructions.length,
        averageConfidence: avgConfVerification,
        transcript: normalizedTranscript,
      };
      echlyDebug("CLARITY LAYER INPUT", clarityLayerInput);
      echlyDebug("CLARITY DECISION", true);
      return NextResponse.json({
        success: true,
        tickets: [],
        needsClarification: true,
        verificationIssues: ["No tickets passed verification."],
        verificationWarnings: verificationWarnings.length > 0 ? verificationWarnings : undefined,
        clarityScore: 0,
        clarityIssues: verificationWarnings,
        suggestedRewrite: "Please rephrase your feedback so we can create an actionable ticket.",
        confidence: Math.min(...verifications.map((v) => v.confidence)),
      });
    }

    // ——— Clarity decision AFTER extraction: only trigger when no actionable instructions OR confidence extremely low ———
    const minTicketConfidence = validTickets.length > 0
      ? Math.min(...validTickets.map((t) => t.confidenceScore))
      : 1;
    const minVerificationConfidence = validVerifications.length > 0
      ? Math.min(...validVerifications.map((v) => v.confidence))
      : 1;
    const overallConfidence = Math.min(
      segmentConfidence,
      minTicketConfidence,
      minVerificationConfidence
    );
    const averageConfidence =
      validVerifications.length > 0
        ? validVerifications.reduce((s, v) => s + v.confidence, 0) / validVerifications.length
        : overallConfidence;

    // If instructions exist, allow tickets to proceed even when confidence < 0.5 (do not trigger clarification for low confidence).
    if (validTickets.length > 0 && averageConfidence < CLARITY_EXTREME_LOW_CONFIDENCE) {
      // Instructions exist: proceed anyway per spec; do not return needsClarification for low confidence.
    }

    // Return only valid tickets; include warnings for any that failed
    const valid = validTickets.map((t) => ({
      title: t.title,
      description: t.description,
      actionSteps: t.actionSteps,
      suggestedTags: t.tags,
      confidenceScore: t.confidenceScore,
    }));

    const minConfidence =
      validVerifications.length > 0
        ? Math.min(...validVerifications.map((v) => v.confidence))
        : overallConfidence;
    const avgConfidenceForClarity =
      validVerifications.length > 0
        ? validVerifications.reduce((s, v) => s + v.confidence, 0) / validVerifications.length
        : minConfidence;

    // Clarity score: instructionCount * 0.6 + averageConfidence * 0.4 (normalized 0–1). If > 0.5 → skip clarification.
    const instructionCountNorm = Math.min(1, valid.length);
    const clarityScoreValue = instructionCountNorm * 0.6 + avgConfidenceForClarity * 0.4;
    const clarityScore100 = Math.round(clarityScoreValue * 100);

    // Failsafe: at least one valid instruction → never trigger clarification.
    const clarityLayerInput = {
      instructionCount: valid.length,
      averageConfidence: avgConfidenceForClarity,
      transcript: normalizedTranscript,
    };
    echlyDebug("CLARITY LAYER INPUT", clarityLayerInput);
    echlyDebug("CLARITY DECISION", false);
    echlyDebug("FINAL TICKETS", valid);

    return NextResponse.json({
      success: true,
      tickets: valid,
      clarityScore: clarityScore100,
      clarityIssues: valid.length > 0 ? [] : (graphNeedsClarification ? ["Some instructions had low confidence"] : []),
      suggestedRewrite: null,
      confidence: valid.length > 0 ? minConfidence : overallConfidence,
      needsClarification: false,
      verificationWarnings: verificationWarnings.length > 0 ? verificationWarnings : undefined,
      instructionLimitWarning: instructionLimitWarning ?? undefined,
    });
  } catch (err) {
    console.error("STRUCTURING ERROR:", err);
    return NextResponse.json(
      { success: false, tickets: [], error: "Structuring failed" },
      { status: 200 }
    );
  }
}
