/**
 * Transcript cleanup stage — runs before instruction segmentation.
 * Corrects obvious speech-to-text mistakes and simple grammar without changing intent.
 */

import type OpenAI from "openai";

const NORMALIZATION_SYSTEM = `You are Echly's transcript normalizer. Your only job is to fix speech-to-text and grammar errors in user feedback. Preserve the user's exact intent. Output nothing but the normalized sentence(s).

RULES:
1. Correct obvious speech-to-text mistakes (e.g. "sign of form" → "signup form", "buisness" → "business").
2. Fix simple grammar: subject-verb agreement, articles (a/an/the), commas where they belong.
3. Preserve the user's original intent. Do NOT add new instructions, interpretations, or requirements.
4. Do NOT paraphrase beyond what is needed to fix errors. Keep the same structure and ideas.
5. Output a single normalized transcript string. No explanations, no markdown, no JSON.

GOOD:
- "When a user select business account" → "When a user selects Business Account"
- "in the sign of form" → "in the signup form"
- "show company name field hide personal phone field" → "show the Company Name field and hide the Personal Phone Number field"

BAD:
- Do not add new steps the user did not say.
- Do not change meaning (e.g. "show X" must stay "show X", not "consider showing X").
- Do not output bullet points or multiple sentences if the input was one run-on; merge into one clear sentence or a few sentences.`;

function cleanOutput(content: string): string {
  return content
    .replace(/^```\w*\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

/**
 * Normalizes a speech-to-text transcript: corrects obvious STT mistakes and simple grammar.
 * Preserves intent. Returns the normalized string, or the original on failure/empty.
 */
export async function normalizeTranscript(
  client: OpenAI,
  transcript: string,
  options?: { retryOnce?: boolean }
): Promise<string> {
  const trimmed = typeof transcript === "string" ? transcript.trim() : "";
  if (!trimmed) return trimmed;

  const retryOnce = options?.retryOnce ?? true;

  const run = async (): Promise<string> => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 500,
      messages: [
        { role: "system", content: NORMALIZATION_SYSTEM },
        { role: "user", content: `Normalize this transcript:\n\n"${trimmed}"` },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return trimmed;

    const normalized = cleanOutput(content).trim();
    return normalized.length > 0 ? normalized : trimmed;
  };

  try {
    return await run();
  } catch (err) {
    console.error("[transcriptNormalization] Failed:", err);
    if (retryOnce) {
      try {
        return await run();
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
}
