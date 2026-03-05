/**
 * Instruction Extraction Engine — Converts spoken product feedback into
 * precise, structured instructions (intent, entity, action, confidence).
 * Output is always structured JSON. Does not summarize; extracts multiple
 * instructions when feedback contains multiple changes.
 */

import type OpenAI from "openai";
import {
  getElementsForPrompt,
  getTextContextForPrompt,
  type PipelineContext,
} from "./pipelineContext";
import type { SpatialContext } from "@/lib/ai/spatial-context-builder";
import type { GroundedClause } from "./groundTranscriptClauses";
import { estimateCost } from "@/lib/ai/costEstimator";

// ---------------------------------------------------------------------------
// Intent types (use ONLY these)
// ---------------------------------------------------------------------------

export const EXTRACTION_INTENTS = [
  "COPY_CHANGE",
  "UI_LAYOUT",
  "UI_VISUAL_ADJUSTMENT",
  "COMPONENT_CHANGE",
  "FORM_LOGIC",
  "DATA_VALIDATION",
  "PERFORMANCE_OPTIMIZATION",
  "ANALYTICS_TRACKING",
  "BACKEND_BEHAVIOR",
  "SECURITY_REQUIREMENT",
  "GENERAL_INVESTIGATION",
] as const;

export type ExtractionIntent = (typeof EXTRACTION_INTENTS)[number];

export function isValidExtractionIntent(s: string): s is ExtractionIntent {
  return (EXTRACTION_INTENTS as readonly string[]).includes(s);
}

// ---------------------------------------------------------------------------
// Structured instruction (one per change)
// ---------------------------------------------------------------------------

export interface ExtractedInstruction {
  intent: ExtractionIntent;
  entity: string;
  action: string;
  confidence: number;
}

export interface ExtractionResult {
  instructions: ExtractedInstruction[];
  needsClarification: boolean;
  /** Estimated cost in USD for telemetry (only set when AI was called). */
  cost?: number;
}

// ---------------------------------------------------------------------------
// System prompt (instruction extraction engine spec)
// ---------------------------------------------------------------------------

const EXTRACTION_SYSTEM_PROMPT = `You are an AI that converts spoken UI feedback into structured product tickets.

INPUTS: Transcript (user's spoken feedback), Page Context (visible text, DOM text, nearby UI labels).

Your job is to extract structured UI instructions. You do NOT summarize.

Each instruction must identify:

1. Intent — one of: COPY_CHANGE | UI_LAYOUT | UI_VISUAL_ADJUSTMENT | COMPONENT_CHANGE | FORM_LOGIC | DATA_VALIDATION | PERFORMANCE_OPTIMIZATION | ANALYTICS_TRACKING | BACKEND_BEHAVIOR | SECURITY_REQUIREMENT | GENERAL_INVESTIGATION
2. Entity — the specific UI element affected (see RULE 1)
3. Action — clear, developer-actionable instruction (see RULE 2)
4. Confidence — 0.0–1.0


------------------------------------

RULE 1 — ENTITY: PREFER TRANSCRIPT, INFER ONLY WHEN AMBIGUOUS

Prefer transcript entities first. If the user explicitly mentions an element (title, button, logo, icon, image, hero section, card, column, menu, footer, header), use that as the entity.

Only infer entities from page context when the transcript is ambiguous (e.g. "that button", "this thing").

Avoid vague entities: "page", "design", "layout", "element", "content" — unless absolutely necessary.

Bad: entity: "title" → Better: entity: "hero title"
Bad: entity: "button" → Better: entity: "signup button"
Bad: entity: "element" or "page" → Use a specific component name from transcript or context.


------------------------------------

RULE 2 — ACTION: PRECISE AND ACTIONABLE

Actions must be precise and actionable.

Good: "change button color from green to blue"
Bad: "improve the button"

Good: "increase spacing between the logo and navigation links"
Bad: "spacing issue"

Every action must be implementable. Avoid vague or subjective phrasing.


------------------------------------

RULE 3 — SPLIT MULTIPLE CHANGES

If the transcript contains multiple changes, produce multiple instructions. Each instruction must represent exactly one change.

Example input: "make the hero smaller and change the CTA color"

Expected output: two instructions:
1. entity: "hero section", action: "reduce the size of the hero section"
2. entity: "CTA button", action: "change the CTA button color"

Do NOT merge unrelated changes into one instruction.


------------------------------------

RULE 4 — USE SPATIAL CONTEXT (PRIORITY ORDER)

When spatial context is provided, use it in this order:

1. DOM scope — text from the DOM subtree of the captured element (most accurate)
2. Nearby scope — text near the capture point
3. Viewport scope — text visible in the current viewport
4. OCR fallback — screenshot OCR (least reliable)

Always prefer DOM scope over nearby, nearby over viewport, viewport over OCR. Resolve UI elements ONLY from the provided spatial context. Do not reference elements outside it.


------------------------------------

INTENT TYPES (use ONLY these)

COPY_CHANGE
UI_LAYOUT
UI_VISUAL_ADJUSTMENT
COMPONENT_CHANGE
FORM_LOGIC
DATA_VALIDATION
PERFORMANCE_OPTIMIZATION
ANALYTICS_TRACKING
BACKEND_BEHAVIOR
SECURITY_REQUIREMENT
GENERAL_INVESTIGATION


------------------------------------

INTENT DEFINITIONS

COPY_CHANGE — text, labels, wording.
UI_LAYOUT — spacing, alignment, positioning, hierarchy.
UI_VISUAL_ADJUSTMENT — size, prominence, visibility, styling.
COMPONENT_CHANGE — add, remove, replace, or restructure a UI component (e.g. add a CTA, remove a column).
FORM_LOGIC — conditional form behavior or input logic.
DATA_VALIDATION — correctness or source of data.
PERFORMANCE_OPTIMIZATION — speed, loading, resources.
ANALYTICS_TRACKING — events, instrumentation.
BACKEND_BEHAVIOR — system triggers, API behavior.
SECURITY_REQUIREMENT — auth, permissions, access.
GENERAL_INVESTIGATION — user suspects a problem but does not specify the fix.


------------------------------------

CONFIDENCE RULES

Set confidence to reflect entity clarity, action clarity, and context match:

• 0.9+ — Entity matched in DOM or nearby text; action is explicit and unambiguous.
• 0.7–0.9 — Inferred from context; element or action reasonably clear.
• <0.7 — Element or intent is ambiguous; user reference is vague.


------------------------------------

OUTPUT FORMAT

Only return valid JSON. No markdown code fences. No explanation.

[
  {
    "intent": "COPY_CHANGE | UI_LAYOUT | UI_VISUAL_ADJUSTMENT | COMPONENT_CHANGE | ...",
    "entity": "specific UI element",
    "action": "clear developer instruction",
    "confidence": 0.0-1.0
  }
]

Wrapped in an object with key "instructions": { "instructions": [ ... ] }


------------------------------------

EXTRACTION PRINCIPLES

1. Split compound instructions — multiple changes → multiple instructions.
2. Prefer transcript entities first; infer from page context only when ambiguous.
3. Avoid vague entities: "page", "design", "layout", "element", "content" unless necessary.
4. Actions must be precise and actionable.
5. Do NOT merge unrelated changes.
6. Ignore filler: "maybe", "I think", "kind of".
7. Never hallucinate instructions not implied by the feedback.
8. Resolve vague references using spatial context: DOM scope → Nearby → Viewport → OCR.

Only return valid JSON.`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capTranscript(transcript: string): string {
  const MAX = 2000;
  if (!transcript) return "";
  if (transcript.length <= MAX) return transcript;
  return transcript.slice(0, MAX) + "...";
}

function buildUserContent(
  transcript: string,
  context: PipelineContext | null,
  spatialContext?: SpatialContext | null,
  groundedClauses?: GroundedClause[]
): string {
  const lines: string[] = ["User feedback transcript:", `"${transcript}"`];

  if (groundedClauses && groundedClauses.length > 0) {
    lines.push(
      "",
      "Pre-detected grounding hints (use to disambiguate entity/action/property):",
      groundedClauses
        .map(
          (g) =>
            `- "${g.clause}" → entities: [${g.entityCandidates.join(", ") || "—"}], action: ${g.action ?? "—"}, property: ${g.property ?? "—"} (confidence: ${g.confidence})`
        )
        .join("\n")
    );
  }

  if (spatialContext && (spatialContext.domScopeText || spatialContext.nearbyScopeText || spatialContext.viewportScopeText || spatialContext.screenshotOCRText)) {
    lines.push(
      "",
      "Spatial context — resolve UI elements ONLY from these sources. Use this priority order: DOM scope → Nearby scope → Viewport scope → OCR fallback. Do not reference elements outside this context."
    );
    if (spatialContext.domScopeText) lines.push("", "[DOM scope] (prefer for entity resolution)", spatialContext.domScopeText.slice(0, 1500));
    if (spatialContext.nearbyScopeText) lines.push("", "[Nearby scope]", spatialContext.nearbyScopeText.slice(0, 1000));
    if (spatialContext.viewportScopeText) lines.push("", "[Viewport scope]", spatialContext.viewportScopeText.slice(0, 2000));
    if (spatialContext.screenshotOCRText && !spatialContext.viewportScopeText) lines.push("", "[OCR fallback]", spatialContext.screenshotOCRText.slice(0, 1500));
  }

  const textContext = getTextContextForPrompt(context ?? undefined);
  if (textContext && !spatialContext) {
    lines.push(
      "",
      "Visible text from page (use ONLY to identify which element the user means; do NOT copy into instructions as requested content):",
      textContext
    );
  } else if (textContext && spatialContext) {
    lines.push("", "Additional visible text (reference only):", textContext.slice(0, 1000));
  }
  const elements = getElementsForPrompt(context ?? undefined);
  if (elements.length > 0) {
    lines.push(
      "",
      "Known UI elements (prefer these for entity names):",
      JSON.stringify(elements.slice(0, 80), null, 0).slice(0, 2000)
    );
  }
  return lines.join("\n");
}

function clampConfidence(n: unknown): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function normalizeInstruction(raw: unknown): ExtractedInstruction | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const intent = typeof o.intent === "string" && isValidExtractionIntent(o.intent) ? o.intent : "GENERAL_INVESTIGATION";
  const entity = typeof o.entity === "string" ? String(o.entity).trim().slice(0, 200) : "";
  const action = typeof o.action === "string" ? String(o.action).trim().slice(0, 500) : "";
  if (!action) return null;
  return {
    intent,
    entity: entity || "unknown",
    action,
    confidence: clampConfidence(o.confidence),
  };
}

/** Default when extraction returns nothing or fails. */
function fallbackResult(): ExtractionResult {
  return { instructions: [], needsClarification: true, cost: 0 };
}

// ---------------------------------------------------------------------------
// Action normalization (deterministic; no LLM)
// ---------------------------------------------------------------------------

/** Pairs of (pattern, replacement) for normalizing vague actions into developer tasks. */
const ACTION_NORMALIZE_RULES: Array<{ pattern: RegExp | ((action: string) => boolean); replacement: string }> = [
  { pattern: /\b(spacing|space)\s+(feels\s+)?tight\b/i, replacement: "increase spacing" },
  { pattern: /\b(spacing|space)\s+(is\s+)?(too\s+)?tight\b/i, replacement: "increase spacing" },
  { pattern: /\b(spacing|space)\s+(feels\s+)?(too\s+)?cramped\b/i, replacement: "increase spacing" },
  { pattern: /\bhero\s+(is\s+)?(too\s+)?(big|large)\b/i, replacement: "reduce the size of the hero section" },
  { pattern: /\b(hero|section|element|block)\s+(is\s+)?(too\s+)?big\b/i, replacement: "reduce the size of the $1" },
  { pattern: /\b(hero|section|element|block)\s+(is\s+)?(too\s+)?large\b/i, replacement: "reduce the size of the $1" },
  { pattern: /\b(hero|section|element|block)\s+(is\s+)?(too\s+)?small\b/i, replacement: "increase the size of the $1" },
  { pattern: /\b(text|font)\s+(is\s+)?(too\s+)?small\b/i, replacement: "increase the font size" },
  { pattern: /\b(text|font)\s+(is\s+)?(too\s+)?big\b/i, replacement: "reduce the font size" },
  { pattern: /\b(button|element)\s+looks\s+wrong\b/i, replacement: "fix the styling of the $1" },
  { pattern: /\b(button|link|element)\s+(looks\s+)?(weird|off|bad)\b/i, replacement: "adjust the styling of the $1" },
  { pattern: (a) => /^\s*spacing\s+issue\s*$/i.test(a), replacement: "increase spacing" },
  { pattern: (a) => /^\s*layout\s+issue\s*$/i.test(a), replacement: "improve the layout" },
];

/**
 * Normalize vague or subjective actions into clear developer tasks.
 * Deterministic; no LLM. Applied after extraction.
 */
export function normalizeInstructionActions(instructions: ExtractedInstruction[]): ExtractedInstruction[] {
  return instructions.map((inst) => {
    let action = inst.action.trim();
    for (const { pattern, replacement } of ACTION_NORMALIZE_RULES) {
      if (typeof pattern === "function") {
        if (pattern(action)) {
          action = replacement;
          break;
        }
      } else {
        const m = action.match(pattern);
        if (m) {
          action = replacement.replace(/\$1/g, m[1] ?? "element");
          break;
        }
      }
    }
    if (action === inst.action) return inst;
    return { ...inst, action };
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract structured instructions from a feedback transcript.
 * Returns intent, entity, action, and confidence per instruction.
 * Uses pipeline context (visibleText, elements) when provided.
 */
export async function extractStructuredInstructions(
  client: OpenAI,
  transcript: string,
  context: PipelineContext | null = null,
  options?: { retryOnce?: boolean; spatialContext?: SpatialContext | null; groundedClauses?: GroundedClause[] }
): Promise<ExtractionResult> {
  const trimmed = transcript && typeof transcript === "string" ? transcript.trim() : "";
  const retryOnce = options?.retryOnce ?? true;
  const spatialContext = options?.spatialContext ?? null;
  const groundedClauses = options?.groundedClauses ?? undefined;

  if (!trimmed) {
    return fallbackResult();
  }

  const cappedTranscript = capTranscript(trimmed);

  const run = async (): Promise<ExtractionResult> => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      top_p: 1,
      max_tokens: 1600,
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: buildUserContent(cappedTranscript, context, spatialContext, groundedClauses) },
      ],
    });

    const usage = completion.usage;
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const cost = estimateCost("gpt-4o", promptTokens, completionTokens);
    console.log("[AI COST]", {
      stage: "extraction",
      model: "gpt-4o",
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return fallbackResult();

    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let parsed: { instructions?: unknown[] };
    try {
      parsed = JSON.parse(cleaned) as { instructions?: unknown[] };
    } catch {
      return fallbackResult();
    }

    const rawList = Array.isArray(parsed.instructions) ? parsed.instructions : [];
    const instructions = rawList.map(normalizeInstruction).filter((i): i is ExtractedInstruction => i !== null);
    const needsClarification = instructions.length === 0 || instructions.every((i) => i.confidence < 0.5);

    return { instructions, needsClarification, cost };
  };

  try {
    let result = await run();
    let totalCost = result.cost ?? 0;
    if (retryOnce && result.instructions.length === 0 && result.needsClarification && cappedTranscript.length > 20) {
      result = await run();
      totalCost += result.cost ?? 0;
    }
    return { ...result, cost: totalCost };
  } catch (err) {
    console.error("[instructionExtraction] Failed:", err);
    return fallbackResult();
  }
}

/**
 * Derive a flat list of instruction strings from extracted instructions.
 * Used to feed the rest of the pipeline (graph, ontology, tickets).
 * Format: "entity: action" when entity is meaningful, else just "action".
 */
export function extractedToInstructionStrings(extracted: ExtractedInstruction[]): string[] {
  return structuredToInstructionStrings(extracted);
}

/**
 * Convert structured instructions to strings for prompts, logging, and debugging.
 * Use this only when string form is required (verification prompt, ontology fallback, logs).
 * Format: "entity: action" when entity is meaningful, else just "action".
 */
export function structuredToInstructionStrings(instructions: ExtractedInstruction[]): string[] {
  return instructions.map((i) => {
    const entity = i.entity.trim().toLowerCase();
    if (entity && entity !== "unknown" && entity !== "page" && entity !== "this") {
      return `${i.entity}: ${i.action}`;
    }
    return i.action;
  });
}
