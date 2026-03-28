/**
 * AI-assisted ticket title synthesis.
 * Batch: single LLM call for all ticket titles. Fallback: actionSteps[0].slice(0, 60).
 */

import type OpenAI from "openai";
import { estimateCost } from "@/lib/ai/costEstimator";

const MAX_TITLE_LENGTH = 60;
const BATCH_MAX_TOKENS = 120;

/** Input shape for batch title generation (action steps per ticket). */
export interface TicketTitleInput {
  actionSteps: string[];
}

export interface TicketTitlesBatchResult {
  titles: string[];
  cost: number;
}

/**
 * Generate all ticket titles in a single LLM request.
 * Input: array of { actionSteps }. Output: array of title strings in same order.
 * On failure or missing title, fallback per ticket: actionSteps[0].slice(0, 60).
 */
export async function generateTicketTitlesBatch(
  client: OpenAI,
  tickets: TicketTitleInput[]
): Promise<TicketTitlesBatchResult> {
  if (tickets.length === 0) return { titles: [], cost: 0 };

  const inputJson = tickets.map((t) => ({ actions: t.actionSteps }));
  const systemContent = "You generate short engineering ticket titles.";
  const userContent = [
    "For each set of UI changes generate a concise ticket title (max 60 characters). Return JSON with a \"titles\" array of strings in the same order.",
    "",
    "Input JSON:",
    JSON.stringify(inputJson),
  ].join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: BATCH_MAX_TOKENS,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
    });

    const usage = completion.usage;
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const cost = estimateCost("gpt-4o-mini", promptTokens, completionTokens);

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    if (!cleaned) return { titles: fallbackTitles(tickets), cost };

    const parsed = JSON.parse(cleaned) as { titles?: unknown };
    const titles = Array.isArray(parsed.titles) ? parsed.titles : [];
    const result: string[] = [];
    for (let i = 0; i < tickets.length; i++) {
      const t = titles[i];
      const str = typeof t === "string" && t.trim() ? t.trim() : null;
      result.push(
        str != null && str.length > 0
          ? str.length <= MAX_TITLE_LENGTH
            ? str
            : str.slice(0, MAX_TITLE_LENGTH).trim()
          : fallbackTitle(tickets[i])
      );
    }
    return { titles: result, cost };
  } catch (err) {
    console.warn("[ticketTitle] Batch title failed, using fallbacks:", err);
    return { titles: fallbackTitles(tickets), cost: 0 };
  }
}

function fallbackTitle(ticket: TicketTitleInput): string {
  const first = ticket.actionSteps[0];
  if (first != null && first.length > 0) return first.slice(0, MAX_TITLE_LENGTH).trim();
  return "Requested UI changes";
}

function fallbackTitles(tickets: TicketTitleInput[]): string[] {
  return tickets.map(fallbackTitle);
}
