/**
 * Stage 1 — Instruction Segmentation.
 * Splits long feedback into atomic, actionable instructions.
 * Detects vague feedback and signals needsClarification.
 * Uses visibleText/DOM context when available. Model: gpt-4o for reliability.
 */

import type OpenAI from "openai";
import {
  getElementsForPrompt,
  getTextContextForPrompt,
  type PipelineContext,
} from "./pipelineContext";

const VAGUE_PATTERNS = [
  /\b(this looks?|that looks?)\s+(weird|bad|off|wrong)\b/i,
  /\bmake (this|it) better\b/i,
  /\bfix (this|it)\b/i,
  /\bimprove (this|it)\b/i,
  /\bsomething('s)? wrong\b/i,
  /\b(just )?fix (it|things)\b/i,
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

const SYSTEM_PROMPT = `You are Echly's Instruction Segmenter. Focus on UI modifications.

Your job: split user feedback into atomic, actionable instructions. One instruction = exactly one concrete change.

TASK BOUNDARY VERBS (start a new instruction when these appear): change, replace, rename, merge, split, increase, decrease, add, remove, move, update.

CONTEXT PROPAGATION (important):
If the user's feedback starts with a global modifier, that modifier applies to ALL instructions. Propagate it to every instruction that doesn't explicitly override it.
- Global modifiers: "on mobile", "on desktop", "on tablet", "in the signup form", "in the contact form", "on the homepage", "in the navigation bar".
- Example: "On mobile the hero text is too large, reduce the headline size, move the CTA below the image, and add more spacing between sections."
  → Every instruction should retain "on mobile": "Reduce the hero headline size on mobile", "Move the call-to-action button below the image on mobile", "Increase spacing between sections on mobile."
- If an instruction explicitly mentions a different context (e.g. "on desktop" when the modifier was "on mobile"), keep that override. Otherwise append the global context to each instruction.

STRICT RULES:
1. Each instruction must represent exactly one change. Never combine multiple UI changes into a single instruction.
2. Split instructions when conjunctions (and, also, commas) introduce new changes.
3. Detect task boundaries based on the key verbs above; each new verb-driven action is a separate instruction.
4. Preserve meaning but simplify wording (e.g. "change X to Y" → "Change the label 'X' to 'Y'").
5. If an instruction exceeds 20 words, check whether it contains multiple changes and split again.
6. Do NOT hallucinate. Only output instructions that are clearly stated or directly implied.
7. If the feedback is vague (e.g. "fix this", "make this better", "this looks weird") with no concrete change, output an empty array and set needsClarification to true.
8. If the transcript is empty or unintelligible, output empty array and needsClarification true.
9. Always return valid JSON. No markdown, no code fences.

OUTPUT FORMAT:
{
  "instructions": ["instruction 1", "instruction 2", ...],
  "needsClarification": false,
  "confidence": 0.9
}

Set needsClarification to true when:
- The user did not specify what to change.
- The feedback is purely subjective with no actionable request.
- The transcript is empty or unintelligible.

confidence: 0–1 for how confident you are that the segmentation is correct.

EXAMPLES:

Example 1:
Input: "Change hero image and increase button size"
Output:
{
  "instructions": ["Change the hero image", "Increase the button size"],
  "needsClarification": false,
  "confidence": 0.95
}

Example 2:
Input: "Rename Email to Business Email and Phone Number to Mobile Number"
Output:
{
  "instructions": ["Rename the Email field to Business Email", "Rename the Phone Number field to Mobile Number"],
  "needsClarification": false,
  "confidence": 0.95
}

Example 3 (context propagation):
Input: "On mobile the hero text is too large, reduce the headline size, move the call to action button below the image, and add more spacing between sections."
Output:
{
  "instructions": [
    "Reduce the hero headline size on mobile",
    "Move the call-to-action button below the image on mobile",
    "Increase spacing between sections on mobile"
  ],
  "needsClarification": false,
  "confidence": 0.95
}`;

export interface SegmentInstructionsResult {
  instructions: string[];
  needsClarification: boolean;
  confidence: number;
}

function isVagueTranscript(transcript: string): boolean {
  const t = transcript.trim().toLowerCase();
  if (t.length < 3) return true;
  return VAGUE_PATTERNS.some((re) => re.test(transcript));
}

function buildUserMessage(transcript: string, ctx: PipelineContext | null): string {
  const lines: string[] = ['Transcript:', `"${transcript}"`];
  const textContext = getTextContextForPrompt(ctx);
  if (textContext) {
    lines.push("", "Visible text from page (use to resolve labels and element names):", textContext);
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
    return { instructions: [], needsClarification: true, confidence: 0 };
  }

  if (isVagueTranscript(trimmed)) {
    return { instructions: [], needsClarification: true, confidence: 0 };
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
    if (!content) return { instructions: [], needsClarification: false, confidence: 0.5 };

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
    const needsClarification = Boolean(parsed.needsClarification);
    const confidence =
      typeof parsed.confidence === "number" && !Number.isNaN(parsed.confidence)
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.8;

    if (instructions.length === 0 && !needsClarification) {
      return { instructions: [], needsClarification: true, confidence };
    }

    const leadingContext = getLeadingGlobalContext(trimmed);
    if (leadingContext) {
      instructions = propagateContextToInstructions(instructions, leadingContext);
    }

    return { instructions, needsClarification, confidence };
  };

  try {
    let result = await run();
    if (retryOnce && result.instructions.length === 0 && !result.needsClarification) {
      result = await run();
    }
    console.log("ECHLY DEBUG — SEGMENTATION RESULT:", result.instructions);
    console.log("ECHLY DEBUG — SEGMENTATION NEEDS CLARIFICATION:", result.needsClarification);
    return result;
  } catch (err) {
    console.error("[instructionSegmentation] Failed:", err);
    return { instructions: [], needsClarification: true, confidence: 0 };
  }
}
