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

// ---------------------------------------------------------------------------
// Intent types (use ONLY these)
// ---------------------------------------------------------------------------

export const EXTRACTION_INTENTS = [
  "UI_LAYOUT",
  "UI_VISUAL_ADJUSTMENT",
  "FORM_LOGIC",
  "DATA_VALIDATION",
  "PERFORMANCE_OPTIMIZATION",
  "ANALYTICS_TRACKING",
  "BACKEND_BEHAVIOR",
  "COPY_CHANGE",
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
}

// ---------------------------------------------------------------------------
// System prompt (instruction extraction engine spec)
// ---------------------------------------------------------------------------

const EXTRACTION_SYSTEM_PROMPT = `You are the instruction extraction engine for Echly.

Echly converts spoken product feedback into structured engineering instructions.

Your job is NOT to summarize.

Your job is to convert messy human feedback into precise, structured instructions.

Each instruction must identify:

1. Intent — what category of change this is
2. Entity — the UI element, system, or concept affected
3. Action — the concrete change required
4. Confidence — how certain the instruction is (0–1)

The output must always be structured JSON.

You must extract multiple instructions if the feedback contains multiple changes.


------------------------------------

INTENT TYPES

Use ONLY these intents:

UI_LAYOUT
UI_VISUAL_ADJUSTMENT
FORM_LOGIC
DATA_VALIDATION
PERFORMANCE_OPTIMIZATION
ANALYTICS_TRACKING
BACKEND_BEHAVIOR
COPY_CHANGE
SECURITY_REQUIREMENT
GENERAL_INVESTIGATION


------------------------------------

INTENT DEFINITIONS

UI_LAYOUT
Changes to spacing, alignment, positioning, hierarchy.

UI_VISUAL_ADJUSTMENT
Changes to size, prominence, visibility, styling.

FORM_LOGIC
Conditional form behavior or input logic.

DATA_VALIDATION
Checking correctness or source of data.

PERFORMANCE_OPTIMIZATION
Speed improvements, loading, resource optimization.

ANALYTICS_TRACKING
Tracking events, analytics instrumentation.

BACKEND_BEHAVIOR
System triggers, backend logic, API behavior.

COPY_CHANGE
Text, labels, wording.

SECURITY_REQUIREMENT
Authentication, permissions, access control.

GENERAL_INVESTIGATION
User suspects a problem but does not specify the fix.


------------------------------------

ENTITY RULES

The entity is the primary object affected.

Examples:

"hero image"
"signup button"
"pricing numbers"
"cards"
"contact form"
"dashboard"
"API response"
"images below the fold"

If the entity is not explicitly stated, infer the most likely entity.


------------------------------------

ACTION RULES

Actions must be:

• specific  
• developer-actionable  
• written as a clear engineering instruction

Bad action:

"improve layout"

Good action:

"increase spacing between cards"


------------------------------------

CONFIDENCE RULES

0.9–1.0

Clear explicit instruction.

Example:

"reduce the hero image size"

0.7–0.9

Strong inference.

Example:

"the page loads slowly maybe compress images"

0.5–0.7

User suspects an issue.

Example:

"not sure if these numbers come from the API"


------------------------------------

OUTPUT FORMAT

Always return JSON.

Example:

{
  "instructions": [
    {
      "intent": "UI_LAYOUT",
      "entity": "cards",
      "action": "increase spacing between cards",
      "confidence": 0.9
    },
    {
      "intent": "DATA_VALIDATION",
      "entity": "pricing numbers",
      "action": "verify pricing numbers are dynamically loaded from the API",
      "confidence": 0.75
    }
  ]
}


------------------------------------

EXTRACTION PRINCIPLES

1. Break feedback into separate instructions.

2. Do NOT merge unrelated changes.

3. Preserve technical meaning.

4. Ignore filler language.

Example filler:

"maybe"
"I think"
"kind of"
"probably"

5. Focus on engineering tasks.

6. Never hallucinate instructions not implied by the feedback.


------------------------------------

Return structured JSON only. No markdown code fences. No explanation.`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildUserContent(transcript: string, context: PipelineContext | null): string {
  const lines: string[] = ["User feedback transcript:", `"${transcript}"`];
  const textContext = getTextContextForPrompt(context ?? undefined);
  if (textContext) {
    lines.push(
      "",
      "Visible text from page (use ONLY to identify which element the user means; do NOT copy into instructions as requested content):",
      textContext
    );
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
  return { instructions: [], needsClarification: true };
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
  options?: { retryOnce?: boolean }
): Promise<ExtractionResult> {
  const trimmed = transcript && typeof transcript === "string" ? transcript.trim() : "";
  const retryOnce = options?.retryOnce ?? true;

  if (!trimmed) {
    return fallbackResult();
  }

  const run = async (): Promise<ExtractionResult> => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      top_p: 1,
      max_tokens: 1600,
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: buildUserContent(trimmed, context) },
      ],
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

    return { instructions, needsClarification };
  };

  try {
    let result = await run();
    if (retryOnce && result.instructions.length === 0 && result.needsClarification && trimmed.length > 20) {
      result = await run();
    }
    return result;
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
