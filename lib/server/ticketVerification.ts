/**
 * Stage 4 — Verification pass.
 * Validates the single merged ticket against the original transcript and all instructions.
 */

import type OpenAI from "openai";
import type { PipelineTicket } from "./pipelineStages";

export interface VerificationResult {
  isAccurate: boolean;
  isActionable: boolean;
  needsClarification: boolean;
  confidence: number;
}

const VERIFICATION_SYSTEM = `You are Echly's Ticket Verifier. You receive ONE ticket that merges multiple instructions into a single ticket with multiple action steps. Validate the entire ticket.

Check:
1. Does the ticket reflect ALL instructions? Every instruction should appear as or be clearly represented in an action step. Nothing missing.
2. Are the action steps implementable? Each step should be concrete enough for a developer (target, property, expected change). No vague language.
3. Was anything hallucinated? The ticket must not add details the user did not say or clearly imply.

Return a single verification result:
- isAccurate: true only if the ticket correctly reflects all instructions (no wrong or invented details).
- isActionable: true only if a developer could implement every step without guessing.
- needsClarification: true if the ticket is wrong, vague, hallucinated, or misses an instruction. When in doubt, set true.
- confidence: 0–1 for your verification.

If any instruction was vague or the ticket invents details, set needsClarification true.

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
    console.log("ECHLY DEBUG — VERIFICATION RESULTS (single ticket):", verifications);
    return verifications;
  } catch (err) {
    console.error("[ticketVerification] Failed:", err);
    if (retryOnce) {
      try {
        const verifications = await run();
        console.log("ECHLY DEBUG — VERIFICATION RESULTS (single ticket):", verifications);
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
