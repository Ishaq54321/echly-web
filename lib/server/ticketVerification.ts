/**
 * Stage 4 — Verification pass.
 * Validates each ticket against the original transcript and instructions.
 */

import type OpenAI from "openai";
import { echlyDebug } from "@/lib/utils/logger";
import { estimateCost } from "@/lib/ai/costEstimator";
import type { PipelineTicket } from "./pipelineStages";
import { VERIFICATION_SYSTEM } from "./prompts/verificationPrompt";

export interface VerificationResult {
  isAccurate: boolean;
  isActionable: boolean;
  hasVerificationGap: boolean;
  confidence: number;
}

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

function parseOneVerificationResult(r: unknown): VerificationResult {
  if (!r || typeof r !== "object") return conservativeVerification();
  const o = r as Record<string, unknown>;
  return {
    isAccurate: Boolean(o.isAccurate),
    isActionable: Boolean(o.isActionable),
    hasVerificationGap: Boolean(o.hasVerificationGap),
    confidence: clamp(o.confidence),
  };
}

function parseBatchVerification(content: string, ticketCount: number): VerificationResult[] {
  const parsed = JSON.parse(cleanJson(content)) as { results?: unknown[] };
  const results = Array.isArray(parsed.results) ? parsed.results : [];
  const verificationResults: VerificationResult[] = [];
  for (let i = 0; i < ticketCount; i++) {
    verificationResults.push(parseOneVerificationResult(results[i]));
  }
  return verificationResults;
}

export interface VerifyTicketsBatchResult {
  results: VerificationResult[];
  cost: number;
}

/**
 * Verifies all tickets in one request against the original transcript and instructions.
 * Returns one VerificationResult per ticket, in the same order as tickets. Retries once on failure.
 */
export async function verifyTicketsBatch(
  client: OpenAI,
  originalTranscript: string,
  instructions: string[],
  tickets: PipelineTicket[],
  options?: { retryOnce?: boolean }
): Promise<VerifyTicketsBatchResult> {
  if (instructions.length === 0 || tickets.length === 0) {
    return { results: [], cost: 0 };
  }

  const retryOnce = options?.retryOnce ?? true;
  const transcriptSlice = originalTranscript.trim().slice(0, 1500);
  const userPayload = {
    transcript: transcriptSlice,
    instructions,
    tickets: tickets.map((t, i) => ({
      id: i + 1,
      title: t.title,
      actions: t.actionSteps,
    })),
  };
  const userContent = JSON.stringify(userPayload, null, 0);

  const runBatch = async (): Promise<{ results: VerificationResult[]; cost: number }> => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      top_p: 1,
      max_tokens: Math.max(500, tickets.length * 150),
      messages: [
        { role: "system", content: VERIFICATION_SYSTEM },
        { role: "user", content: userContent },
      ],
    });

    const usage = completion.usage;
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const cost = estimateCost("gpt-4o-mini", promptTokens, completionTokens);
    console.log("[AI COST]", {
      stage: "verification",
      model: "gpt-4o-mini",
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return { results: tickets.map(() => conservativeVerification()), cost };
    try {
      const results = parseBatchVerification(content, tickets.length);
      return { results, cost };
    } catch {
      return { results: tickets.map(() => conservativeVerification()), cost };
    }
  };

  try {
    const { results, cost } = await runBatch();
    echlyDebug("VERIFICATION RESULTS", results);
    return { results, cost };
  } catch (err) {
    console.error("[ticketVerification] Batch failed", err);
    if (retryOnce) {
      try {
        const { results, cost } = await runBatch();
        echlyDebug("VERIFICATION RESULTS", results);
        return { results, cost };
      } catch (retryErr) {
        console.error("[ticketVerification] Retry failed", retryErr);
        return { results: tickets.map(() => conservativeVerification()), cost: 0 };
      }
    }
    return { results: tickets.map(() => conservativeVerification()), cost: 0 };
  }
}

function conservativeVerification(): VerificationResult {
  return {
    isAccurate: false,
    isActionable: false,
    hasVerificationGap: true,
    confidence: 0.5,
  };
}

/**
 * Returns verification results as-is. No overrides.
 * A ticket is valid iff: isAccurate === true && isActionable === true && hasVerificationGap === false.
 */
export function applyVerifierFinalDecision(
  rawVerifications: VerificationResult[]
): VerificationResult[] {
  echlyDebug("VERIFIER FINAL DECISION", rawVerifications);
  return rawVerifications;
}
