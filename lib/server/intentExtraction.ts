/**
 * Intent Extraction Layer — Stage 1 of Echly's multi-stage AI pipeline.
 * Analyzes voice feedback to produce a structured intent object before ticket generation.
 */

import OpenAI from "openai";

/** Allowed values for intentType. */
export const INTENT_TYPES = [
  "color_change",
  "text_change",
  "layout_adjustment",
  "spacing_issue",
  "visibility_issue",
  "content_edit",
  "bug_report",
  "accessibility_issue",
  "general_improvement",
] as const;

/** Allowed values for changeCategory. */
export const CHANGE_CATEGORIES = [
  "UI",
  "Content",
  "UX",
  "Bug",
  "Accessibility",
] as const;

export type IntentType = (typeof INTENT_TYPES)[number];
export type ChangeCategory = (typeof CHANGE_CATEGORIES)[number];

export interface IntentExtractionInput {
  transcript: string;
  visibleText?: string | null;
  url?: string | null;
}

export interface IntentExtractionResult {
  intentType: IntentType;
  targetElement: string | null;
  changeCategory: ChangeCategory;
  problemSummary: string;
  confidence: number;
}

const SYSTEM_PROMPT = `You are Echly's Intent Extractor. Your job is to analyze user feedback and output a structured intent object. Focus on accuracy over creativity. Use conservative interpretation when unsure.

INPUT YOU WILL RECEIVE:
- transcript: the user's spoken feedback
- visibleText: OCR text from the page screenshot (use only to resolve which UI element they mean)
- url: the page URL (for context only)

RULES:
1. Infer the most likely UI element from the transcript and visibleText. If the user says "the button", match to a likely button label from visibleText when possible (e.g. "Start Free Trial", "Contact Us"). If no clear match, use a short descriptive label (e.g. "primary CTA button").
2. Prefer conservative interpretation. When unclear, use intentType "general_improvement" and lower confidence.
3. If the transcript is vague or could mean multiple things, set intentType to "general_improvement" and confidence below 0.7.
4. confidence must be a number between 0 and 1.
5. problemSummary: one short phrase capturing the problem or requested change (e.g. "button color blends into background"). Do not invent details not in the transcript.

INTENT TYPES (use exactly one):
color_change, text_change, layout_adjustment, spacing_issue, visibility_issue, content_edit, bug_report, accessibility_issue, general_improvement

CHANGE CATEGORIES (use exactly one):
UI, Content, UX, Bug, Accessibility

OUTPUT: Return ONLY valid JSON in this exact shape. No markdown, no code fences, no explanation.
{
  "intentType": "string",
  "targetElement": "string or null",
  "changeCategory": "string",
  "problemSummary": "string",
  "confidence": number
}`;

function buildUserMessage(input: IntentExtractionInput): string {
  const lines: string[] = [
    "transcript:",
    input.transcript.trim() || "(empty)",
    "",
    "visibleText:",
    (input.visibleText && input.visibleText.trim()) || "(none)",
    "",
    "url:",
    input.url && input.url.trim() ? input.url.trim() : "(none)",
  ];
  return lines.join("\n");
}

function clampConfidence(n: unknown): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function parseIntentResult(raw: unknown): IntentExtractionResult {
  const fallback: IntentExtractionResult = {
    intentType: "general_improvement",
    targetElement: null,
    changeCategory: "UX",
    problemSummary: "Unclear or unintelligible feedback",
    confidence: 0.5,
  };

  if (!raw || typeof raw !== "object") return fallback;

  const o = raw as Record<string, unknown>;
  const intentType = typeof o.intentType === "string" && INTENT_TYPES.includes(o.intentType as IntentType)
    ? (o.intentType as IntentType)
    : "general_improvement";
  const changeCategory = typeof o.changeCategory === "string" && CHANGE_CATEGORIES.includes(o.changeCategory as ChangeCategory)
    ? (o.changeCategory as ChangeCategory)
    : "UX";
  const targetElement =
    o.targetElement == null
      ? null
      : typeof o.targetElement === "string" && o.targetElement.trim() !== ""
        ? o.targetElement.trim()
        : null;
  const problemSummary =
    typeof o.problemSummary === "string" && o.problemSummary.trim() !== ""
      ? String(o.problemSummary).trim().slice(0, 300)
      : fallback.problemSummary;

  return {
    intentType,
    targetElement: targetElement ?? null,
    changeCategory,
    problemSummary,
    confidence: clampConfidence(o.confidence),
  };
}

/**
 * Extracts a structured intent from voice feedback. Uses the transcript as the
 * primary source of truth; visibleText and url are used to resolve the target
 * UI element and context. Returns a conservative default when the transcript
 * is empty or the model response cannot be parsed.
 *
 * @param input - transcript (required), visibleText and url (optional)
 * @returns Intent object with intentType, targetElement, changeCategory, problemSummary, confidence
 */
export async function extractIntent(
  input: IntentExtractionInput
): Promise<IntentExtractionResult> {
  const { transcript } = input;
  const trimmed = transcript && typeof transcript === "string" ? transcript.trim() : "";

  if (!trimmed) {
    return {
      intentType: "general_improvement",
      targetElement: null,
      changeCategory: "UX",
      problemSummary: "Empty or missing transcript",
      confidence: 0,
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[intentExtraction] OPENAI_API_KEY not set; returning fallback intent");
    return {
      intentType: "general_improvement",
      targetElement: null,
      changeCategory: "UX",
      problemSummary: trimmed.slice(0, 200),
      confidence: 0.5,
    };
  }

  const client = new OpenAI({ apiKey });
  const userContent = buildUserMessage({
    transcript: trimmed,
    visibleText: input.visibleText ?? null,
    url: input.url ?? null,
  });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 300,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return parseIntentResult(null);

    let parsed: unknown;
    const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.warn("[intentExtraction] Failed to parse model JSON:", content.slice(0, 200));
      return {
        intentType: "general_improvement",
        targetElement: null,
        changeCategory: "UX",
        problemSummary: trimmed.slice(0, 200),
        confidence: 0.5,
      };
    }

    return parseIntentResult(parsed);
  } catch (err) {
    console.error("[intentExtraction] OpenAI request failed:", err);
    return {
      intentType: "general_improvement",
      targetElement: null,
      changeCategory: "UX",
      problemSummary: trimmed.slice(0, 200),
      confidence: 0.5,
    };
  }
}
