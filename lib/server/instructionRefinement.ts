/**
 * Stage: Instruction Refinement (after segmentation).
 * Detects instructions that still contain multiple actions and splits them
 * so each instruction represents exactly one developer action.
 */

import type OpenAI from "openai";
import { echlyDebug } from "@/lib/utils/logger";
import { estimateCost } from "@/lib/ai/costEstimator";
import {
  isValidExtractionIntent,
  type ExtractedInstruction,
} from "@/lib/server/instructionExtraction";
import { STRUCTURED_REFINEMENT_SYSTEM } from "./prompts/refinementPrompt";

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

export interface RefinementResult {
  instructions: ExtractedInstruction[];
  cost: number;
}

/**
 * Refines structured instructions by splitting compound instructions into
 * one instruction per developer action. Preserves structure (intent, entity, action, confidence).
 * Returns the same list if parsing fails (defensive).
 */
export async function refineStructuredInstructions(
  client: OpenAI,
  instructions: ExtractedInstruction[]
): Promise<RefinementResult> {
  if (instructions.length === 0) {
    return { instructions: [], cost: 0 };
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

    const usage = completion.usage;
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const cost = estimateCost("gpt-4o-mini", promptTokens, completionTokens);
    console.log("[AI COST]", {
      stage: "refinement",
      model: "gpt-4o-mini",
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      echlyDebug("STRUCTURED REFINEMENT OUTPUT", instructions);
      return { instructions, cost };
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
    return { instructions: out, cost };
  } catch (err) {
    console.error("[instructionRefinement] Structured refinement failed:", err);
    echlyDebug("STRUCTURED REFINEMENT OUTPUT", instructions);
    return { instructions, cost: 0 };
  }
}
