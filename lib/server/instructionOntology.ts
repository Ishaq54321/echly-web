/**
 * Instruction Ontology Layer — Maps refined instructions to structured UI actions.
 * Inserted between Instruction Refinement and Intent Detection.
 * Makes the AI system more deterministic and reduces hallucinations.
 */

import type OpenAI from "openai";
import {
  getElementsForPrompt,
  getTextContextForPrompt,
  type PipelineContext,
} from "./pipelineContext";

/** Canonical instruction/action types for UI feedback. One instruction maps to exactly one. */
export const ONTOLOGY_ACTION_TYPES = [
  "TEXT_CHANGE",
  "RENAME_FIELD",
  "REPLACE_IMAGE",
  "RESIZE_ELEMENT",
  "COLOR_CHANGE",
  "MOVE_ELEMENT",
  "ADD_ELEMENT",
  "REMOVE_ELEMENT",
  "MERGE_FIELDS",
  "LAYOUT_ADJUSTMENT",
  "LINK_UPDATE",
  "BUG_FIX",
  "ACCESSIBILITY_FIX",
] as const;

export type OntologyActionType = (typeof ONTOLOGY_ACTION_TYPES)[number];

export interface OntologyAction {
  action_type: OntologyActionType;
  target_element: string | null;
  change_details: Record<string, unknown>;
  confidence: number;
}

export interface OntologyResult {
  actions: OntologyAction[];
  needsClarification?: boolean;
}

const ONTOLOGY_SYSTEM = `You are Echly's Instruction Ontology Mapper. Map each instruction to exactly ONE structured UI action. Accuracy over creativity. Use temperature 0 behavior.

CANONICAL ACTION TYPES (use exactly one per instruction):
- TEXT_CHANGE: Change visible text/copy (headings, paragraphs, labels).
- RENAME_FIELD: Change the label/placeholder of a form field (e.g. "Email" → "Business Email").
- REPLACE_IMAGE: Swap or replace an image.
- RESIZE_ELEMENT: Make an element bigger or smaller (e.g. button, image).
- COLOR_CHANGE: Change color of an element or text.
- MOVE_ELEMENT: Relocate an element on the page.
- ADD_ELEMENT: Add a new UI element.
- REMOVE_ELEMENT: Remove an element.
- MERGE_FIELDS: Combine two or more fields into one.
- LAYOUT_ADJUSTMENT: Spacing, alignment, columns, margins (not moving a single element).
- LINK_UPDATE: Change link URL, text, or target.
- BUG_FIX: Fix broken behavior or bug (not purely visual).
- ACCESSIBILITY_FIX: Improve accessibility (contrast, focus, labels, etc.).

RULES:
1. One instruction → exactly one action. No merging, no splitting.
2. Prefer DOM context (elements list) over OCR text when resolving target_element. Match labels when possible (e.g. "email" → "Email input field" when DOM has { type: "input", label: "Email" }).
3. target_element: short, specific label (e.g. "Email input field", "hero CTA button"). Use null only if no target can be inferred.
4. change_details: object with type-specific keys (e.g. new_label for RENAME_FIELD, increase/decrease for RESIZE_ELEMENT, new_value for TEXT_CHANGE). No hallucinated keys.
5. confidence: 0–1. If confidence < 0.7 for any action, set needsClarification to true in the response.
6. Do not hallucinate. Only output actions that correspond to the given instructions. Same number of actions as instructions.

OUTPUT FORMAT (strict JSON only, no markdown):
{
  "actions": [
    {
      "action_type": "RENAME_FIELD",
      "target_element": "Email field",
      "change_details": { "new_label": "Business Email" },
      "confidence": 0.92
    }
  ],
  "needsClarification": false
}

Set needsClarification to true when mapping is uncertain or confidence is low for any action.`;

function cleanJson(content: string): string {
  return content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function clamp(n: unknown): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function isValidActionType(s: string): s is OntologyActionType {
  return (ONTOLOGY_ACTION_TYPES as readonly string[]).includes(s);
}

function buildUserContent(instructions: string[], context: PipelineContext | null): string {
  const lines: string[] = [];
  const elements = getElementsForPrompt(context ?? undefined);
  const textContext = getTextContextForPrompt(context ?? undefined);

  if (elements.length > 0) {
    lines.push(
      "DOM elements (prefer these to resolve target_element; use type and label):",
      JSON.stringify(elements.slice(0, 80)).slice(0, 2500)
    );
    lines.push("");
  }
  if (textContext) {
    lines.push("Visible text / context:", textContext);
    lines.push("");
  }
  if (lines.length === 0) lines.push("Visible text from page: (none)");
  lines.push("", "Instructions (map each to exactly one action):", ...instructions.map((s, i) => `${i + 1}. ${s}`));
  return lines.join("\n");
}

function normalizeActions(raw: unknown[] | undefined, expectedLen: number): OntologyAction[] {
  if (!Array.isArray(raw)) return [];
  const result: OntologyAction[] = [];
  for (let i = 0; i < expectedLen; i++) {
    const o = raw[i];
    if (!o || typeof o !== "object") {
      result.push(defaultAction());
      continue;
    }
    const r = o as Record<string, unknown>;
    const action_type =
      typeof r.action_type === "string" && isValidActionType(r.action_type) ? r.action_type : "TEXT_CHANGE";
    const target_element =
      r.target_element != null && typeof r.target_element === "string" && String(r.target_element).trim() !== ""
        ? String(r.target_element).trim().slice(0, 120)
        : null;
    const change_details =
      r.change_details != null && typeof r.change_details === "object" && !Array.isArray(r.change_details)
        ? (r.change_details as Record<string, unknown>)
        : {};
    result.push({
      action_type,
      target_element,
      change_details,
      confidence: clamp(r.confidence),
    });
  }
  return result;
}

function defaultAction(): OntologyAction {
  return {
    action_type: "TEXT_CHANGE",
    target_element: null,
    change_details: {},
    confidence: 0.5,
  };
}

/**
 * Maps each refined instruction to exactly one structured ontology action.
 * Uses DOM context when available to resolve target_element.
 * Returns needsClarification when any action has low confidence.
 */
export async function mapInstructionsToOntology(
  client: OpenAI,
  instructions: string[],
  context: PipelineContext | null,
  options?: { retryOnce?: boolean }
): Promise<OntologyResult> {
  if (instructions.length === 0) {
    return { actions: [], needsClarification: false };
  }

  const retryOnce = options?.retryOnce ?? true;
  const userContent = buildUserContent(instructions, context);

  const call = async (): Promise<OntologyResult> => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      top_p: 1,
      max_tokens: 3000,
      messages: [
        { role: "system", content: ONTOLOGY_SYSTEM },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return fallbackOntology(instructions);

    const parsed = JSON.parse(cleanJson(content)) as {
      actions?: unknown[];
      needsClarification?: unknown;
    };
    const actions = normalizeActions(parsed.actions, instructions.length);
    const needsClarification =
      Boolean(parsed.needsClarification) || actions.some((a) => a.confidence < 0.7);

    return { actions, needsClarification };
  };

  try {
    const result = await call();
    return result;
  } catch (err) {
    console.error("[instructionOntology] Parse failed:", err);
    if (retryOnce) {
      try {
        return await call();
      } catch (retryErr) {
        console.error("[instructionOntology] Retry failed:", retryErr);
        return fallbackOntology(instructions);
      }
    }
    return fallbackOntology(instructions);
  }
}

function fallbackOntology(instructions: string[]): OntologyResult {
  return {
    actions: instructions.map(() => defaultAction()),
    needsClarification: true,
  };
}
