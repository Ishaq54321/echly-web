/**
 * Stage: Instruction Refinement (after segmentation).
 * Detects instructions that still contain multiple actions and splits them
 * so each instruction represents exactly one developer action.
 */

import type OpenAI from "openai";
import { echlyDebug } from "@/lib/utils/logger";
import {
  EXTRACTION_INTENTS,
  isValidExtractionIntent,
  type ExtractedInstruction,
} from "@/lib/server/instructionExtraction";

const REFINEMENT_SYSTEM = `You are Echly's Instruction Refiner. You work under a unified interpretation policy for messy human feedback. Your job: ensure each instruction is exactly ONE developer-ready action. Be deterministic; preserve the user's meaning.

RULES:
1. One instruction = exactly one developer action. Split compound instructions when they contain multiple distinct changes.
2. PRESERVE MULTIPLE SUGGESTED ACTIONS (Rule 3). When the user proposed multiple distinct improvements (e.g. "stack the links better or add more spacing"), keep them as separate instructions. Do NOT merge into one. Only merge when two instructions are alternative phrasings of the SAME single intent (e.g. "make it bigger or highlight it" → one: "Make the middle pricing card stand out visually").
3. Preserve the user's original meaning. Do not rewrite intent (e.g. "shorten the headline" stays "Shorten the hero headline").
4. Do NOT hallucinate (Rule 4). Only include specifics the user stated. "Make author names stand out more" → "Make testimonial author names more prominent", NOT "Make author names bold".
5. If an instruction already describes a single action and is developer-ready, leave it unchanged or lightly rephrase for clarity only.
6. Output developer-ready instructions: clear, actionable, specific to UI element (Rule 9). Avoid vague: "Improve layout." Prefer: "Increase spacing between pricing cards." When the user left solution general, keep it general.
7. Output only the refined instructions array. No explanation. No markdown.

EXAMPLE (split compound):
Input: ["Change first name and last name to fullname and merge their fields"]
Output: { "instructions": ["Rename the First Name and Last Name fields to Full Name", "Merge the First Name and Last Name fields into one field"] }

EXAMPLE (preserve multiple distinct suggestions):
Input: ["Stack navigation links vertically", "Increase spacing between navigation links"]
Output: { "instructions": ["Stack navigation links vertically.", "Increase spacing between navigation links."] }

EXAMPLE (merge same intent only):
Input: ["Increase size of middle pricing card", "Change color of middle pricing card"]
Output: { "instructions": ["Make the middle pricing card stand out visually."] }

EXAMPLE (no hallucination):
Input: ["Make author names stand out more"]
Output: { "instructions": ["Make testimonial author names more prominent"] }

OUTPUT FORMAT (strict JSON only):
{ "instructions": ["refined instruction 1", "refined instruction 2", ...] }

Split compound items when they are genuinely multiple changes. Never merge two genuinely separate user requests.`;

const STRUCTURED_REFINEMENT_SYSTEM = `You are Echly's Instruction Refiner. Your job: ensure each instruction is exactly ONE developer-ready action. Input and output are STRUCTURED: each instruction has intent, entity, action, confidence.

RULES:
1. One instruction = exactly one developer action. Split compound instructions when they contain multiple distinct changes (e.g. "reduce the hero image and move the signup button below it" → two instructions: one for hero image resize, one for signup button move).
2. Preserve the user's meaning. Do not hallucinate. Only include specifics the user stated.
3. If an instruction already describes a single action, leave it unchanged or lightly rephrase for clarity only.
4. When splitting, assign the most appropriate intent per sub-instruction. Use only these intents: ${EXTRACTION_INTENTS.join(", ")}.
5. When splitting, give each sub-instruction its own entity and action. Preserve or inherit confidence from the original instruction.

OUTPUT FORMAT (strict JSON only, no markdown):
{ "instructions": [ { "intent": "UI_VISUAL_ADJUSTMENT", "entity": "hero image", "action": "reduce the hero image size", "confidence": 0.9 }, ... ] }

Each item must have: intent (one of the list above), entity (string), action (string), confidence (0–1).`;

function cleanJson(content: string): string {
  return content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function normalizeStructuredInstruction(raw: unknown, fallbackConfidence: number): ExtractedInstruction | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const intent = typeof o.intent === "string" && isValidExtractionIntent(o.intent) ? o.intent : "GENERAL_INVESTIGATION";
  const entity = typeof o.entity === "string" ? String(o.entity).trim().slice(0, 200) : "";
  const action = typeof o.action === "string" ? String(o.action).trim().slice(0, 500) : "";
  if (!action) return null;
  const confidence = typeof o.confidence === "number" && !Number.isNaN(o.confidence)
    ? Math.max(0, Math.min(1, o.confidence))
    : fallbackConfidence;
  return {
    intent,
    entity: entity || "unknown",
    action,
    confidence,
  };
}

export interface RefineInstructionsResult {
  instructions: string[];
}

/**
 * Refines structured instructions by splitting compound instructions into
 * one instruction per developer action. Preserves structure (intent, entity, action, confidence).
 * Returns the same list if parsing fails (defensive).
 */
export async function refineStructuredInstructions(
  client: OpenAI,
  instructions: ExtractedInstruction[]
): Promise<ExtractedInstruction[]> {
  if (instructions.length === 0) {
    return [];
  }

  echlyDebug("STRUCTURED REFINEMENT INPUT", instructions);

  const userContent = [
    "Structured instructions to refine (split compounds; output same JSON shape):",
    JSON.stringify(instructions, null, 2),
  ].join("\n\n");

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      top_p: 1,
      max_tokens: 2000,
      messages: [
        { role: "system", content: STRUCTURED_REFINEMENT_SYSTEM },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      echlyDebug("STRUCTURED REFINEMENT OUTPUT", instructions);
      return instructions;
    }

    const parsed = JSON.parse(cleanJson(content)) as { instructions?: unknown[] };
    const rawList = Array.isArray(parsed.instructions) ? parsed.instructions : [];
    const fallbackConfidence = instructions.length > 0
      ? instructions.reduce((s, i) => s + i.confidence, 0) / instructions.length
      : 0.5;
    const result = rawList
      .map((raw) => normalizeStructuredInstruction(raw, fallbackConfidence))
      .filter((i): i is ExtractedInstruction => i !== null);

    const out = result.length > 0 ? result : instructions;
    echlyDebug("STRUCTURED REFINEMENT OUTPUT", out);
    return out;
  } catch (err) {
    console.error("[instructionRefinement] Structured refinement failed:", err);
    echlyDebug("STRUCTURED REFINEMENT OUTPUT", instructions);
    return instructions;
  }
}

/**
 * Refines a list of instructions so each is exactly one developer action.
 * Uses gpt-4o-mini. Returns same list if parsing fails (defensive).
 * @deprecated Prefer refineStructuredInstructions for pipeline use so structure is preserved.
 */
export async function refineInstructions(
  client: OpenAI,
  instructions: string[]
): Promise<RefineInstructionsResult> {
  if (instructions.length === 0) {
    return { instructions: [] };
  }

  const userContent = [
    "Instructions to refine (one per line):",
    ...instructions.map((s, i) => `${i + 1}. ${s}`),
  ].join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      top_p: 1,
      max_tokens: 1500,
      messages: [
        { role: "system", content: REFINEMENT_SYSTEM },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return { instructions };

    const parsed = JSON.parse(cleanJson(content)) as { instructions?: unknown };
    const out = Array.isArray(parsed.instructions)
      ? (parsed.instructions as string[]).filter((s) => typeof s === "string" && s.trim() !== "")
      : instructions;
    return { instructions: out.length > 0 ? out : instructions };
  } catch (err) {
    console.error("[instructionRefinement] Failed:", err);
    return { instructions };
  }
}
