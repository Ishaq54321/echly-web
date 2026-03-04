/**
 * Stage 4 — Verification pass.
 * Validates the single merged ticket against the original transcript and all instructions.
 */

import type OpenAI from "openai";
import { echlyDebug } from "@/lib/utils/logger";
import type { PipelineTicket } from "./pipelineStages";

export interface VerificationResult {
  isAccurate: boolean;
  isActionable: boolean;
  needsClarification: boolean;
  confidence: number;
}

const VERIFICATION_SYSTEM = `You are Echly's Ticket Verifier. You validate ONE ticket (Title, Description, ActionSteps) against the original transcript and instructions under the unified interpretation policy for messy human feedback.

CHECK:
1. Does the ticket reflect ALL instructions? Every instruction should be clearly represented in an action step. Nothing missing.
2. Are the action steps implementable (Rule 9)? Each step should be clear, developer-actionable, and specific to a UI element. Product-level requirements are acceptable: "Increase spacing between footer sections", "Improve readability of testimonial quotes", "Simplify the hero section" are actionable. Do NOT treat general wording as vague when it matches the user's intent.
3. Was anything hallucinated (Rule 4)? The ticket must not add content the user did not say or imply: no invented UI text, no copying page/OCR text as the requested change (e.g. "shorten the headline" → step must be "Shorten the hero headline", NOT "Change headline to [page text]"). General product phrasing that preserves intent is NOT hallucination.

CLARITY (Rule 8): Set needsClarification true ONLY when the ticket is wrong, hallucinated, or misses an instruction. Do NOT set true for:
- UX diagnostic feedback correctly interpreted (e.g. user said "footer feels dense" → ticket says "Increase spacing between footer sections").
- Problem-statement-style instructions that were inferred into actionable steps.
- General but correct wording (e.g. "Improve dashboard readability").
- Conversational language in the transcript (e.g. "maybe", "probably", "kind of", "feels like", "should", "might"). These are normal human feedback, not ambiguity.

VERIFICATION RESULT:
- isAccurate: true if the ticket correctly reflects all instructions and preserves user meaning.
- isActionable: true if a developer could implement every step.
- needsClarification: true only if the ticket invents details, drops an instruction, or distorts intent.
- confidence: 0–1.

OUTPUT: Return ONLY valid JSON. No markdown.
{
  "verification": {
    "isAccurate": true,
    "isActionable": true,
    "needsClarification": false,
    "confidence": 0.9
  }
}
Return exactly one "verification" object (not "verifications" array).`;

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

/**
 * Verifies the single merged ticket against the original transcript and all instructions.
 * Returns one VerificationResult for the entire ticket. Retries once on failure.
 */
export async function verifyTicketsBatch(
  client: OpenAI,
  originalTranscript: string,
  instructions: string[],
  tickets: PipelineTicket[],
  options?: { retryOnce?: boolean }
): Promise<VerificationResult[]> {
  if (instructions.length === 0 || tickets.length === 0) {
    return [];
  }

  const ticket = tickets[0];
  const retryOnce = options?.retryOnce ?? true;

  const userContent = [
    "Original transcript (full feedback):",
    `"${originalTranscript.trim().slice(0, 1500)}"`,
    "",
    "Instructions (all should be reflected in the ticket):",
    ...instructions.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Ticket to verify (single merged ticket):",
    `Title: ${ticket.title}`,
    `Description: ${ticket.description}`,
    `Action steps: ${JSON.stringify(ticket.actionSteps)}`,
  ].join("\n\n");

  const run = async (): Promise<VerificationResult[]> => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      top_p: 1,
      max_tokens: 1500,
      messages: [
        { role: "system", content: VERIFICATION_SYSTEM },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return [conservativeVerification()];

    const parsed = JSON.parse(cleanJson(content)) as { verification?: unknown };
    const v = parsed.verification;
    if (!v || typeof v !== "object") return [conservativeVerification()];
    const r = v as Record<string, unknown>;
    const result: VerificationResult = {
      isAccurate: Boolean(r.isAccurate),
      isActionable: Boolean(r.isActionable),
      needsClarification: Boolean(r.needsClarification),
      confidence: clamp(r.confidence),
    };
    return [result];
  };

  try {
    const verifications = await run();
    echlyDebug("VERIFICATION RESULTS (single ticket)", verifications);
    return verifications;
  } catch (err) {
    console.error("[ticketVerification] Failed:", err);
    if (retryOnce) {
      try {
        const verifications = await run();
        echlyDebug("VERIFICATION RESULTS (single ticket)", verifications);
        return verifications;
      } catch (retryErr) {
        console.error("[ticketVerification] Retry failed:", retryErr);
        return [conservativeVerification()];
      }
    }
    return [conservativeVerification()];
  }
}

function conservativeVerification(): VerificationResult {
  return {
    isAccurate: false,
    isActionable: false,
    needsClarification: true,
    confidence: 0.5,
  };
}

/** Action verbs that must never be marked non-actionable. */
const ALWAYS_ACTIONABLE_VERBS = /\b(reduce|increase|move|change|rename|hide|show|add|remove)\b/i;

/**
 * Applies the verification layer rules so valid instructions do not incorrectly trigger clarification.
 * - If instructionCount > 0: force isActionable=true, isAccurate=true, needsClarification=false.
 * - If segmentationNeedsClarification === false: verification cannot set needsClarification=true.
 * - If any instruction contains action verbs (reduce, increase, move, etc.): force isActionable=true.
 */
export function applyVerifierFinalDecision(
  rawVerifications: VerificationResult[],
  options: {
    instructionCount: number;
    instructions: string[];
    transcript: string;
    segmentationNeedsClarification: boolean;
  }
): VerificationResult[] {
  const { instructionCount, instructions, transcript, segmentationNeedsClarification } = options;

  const hasActionVerbInInstructions = instructions.some((inst) => ALWAYS_ACTIONABLE_VERBS.test(inst));
  const hasInstructionCount = instructionCount > 0;

  const result = rawVerifications.map((v) => {
    let isActionable = v.isActionable;
    let isAccurate = v.isAccurate;
    let needsClarification = v.needsClarification;

    if (hasInstructionCount) {
      isActionable = true;
      isAccurate = true;
      needsClarification = false;
    } else {
      if (hasActionVerbInInstructions) isActionable = true;
      if (!segmentationNeedsClarification) needsClarification = false;
    }

    return {
      ...v,
      isActionable,
      isAccurate,
      needsClarification,
    };
  });

  echlyDebug("VERIFIER FINAL DECISION", {
    instructionCount,
    isActionable: result[0]?.isActionable,
    isAccurate: result[0]?.isAccurate,
    needsClarification: result[0]?.needsClarification,
  });
  return result;
}
