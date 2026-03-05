/**
 * Echly AI Feedback Pipeline — Central orchestrator.
 *
 * Architecture (5 layers, single responsibility each):
 *
 *   Capture      → Collect signals (transcript, screenshot, DOM, viewport). No AI.
 *   Perception   → Clean and prepare signals (speech/UI norm, grounding). Deterministic; optional AI for transcript norm.
 *   Understanding→ Primary AI: instruction extraction. Optional refinement when compound. Copy correction + entity resolution (deterministic).
 *   Structuring  → Build instruction graph, one ticket per entity; AI-assisted title per ticket (gpt-4o-mini).
 *   Output       → Optional verification per ticket, clarity scoring, response formatting.
 *
 * Allowed AI calls (see lib/ai/aiCalls.ts): instruction extraction (gpt-4o), instruction refinement (gpt-4o-mini),
 * ticket title (gpt-4o-mini), ticket verification (gpt-4o-mini), session insight (gpt-4o-mini).
 */

import type OpenAI from "openai";
import type { PipelineContext } from "@/lib/server/pipelineContext";
import type { ExtractedInstruction } from "@/lib/server/instructionExtraction";
import type { PipelineTicket } from "@/lib/server/pipelineStages";
import type { InstructionGraph } from "@/lib/server/instructionGraph";
import type { VerificationResult } from "@/lib/server/ticketVerification";
import { buildSpatialContext, buildMinimalSpatialContext, type SpatialContext } from "@/lib/ai/spatial-context-builder";
import { truncateSpatialContext } from "@/lib/ai/pipelineTokenBudget";
import { filterRelevantContext } from "@/lib/ai/contextFilter";
import {
  createPipelineMetrics,
  logPipelineMetrics,
  type PipelineMetrics,
} from "@/lib/ai/pipelineMetrics";
import { anchorProperNouns } from "@/lib/server/properNounAnchoring";
import { normalizeUiVocabulary } from "@/lib/server/uiVocabularyNormalization";
import { normalizeTranscript as speechNormalize } from "@/lib/server/speechNormalization";
import { splitTranscriptIntoClauses } from "@/lib/server/clauseSplitter";
import { groundTranscriptClauses, type GroundedClause } from "@/lib/server/groundTranscriptClauses";
import { getDomPhrasesFromContext } from "@/lib/server/pipelineContext";
import { normalizeTranscript as aiNormalizeTranscript } from "@/lib/server/transcriptNormalization";
import { extractStructuredInstructions, normalizeInstructionActions } from "@/lib/server/instructionExtraction";
import { refineStructuredInstructions } from "@/lib/server/instructionRefinement";
import { correctCopyInInstructions } from "@/lib/ai/copy-correction";
import { resolveInstructionsEntities } from "@/lib/ai/element-resolver";
import { buildInstructionGraph, ticketsFromGraph } from "@/lib/server/instructionGraph";
import { generateTicketTitlesBatch } from "@/lib/ai/ticketTitle";
import { structuredToInstructionStrings } from "@/lib/server/instructionExtraction";
import { verifyTicketsBatch, applyVerifierFinalDecision } from "@/lib/server/ticketVerification";

// ---------------------------------------------------------------------------
// Capture layer: normalize raw request into pipeline input
// ---------------------------------------------------------------------------

export interface PipelineCaptureInput {
  transcript: string;
  context?: unknown;
}

export interface PipelineCapture {
  transcript: string;
  context: PipelineContext | null;
}

/** Normalize request body to capture shape. No AI. */
export function normalizeInput(raw: PipelineCaptureInput): PipelineCapture {
  const transcript = typeof raw.transcript === "string" ? raw.transcript.trim() : "";
  const context = normalizeContext(raw.context);
  return { transcript, context };
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
    scrollX: typeof o.scrollX === "number" ? o.scrollX : undefined,
    scrollY: typeof o.scrollY === "number" ? o.scrollY : undefined,
    devicePixelRatio: typeof o.devicePixelRatio === "number" ? o.devicePixelRatio : undefined,
    domPath: o.domPath != null && typeof o.domPath === "string" ? o.domPath : null,
    nearbyText:
      Array.isArray(o.nearbyText) && o.nearbyText.length > 0
        ? (o.nearbyText as unknown[]).filter((x): x is string => typeof x === "string").join("\n")
        : o.nearbyText != null && typeof o.nearbyText === "string"
          ? o.nearbyText
          : null,
    visibleText: o.visibleText != null && typeof o.visibleText === "string" ? o.visibleText : null,
    screenshotOCRText: o.screenshotOCRText != null && typeof o.screenshotOCRText === "string" ? o.screenshotOCRText : null,
    subtreeText: o.subtreeText != null && typeof o.subtreeText === "string" ? o.subtreeText : null,
    elements: elements.length > 0 ? elements : undefined,
    visibleElements: elements.length > 0 ? elements : undefined,
  };
}

// ---------------------------------------------------------------------------
// Perception layer: clean and prepare signals (deterministic + optional AI)
// ---------------------------------------------------------------------------

export interface PerceptionOutput {
  normalizedTranscript: string;
  /** Phase A: minimal spatial context (truncated) for early extraction. */
  spatialContext: SpatialContext;
  /** Phase B: full context for copy-correction and entity resolution; await in parallel with extraction. */
  fullSpatialContextPromise: Promise<SpatialContext>;
  context: PipelineContext | null;
  /** Grounding step output: pre-detected entities, actions, properties per clause (no AI). */
  groundedClauses: GroundedClause[];
  /** Estimated cost in USD for transcript normalization (0 if not used). */
  normalizationCost?: number;
}

export function runPerceptionLayer(
  capture: PipelineCapture,
  options: { useTranscriptNormalization?: boolean; openai?: OpenAI }
): Promise<PerceptionOutput> {
  console.log("[PIPELINE] perception");
  const { transcript, context } = capture;
  if (!transcript) {
    const empty = buildSpatialContext(null);
    return Promise.resolve({
      normalizedTranscript: "",
      spatialContext: empty,
      fullSpatialContextPromise: Promise.resolve(empty),
      context,
      groundedClauses: [],
      normalizationCost: 0,
    });
  }

  // Deterministic: proper noun anchoring, UI vocabulary, speech normalization
  const afterAnchoring = anchorProperNouns(transcript, context?.visibleText ?? null);
  const afterUiNorm = normalizeUiVocabulary(afterAnchoring);
  const afterSpeechNorm = speechNormalize(afterUiNorm);

  // Deterministic: split compound instructions into clauses (no AI)
  const clauses = splitTranscriptIntoClauses(afterSpeechNorm);
  const afterClauseSplit =
    clauses.length > 0 ? clauses.join("\n") : afterSpeechNorm;

  // Grounding: pre-detect entities, actions, UI properties (no AI; <2ms)
  const domPhrases = getDomPhrasesFromContext(context);
  const groundedClauses = groundTranscriptClauses({ clauses, domPhrases });
  console.log("[PIPELINE] grounding");

  // Optional AI: transcript normalization (STT/grammar fix)
  const normalizeFinal = options.useTranscriptNormalization && options.openai
    ? () => aiNormalizeTranscript(options.openai!, afterClauseSplit, { retryOnce: true })
    : () => Promise.resolve({ normalized: afterClauseSplit, cost: 0 });

  return normalizeFinal().then((result) => {
    const normalizedTranscript = result.normalized;
    const normalizationCost = result.cost ?? 0;
    const spatialInput = {
      domPath: context?.domPath ?? null,
      visibleText: context?.visibleText ?? null,
      nearbyText: context?.nearbyText ?? null,
      viewportWidth: context?.viewportWidth,
      viewportHeight: context?.viewportHeight,
      scrollX: context?.scrollX,
      scrollY: context?.scrollY,
      screenshotOCRText: context?.screenshotOCRText ?? context?.visibleText ?? null,
      subtreeText: context?.subtreeText ?? null,
    };
    // Phase A: minimal context (no DOM extraction) for early extraction; same data shape as full
    const minimalContext = buildMinimalSpatialContext(spatialInput);
    const spatialContext = truncateSpatialContext(minimalContext) as SpatialContext;
    // Phase B: full spatial context in parallel with extraction (deferred so extraction can start immediately)
    const fullSpatialContextPromise = Promise.resolve().then(() =>
      buildSpatialContext(spatialInput)
    );
    return {
      normalizedTranscript,
      spatialContext,
      fullSpatialContextPromise,
      context,
      groundedClauses,
      normalizationCost,
    };
  });
}

// ---------------------------------------------------------------------------
// Understanding layer: primary AI extraction + optional refinement
// ---------------------------------------------------------------------------

/** Action verbs used to detect multiple comma-separated instructions. */
const ACTION_VERBS =
  /\b(change|move|add|remove|make|update|fix|show|hide|reduce|increase|rename|replace)\b/i;

/**
 * Heuristic: instruction likely contains multiple actions.
 * Only call refineStructuredInstructions when this returns true.
 */
export function hasCompoundInstructions(instructions: ExtractedInstruction[]): boolean {
  if (instructions.length === 0) return false;
  for (const i of instructions) {
    const a = (i.action || "").trim();
    // Long instruction text (>120 characters) often contains multiple actions
    if (a.length > 120) return true;
    // "and" / "then" / "also" + follow-up action
    if (/\b(and|then|also)\s+(the|to|we|make|change|move|add|remove)\b/i.test(a)) return true;
    // Multiple comma- or semicolon-separated verb phrases (e.g. "change X, move Y")
    if (a.includes(",") || a.includes(";")) {
      const parts = a.split(/[,;]/).map((p) => p.trim()).filter(Boolean);
      const withVerb = parts.filter((p) => ACTION_VERBS.test(p));
      if (withVerb.length >= 2) return true;
    }
  }
  return false;
}

export interface UnderstandingOutput {
  instructions: ExtractedInstruction[];
  needsClarification: boolean;
  segmentConfidence: number;
  /** Estimated cost in USD for extraction (and optional refinement). */
  extractionCost?: number;
  refinementCost?: number;
}

export interface UnderstandingLayerOptions {
  /** When provided, telemetry is recorded (extraction/refinement latency, aiCallCount, contextCharactersSent, instructionCount). */
  metrics?: PipelineMetrics;
}

export async function runUnderstandingLayer(
  client: OpenAI,
  perception: PerceptionOutput,
  options?: UnderstandingLayerOptions
): Promise<UnderstandingOutput> {
  const { normalizedTranscript, spatialContext, context } = perception;
  const metrics = options?.metrics;

  if (!normalizedTranscript.trim()) {
    return { instructions: [], needsClarification: true, segmentConfidence: 0 };
  }

  // Smart context filtering for extraction only; copy-correction and entity resolution use full context
  const filteredContext = filterRelevantContext(normalizedTranscript, spatialContext);
  if (metrics) {
    metrics.contextCharactersSent =
      filteredContext.domScopeText.length +
      filteredContext.nearbyScopeText.length +
      filteredContext.viewportScopeText.length +
      filteredContext.screenshotOCRText.length;
  }

  console.log("[PIPELINE] extraction");
  const extractionStart = Date.now();
  // Start extraction with Phase A context; run full spatial context (Phase B) in parallel
  const extractionPromise = extractStructuredInstructions(client, normalizedTranscript, context, {
    retryOnce: true,
    spatialContext: filteredContext,
    groundedClauses: perception.groundedClauses?.length ? perception.groundedClauses : undefined,
  });
  const [extractionResult, fullSpatialContext] = await Promise.all([
    extractionPromise,
    perception.fullSpatialContextPromise,
  ]);
  if (metrics) {
    metrics.extractionLatencyMs = Date.now() - extractionStart;
    metrics.aiCallCount += 1;
  }

  let instructions = extractionResult.instructions;
  const extractionCost = extractionResult.cost ?? 0;

  // Deterministic: copy correction, entity resolution (DOM → nearby → viewport → OCR), then action normalization
  instructions = correctCopyInInstructions(instructions, fullSpatialContext);
  instructions = resolveInstructionsEntities(instructions, fullSpatialContext, {
    context: context ?? null,
    transcript: normalizedTranscript,
  });
  instructions = normalizeInstructionActions(instructions);

  let refinementCost = 0;
  // Optional refinement: only when compound instructions detected (saves AI call when not needed)
  if (instructions.length > 0 && hasCompoundInstructions(instructions)) {
    const refinementStart = Date.now();
    const refinementResult = await refineStructuredInstructions(client, instructions);
    instructions = refinementResult.instructions;
    refinementCost = refinementResult.cost;
    if (metrics) {
      metrics.refinementLatencyMs = Date.now() - refinementStart;
      metrics.aiCallCount += 1;
    }
  }

  if (metrics) metrics.instructionCount = instructions.length;

  const segmentConfidence =
    instructions.length > 0
      ? instructions.reduce((s, i) => s + i.confidence, 0) / instructions.length
      : 0;

  return {
    instructions,
    needsClarification: extractionResult.needsClarification,
    segmentConfidence,
    extractionCost,
    refinementCost,
  };
}

// ---------------------------------------------------------------------------
// Structuring layer: graph + tickets (deterministic; no ontology fallback)
// ---------------------------------------------------------------------------

const MAX_INSTRUCTIONS = 12;

export interface StructuringOutput {
  graph: InstructionGraph;
  tickets: PipelineTicket[];
  refinedInstructions: ExtractedInstruction[];
  instructionLimitWarning: string | null;
  graphNeedsClarification: boolean;
  /** Estimated cost in USD for ticket title generation. */
  titleCost?: number;
}

export async function runStructuringLayer(
  client: OpenAI,
  understanding: UnderstandingOutput,
  perception: PerceptionOutput,
  context: PipelineContext | null
): Promise<StructuringOutput> {
  let { instructions } = understanding;
  let instructionLimitWarning: string | null = null;
  if (instructions.length > MAX_INSTRUCTIONS) {
    instructionLimitWarning = `Only the first ${MAX_INSTRUCTIONS} instructions were processed. ${instructions.length - MAX_INSTRUCTIONS} were skipped.`;
    instructions = instructions.slice(0, MAX_INSTRUCTIONS);
  }

  const { graph, needsClarification: graphNeedsClarification } = buildInstructionGraph({
    structuredInstructions: instructions,
    context,
    transcript: perception.normalizedTranscript,
  });

  const tickets = ticketsFromGraph(graph, instructions);
  let titleCost = 0;
  if (tickets.length > 0) {
    const titleResult = await generateTicketTitlesBatch(client, tickets);
    titleCost = titleResult.cost;
    tickets.forEach((t, i) => {
      t.title = (titleResult.titles[i] ?? t.title).slice(0, 120);
    });
  }

  return {
    graph,
    tickets,
    refinedInstructions: instructions,
    instructionLimitWarning,
    graphNeedsClarification,
    titleCost,
  };
}

// ---------------------------------------------------------------------------
// Output layer: optional verification, clarity, response shape
// ---------------------------------------------------------------------------

const TRANSCRIPT_ACTION_VERBS = /\b(reduce|increase|move|change|rename|hide|show|add|remove)\b/i;
const CLARITY_EXTREME_LOW_CONFIDENCE = 0.45;

function transcriptWordCount(transcript: string): number {
  return transcript.trim().split(/\s+/).filter(Boolean).length;
}

function transcriptHasActionVerbs(transcript: string): boolean {
  return TRANSCRIPT_ACTION_VERBS.test(transcript);
}

export interface PipelineOutput {
  success: boolean;
  tickets: Array<Record<string, unknown>>;
  error?: string;
  clarityScore?: number;
  clarityIssues?: string[];
  suggestedRewrite?: string | null;
  confidence?: number;
  needsClarification?: boolean;
  verificationIssues?: string[];
  verificationWarnings?: string[];
  instructionLimitWarning?: string | null;
  extractedInstructions?: ExtractedInstruction[];
  /** Estimated cost in USD for verification (0 if not run). */
  verificationCost?: number;
}

export interface RunPipelineOptions {
  /** Use AI transcript normalization (extra LLM call). Default false to minimize usage. */
  useTranscriptNormalization?: boolean;
  /** Run ticket verification LLM pass. Default false to minimize usage. */
  useVerification?: boolean;
}

export async function runOutputLayer(
  client: OpenAI,
  structuring: StructuringOutput,
  understanding: UnderstandingOutput,
  perception: PerceptionOutput,
  options: RunPipelineOptions
): Promise<PipelineOutput> {
  const { refinedInstructions, instructionLimitWarning, graphNeedsClarification } = structuring;
  const instructionStrings = structuredToInstructionStrings(refinedInstructions);
  const { normalizedTranscript } = perception;
  const { needsClarification: segmentNeedsClarification, segmentConfidence } = understanding;

  // Early exit: no instructions → clarity response
  if (structuring.tickets.length === 0 && refinedInstructions.length === 0) {
    const wordCount = transcriptWordCount(normalizedTranscript);
    const hasActionVerbs = transcriptHasActionVerbs(normalizedTranscript);
    const shouldTriggerClarification = wordCount < 12 && !hasActionVerbs;
    return {
      success: true,
      tickets: [],
      needsClarification: shouldTriggerClarification,
      verificationIssues: shouldTriggerClarification
        ? ["Vague or unclear feedback. Please specify what to change (e.g. which element and what to change)."]
        : undefined,
      clarityScore: Math.round(segmentConfidence * 100),
      clarityIssues: shouldTriggerClarification ? ["Feedback too vague to create a ticket"] : [],
      suggestedRewrite: shouldTriggerClarification
        ? "Please specify what you'd like to change (e.g. which element and what to change)."
        : null,
      confidence: 0,
      extractedInstructions: refinedInstructions,
      verificationCost: 0,
    };
  }

  // Graph produced no tickets but we had instructions → needs clarification (no ontology fallback)
  if (structuring.tickets.length === 0) {
    return {
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
      instructionLimitWarning: instructionLimitWarning ?? undefined,
      extractedInstructions: refinedInstructions,
      verificationCost: 0,
    };
  }

  let pipelineTickets = structuring.tickets;
  let verifications: VerificationResult[] = [];
  let verificationCost = 0;

  if (options.useVerification && pipelineTickets.length > 0) {
    console.log("[PIPELINE] verification");
    const verifyResult = await verifyTicketsBatch(
      client,
      normalizedTranscript,
      instructionStrings,
      pipelineTickets,
      { retryOnce: true }
    );
    verifications = applyVerifierFinalDecision(verifyResult.results);
    verificationCost = verifyResult.cost;
  } else {
    // No verification call: treat all as pass
    verifications = pipelineTickets.map(() => ({
      isAccurate: true,
      isActionable: true,
      needsClarification: false,
      confidence: segmentConfidence,
    }));
  }

  const validIndices: number[] = [];
  const verificationWarnings: string[] = [];
  verifications.forEach((v, i) => {
    const pass = v.isAccurate && v.isActionable && !v.needsClarification;
    if (pass) validIndices.push(i);
    else verificationWarnings.push(`Ticket ${i + 1} (${pipelineTickets[i]?.title ?? "?"}): did not pass verification`);
  });

  const validTickets = validIndices.map((i) => pipelineTickets[i]);

  if (validTickets.length === 0 && pipelineTickets.length > 0) {
    const avgConf = verifications.length > 0
      ? verifications.reduce((s, v) => s + v.confidence, 0) / verifications.length
      : 0.5;
    return {
      success: true,
      tickets: [],
      needsClarification: true,
      verificationIssues: ["No tickets passed verification."],
      verificationWarnings: verificationWarnings.length > 0 ? verificationWarnings : undefined,
      clarityScore: 0,
      clarityIssues: verificationWarnings,
      suggestedRewrite: "Please rephrase your feedback so we can create an actionable ticket.",
      confidence: Math.min(...verifications.map((v) => v.confidence)),
      instructionLimitWarning: instructionLimitWarning ?? undefined,
      extractedInstructions: refinedInstructions,
      verificationCost,
    };
  }

  const minConfidence =
    verifications.length > 0
      ? Math.min(...validIndices.map((i) => verifications[i].confidence))
      : segmentConfidence;
  const avgConfidenceForClarity =
    validTickets.length > 0 && validIndices.length > 0
      ? validIndices.reduce((s, i) => s + verifications[i].confidence, 0) / validIndices.length
      : minConfidence;
  const instructionCountNorm = Math.min(1, validTickets.length);
  const clarityScoreValue = instructionCountNorm * 0.6 + avgConfidenceForClarity * 0.4;
  const clarityScore100 = Math.round(clarityScoreValue * 100);

  const valid = validTickets.map((t) => ({
    title: t.title,
    actionSteps: t.actionSteps,
    suggestedTags: t.tags,
    confidenceScore: t.confidenceScore,
  }));

  return {
    success: true,
    tickets: valid,
    clarityScore: clarityScore100,
    clarityIssues: valid.length > 0 ? [] : (graphNeedsClarification ? ["Some instructions had low confidence"] : []),
    suggestedRewrite: null,
    confidence: valid.length > 0 ? minConfidence : segmentConfidence,
    needsClarification: false,
    verificationWarnings: verificationWarnings.length > 0 ? verificationWarnings : undefined,
    instructionLimitWarning: instructionLimitWarning ?? undefined,
    extractedInstructions: refinedInstructions,
    verificationCost,
  };
}

// ---------------------------------------------------------------------------
// Pipeline entry: run full pipeline
// ---------------------------------------------------------------------------

/**
 * Run the full feedback pipeline. Call from the structure-feedback API route.
 *
 * Options:
 * - useTranscriptNormalization: false (default) — no extra AI for transcript cleanup.
 * - useVerification: false (default) — no verification LLM call; tickets pass by default.
 *
 * With defaults: at most 2 AI calls (extraction + optional refinement when compound).
 */
export async function runFeedbackPipeline(
  client: OpenAI,
  input: PipelineCaptureInput,
  options: RunPipelineOptions = {}
): Promise<PipelineOutput> {
  const pipelineStart = Date.now();
  const metrics = createPipelineMetrics();

  const useTranscriptNorm = options.useTranscriptNormalization === true;
  const useVerification = options.useVerification === true;

  let totalCost = 0;

  const capture = normalizeInput(input);
  console.log("[PIPELINE] capture");
  const perception = await runPerceptionLayer(capture, {
    useTranscriptNormalization: useTranscriptNorm,
    openai: useTranscriptNorm ? client : undefined,
  });
  totalCost += perception.normalizationCost ?? 0;

  const understanding = await runUnderstandingLayer(client, perception, { metrics });
  totalCost += understanding.extractionCost ?? 0;
  totalCost += understanding.refinementCost ?? 0;

  const structuring = await runStructuringLayer(client, understanding, perception, capture.context);
  totalCost += structuring.titleCost ?? 0;
  console.log("[PIPELINE] structuring");

  const output = await runOutputLayer(client, structuring, understanding, perception, {
    useVerification,
  });
  totalCost += output.verificationCost ?? 0;
  console.log("[PIPELINE] output");

  metrics.pipelineLatencyMs = Date.now() - pipelineStart;
  logPipelineMetrics(metrics);

  const extractionCost = understanding.extractionCost ?? 0;
  const refinementCost = understanding.refinementCost ?? 0;
  const titleCost = structuring.titleCost ?? 0;
  const verificationCost = output.verificationCost ?? 0;
  const normalizationCost = perception.normalizationCost ?? 0;

  console.log("[AI COST TOTAL]", { feedbackCost: totalCost });
  console.log("[AI COST SUMMARY]", {
    normalizationCost,
    extractionCost,
    refinementCost,
    titleCost,
    verificationCost,
    totalCost,
  });

  return output;
}
