/**
 * Stage 1 — Instruction Segmentation.
 * Splits long feedback into atomic, actionable instructions.
 * Detects vague feedback and signals needsClarification.
 * Uses visibleText/DOM context when available. Model: gpt-4o for reliability.
 */

import type OpenAI from "openai";
import { echlyDebug } from "@/lib/utils/logger";
import {
  getElementsForPrompt,
  getTextContextForPrompt,
  type PipelineContext,
} from "./pipelineContext";

/** Truly vague: no inferable UI element or action. Only these trigger clarification when no intent signals exist. */
const VAGUE_PATTERNS = [
  /\b(this looks?|that looks?)\s+(weird|bad|off|wrong)\s*\.?\s*$/i,
  /\bmake (this|it) better\s*\.?\s*$/i,
  /\bfix (this|it)\s*\.?\s*$/i,
  /\bimprove (this|it)\s*\.?\s*$/i,
  /\bsomething('s)? wrong\s*\.?\s*$/i,
  /\b(just )?fix (it|things)\s*\.?\s*$/i,
  /\bthis is wrong\s*\.?\s*$/i,
  /\bmake it better\s*\.?\s*$/i,
];

/** UX diagnosis language: strong intent signals. Problem statements we convert to actions. Do NOT treat as vague. */
const UX_DIAGNOSTIC_PHRASES = [
  "dense",
  "cramped",
  "crowded",
  "busy",
  "cluttered",
  "hard to read",
  "confusing",
  "too small",
  "too large",
  "too long",
  "too much",
  "huge",
  "really long",
  "feels long",
  "feels cluttered",
  "doing too much",
  "tighten",
  "shrink",
];
const UX_DIAGNOSTIC_INDICATORS = [
  new RegExp(
    `\\b(${UX_DIAGNOSTIC_PHRASES.join("|").replace(/\s+/g, "\\s+")})\\b`,
    "i"
  ),
  /\b(the|this|that)\s+\w+(\s+\w+){0,4}\s+(feel|feels|is|are|looks?)\s+(dense|cramped|crowded|busy|hard to read|confusing|too small|too large|cluttered|too long|huge)\b/i,
];

/** Observation patterns: "when someone", "when a user", "when switching" — indicate conditional UX feedback, not uncertainty. */
const OBSERVATION_PATTERNS = [
  /\bwhen (someone|a user|users|switching|they)\b/i,
  /\bif (a user|the user|someone)\b/i,
  /\b(still shows?|still appears?|still display)\b/i,
];

/** Suggestion language: conversational, not unclear intent. Do NOT trigger clarification for these. */
const SUGGESTION_PATTERNS = [
  /\bmaybe\b/i,
  /\bprobably\b/i,
  /\bshould\b/i,
  /\bcould\b/i,
  /\bmight\b/i,
  /\bkind of\b/i,
  /\bsort of\b/i,
  /\ba bit\b/i,
  /\bsomething like\b/i,
  /\bfeels like\b/i,
  /\bfeel like\b/i,
];

/** Recognizable UI vocabulary: element names that signal a target. */
const UI_VOCABULARY = [
  "hero",
  "headline",
  "footer",
  "form",
  "field",
  "button",
  "nav",
  "navigation",
  "section",
  "card",
  "testimonial",
  "image",
  "cta",
  "account",
  "signup",
  "login",
  "phone",
  "company",
  "business",
  "personal",
  "pricing",
  "dashboard",
  "modal",
  "menu",
  "link",
  "label",
  "input",
  "checkbox",
  "select",
  "dropdown",
];

const TASK_VERBS = [
  "change",
  "replace",
  "rename",
  "merge",
  "split",
  "increase",
  "decrease",
  "add",
  "remove",
  "move",
  "update",
];

/** Phrases at the start of feedback that apply to all instructions (global context). Longest first for regex matching. */
const GLOBAL_CONTEXT_PHRASES = [
  "in the signup form",
  "in the contact form",
  "in the navigation bar",
  "on the homepage",
  "on mobile",
  "on desktop",
  "on tablet",
] as const;

/** Matches a leading global context phrase (case-insensitive); capture group 1 is the phrase. */
const LEADING_CONTEXT_REGEX = new RegExp(
  `^\\s*(${GLOBAL_CONTEXT_PHRASES.map((p) => p.replace(/\s+/g, "\\s+")).join("|")})(\\s+|,|\\.)`,
  "i"
);

/**
 * If the transcript starts with a global context phrase (e.g. "On mobile", "In the signup form"),
 * returns the canonical phrase from GLOBAL_CONTEXT_PHRASES; otherwise null.
 */
function getLeadingGlobalContext(transcript: string): string | null {
  const match = transcript.trim().match(LEADING_CONTEXT_REGEX);
  if (!match) return null;
  const normalized = match[1].toLowerCase().replace(/\s+/g, " ");
  return GLOBAL_CONTEXT_PHRASES.find((p) => p === normalized) ?? null;
}

/** Intent clarity confidence: 0–100. If ≥ 40, do NOT trigger clarification. */
const INTENT_CONFIDENCE_THRESHOLD = 40;
const SCORE_UI_ELEMENT = 30;
const SCORE_UX_DIAGNOSIS = 30;
const SCORE_SUGGESTION = 10;
const SCORE_UI_VOCAB = 20;

function computeIntentConfidenceScore(transcript: string): number {
  const t = transcript.trim().toLowerCase();
  if (t.length < 3) return 0;
  let score = 0;
  if (UX_DIAGNOSTIC_INDICATORS.some((re) => re.test(transcript))) score += SCORE_UX_DIAGNOSIS;
  if (OBSERVATION_PATTERNS.some((re) => re.test(transcript))) score += SCORE_UI_ELEMENT; // observation implies a UI context
  if (SUGGESTION_PATTERNS.some((re) => re.test(transcript))) score += SCORE_SUGGESTION;
  const hasUiVocab = UI_VOCABULARY.some((word) => {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return re.test(transcript);
  });
  if (hasUiVocab) score += SCORE_UI_VOCAB;
  return Math.min(100, score);
}

/**
 * Appends the global context phrase to any instruction that doesn't already contain it.
 */
function propagateContextToInstructions(
  instructions: string[],
  contextPhrase: string
): string[] {
  const lower = contextPhrase.toLowerCase();
  return instructions.map((inst) => {
    const trimmed = inst.trim();
    if (trimmed.toLowerCase().includes(lower)) return trimmed;
    return `${trimmed} ${contextPhrase}`;
  });
}

const SYSTEM_PROMPT = `You are Echly's Instruction Segmenter. You translate natural product feedback into developer-ready instructions. You behave like a product manager: evaluate INTENT CLARITY, not instruction syntax. Be consistent and deterministic (same feedback → same interpretation).

——— CORE PRINCIPLE ———

CLARITY = INTENT CLARITY, NOT INSTRUCTION SYNTAX.
A request is clear if you can reasonably infer: (1) a UI target element, and (2) at least one actionable improvement — even when the user never uses command verbs. Proceed with instruction extraction; do NOT set needsClarification for conversational or descriptive feedback that has clear intent.

——— INTENT SIGNAL DETECTION ———

Treat the following as strong intent signals (do NOT trigger clarification when these appear with identifiable UI elements):

• UX diagnosis language: dense, crowded, busy, cramped, confusing, hard to read, too large, too small, too long, huge, too much, tighten, shrink, cluttered.
• Observation patterns: "when someone", "when a user", "if a user", "when switching", "still shows", "still appears" — these indicate conditional UX feedback.
• Suggestion language: maybe, probably, should, could, might, kind of, sort of, a bit, feels like — these indicate feedback, NOT ambiguity. Do NOT set needsClarification because of them.

——— PROBLEM → ACTION INFERENCE ———

When the user describes a UX problem, infer the improvement. Examples:

• "The hero image is huge and the headline is long." → Actions: Reduce hero image size. Shorten hero headline.
• "The footer feels dense." → Action: Increase spacing between footer sections.
• "When business account is selected the phone number field still appears." → Actions: Hide personal phone field when Business Account selected. Show company name field for Business Account.

——— MULTI-SENTENCE FEEDBACK ———

Treat the entire transcript as a SINGLE reasoning context. Extract actions across the whole statement before evaluating clarity. Do not treat individual sentences as separate unclear fragments.

Example: "The hero section is doing too much right now. The image is huge and the headline is really long." → One context; output: (1) Reduce hero image size, (2) Shorten hero headline.

——— RULES ———

1. INTERPRET UX DIAGNOSTIC LANGUAGE. Convert problem descriptions into actionable instructions. Do NOT trigger clarification.
2. INTERPRET INTENT, NOT LITERAL PHRASING. Infer the intended change from problems, thoughts, or suggestions.
3. DO NOT HALLUCINATE IMPLEMENTATION DETAILS. Only include implementation details when the user explicitly states them.
4. DO NOT HALLUCINATE CONTENT FROM OCR OR PAGE TEXT. Use visible text only to identify WHICH element; never copy page text into instructions as requested content.
5. PRESERVE MULTIPLE SUGGESTED ACTIONS. When the user proposes multiple improvements, output separate instructions. Do NOT collapse into one.
6. MERGE ONLY when the user offers alternative phrasings of the SAME single intent.
7. PRESERVE THE USER'S ORIGINAL MEANING. Do not rewrite intent into a different change.
8. ACCEPT CONVERSATIONAL LANGUAGE. "Maybe", "probably", "should", "could", "might", "kind of", "feels like" indicate natural speech, NOT unclear feedback. Never set needsClarification based on these words alone.
9. CLARITY THRESHOLD — Set needsClarification true ONLY when ALL of the following are true: (1) No UI element can be inferred, (2) No UX problem can be inferred, (3) No improvement action can be derived. Examples that REQUIRE clarification: "Fix this.", "This is wrong.", "Make it better." Examples that must NOT trigger clarification: "The hero section is doing too much… the image is huge and the headline is long.", "When someone switches to business the form still shows the personal phone field."
10. ACTION STEP QUALITY. Instructions must be clear, developer-actionable, and specific to a UI element.
11. AVOID UNNECESSARY ASSUMPTIONS. If the user does not specify exact implementation details, leave the solution general.
12. DETERMINISTIC BEHAVIOR. Same feedback → same interpretation.

——— CONTEXT PROPAGATION ———
If the user's feedback starts with a global modifier, that modifier applies to ALL instructions. Propagate it to every instruction that doesn't explicitly override it.
- Global modifiers: "on mobile", "on desktop", "on tablet", "in the signup form", "in the contact form", "on the homepage", "in the navigation bar."
- Example: "On mobile the hero text is too large, reduce the headline size, move the CTA below the image." → Append "on mobile" to each instruction.

——— TASK BOUNDARIES ———
When the user clearly describes separate actions, split on conjunctions (and, also) or task verbs: change, replace, rename, merge, split, increase, decrease, add, remove, move, update. One instruction = one change. Do not merge two genuinely separate requests into one.

——— USE OF VISIBLE TEXT / ELEMENTS IN INPUT ———
Use visible text and UI elements only to resolve WHICH element the user means (e.g. "the headline" → hero headline; "the form" → signup form). Never copy page text into the instruction as the requested new content unless the user explicitly asked to use that text.

OUTPUT FORMAT (strict JSON, no markdown):
{
  "instructions": ["instruction 1", "instruction 2", ...],
  "needsClarification": false,
  "confidence": 0.9
}

EXAMPLES:

Input: "The footer feels really dense."
Output: { "instructions": ["Increase spacing between footer sections."], "needsClarification": false, "confidence": 0.9 }

Input: "The testimonials are hard to read."
Output: { "instructions": ["Improve readability of testimonial quotes."], "needsClarification": false, "confidence": 0.9 }

Input: "Maybe stack the links better or add more spacing."
Output: { "instructions": ["Stack navigation links vertically.", "Increase spacing between navigation links."], "needsClarification": false, "confidence": 0.9 }

Input: "Maybe make the middle pricing card bigger or highlight it somehow."
Output: { "instructions": ["Make the middle pricing card stand out visually."], "needsClarification": false, "confidence": 0.9 }

Input: "Increase spacing between testimonials and make the author names stand out."
Output: { "instructions": ["Increase spacing between testimonial quotes.", "Make testimonial author names more prominent."], "needsClarification": false, "confidence": 0.95 }

Input: "The headline could be shorter."
Output: { "instructions": ["Shorten the hero headline."], "needsClarification": false, "confidence": 0.9 }

Input: "Fix this."
Output: { "instructions": [], "needsClarification": true, "confidence": 0 }

Input: "This section feels crowded."
Output: { "instructions": ["Increase spacing between elements in this section."], "needsClarification": false, "confidence": 0.9 }

Input: "On mobile reduce the headline size and add more spacing between sections."
Output: { "instructions": ["Reduce the hero headline size on mobile.", "Increase spacing between sections on mobile."], "needsClarification": false, "confidence": 0.95 }

Input: "The hero section is doing too much right now… the image is huge and the headline is really long. Maybe shrink the image a bit and tighten the headline."
Output: { "instructions": ["Reduce hero image size.", "Shorten hero headline."], "needsClarification": false, "confidence": 0.9 }

Input: "When someone switches the account type to business the form still shows the personal phone number field which is confusing."
Output: { "instructions": ["Hide personal phone field when Business Account selected.", "Display company name field for Business Account."], "needsClarification": false, "confidence": 0.9 }

Input: "Fix this."
Output: { "instructions": [], "needsClarification": true, "confidence": 0 }`;

export interface SegmentInstructionsResult {
  instructions: string[];
  needsClarification: boolean;
  confidence: number;
  /** Intent clarity score 0–100 from signal detection. If ≥ 40, do not treat as vague. */
  intentConfidenceScore?: number;
}

/** Intent clarity: treat as vague ONLY when no UI element, no UX problem, and no improvement can be inferred. */
function isVagueTranscript(transcript: string): boolean {
  const t = transcript.trim();
  if (t.length < 3) return true;
  if (computeIntentConfidenceScore(transcript) >= INTENT_CONFIDENCE_THRESHOLD) return false;
  return VAGUE_PATTERNS.some((re) => re.test(t));
}

function buildUserMessage(transcript: string, ctx: PipelineContext | null): string {
  const lines: string[] = ['Transcript:', `"${transcript}"`];
  const textContext = getTextContextForPrompt(ctx);
  if (textContext) {
    lines.push(
      "",
      "Visible text from page (use ONLY to identify which element the user means, e.g. which headline or section; do NOT copy this text into instructions as the requested content):",
      textContext
    );
  }
  const elements = getElementsForPrompt(ctx ?? undefined);
  if (elements.length > 0) {
    lines.push(
      "",
      "Known UI elements (prefer these to match targets):",
      JSON.stringify(elements.slice(0, 80), null, 0).slice(0, 2000)
    );
  }
  return lines.join("\n");
}

/**
 * Splits transcript into atomic instructions.
 * Uses gpt-4o for reliability. Returns needsClarification when feedback is vague or empty.
 * Optional retry: if first call returns empty instructions and !needsClarification, retries once.
 */
export async function segmentInstructions(
  client: OpenAI,
  transcript: string,
  context: PipelineContext | null = null,
  options?: { retryOnce?: boolean }
): Promise<SegmentInstructionsResult> {
  const trimmed = transcript && typeof transcript === "string" ? transcript.trim() : "";
  const retryOnce = options?.retryOnce ?? true;

  if (!trimmed) {
    return { instructions: [], needsClarification: true, confidence: 0, intentConfidenceScore: 0 };
  }

  if (isVagueTranscript(trimmed)) {
    return { instructions: [], needsClarification: true, confidence: 0, intentConfidenceScore: computeIntentConfidenceScore(trimmed) };
  }

  const run = async (): Promise<SegmentInstructionsResult> => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      top_p: 1,
      max_tokens: 1200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(trimmed, context) },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return { instructions: [], needsClarification: false, confidence: 0.5, intentConfidenceScore: computeIntentConfidenceScore(trimmed) };

    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned) as {
      instructions?: unknown;
      needsClarification?: unknown;
      confidence?: unknown;
    };

    let instructions = Array.isArray(parsed.instructions)
      ? (parsed.instructions as string[]).filter((s) => typeof s === "string" && s.trim() !== "")
      : [];
    let needsClarification = Boolean(parsed.needsClarification);
    const confidence =
      typeof parsed.confidence === "number" && !Number.isNaN(parsed.confidence)
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.8;

    const intentScore = computeIntentConfidenceScore(trimmed);
    if (instructions.length === 0 && !needsClarification) {
      return { instructions: [], needsClarification: true, confidence, intentConfidenceScore: intentScore };
    }
    if (instructions.length > 0 && needsClarification && intentScore >= INTENT_CONFIDENCE_THRESHOLD) {
      needsClarification = false;
    }

    const leadingContext = getLeadingGlobalContext(trimmed);
    if (leadingContext) {
      instructions = propagateContextToInstructions(instructions, leadingContext);
    }

    return { instructions, needsClarification, confidence, intentConfidenceScore: intentScore };
  };

  try {
    let result = await run();
    if (retryOnce && result.instructions.length === 0 && !result.needsClarification) {
      result = await run();
    }
    echlyDebug("SEGMENTATION RESULT", result.instructions);
    echlyDebug("SEGMENTATION NEEDS CLARIFICATION", result.needsClarification);
    return result;
  } catch (err) {
    console.error("[instructionSegmentation] Failed:", err);
    return { instructions: [], needsClarification: true, confidence: 0, intentConfidenceScore: 0 };
  }
}
