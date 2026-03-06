/**
 * Minimal voice → ticket pipeline: one transcript, one GPT-4o-mini call, one ticket.
 * No instruction graph, no refinement, no verification (except optional low-confidence review).
 */

import type OpenAI from "openai";
import { truncateForTokenBudget } from "@/lib/ai/pipelineTokenBudget";
import type { PipelineContext } from "@/lib/server/pipelineContext";

/** DOM context sent to the AI. Limited to <1000 tokens total. */
export interface DomContextForAI {
  elementHTML: string | null;
  nearbyText: string | null;
  visibleText: string | null;
  domPath: string | null;
  pageURL: string;
}

/** Max tokens for combined DOM context (element + nearby + visible + path). */
const DOM_CONTEXT_MAX_TOKENS = 1000;
const CHARS_PER_TOKEN = 4;

/** One action from the LLM. */
export interface ExtractedAction {
  step: number;
  description: string;
  entity: string;
  confidence: number;
}

/** Raw JSON shape returned by the LLM. */
export interface StructuredFeedbackJSON {
  actions: ExtractedAction[];
  confidence: number;
  notes: string;
}

/** Normalized ticket for API response. */
export interface VoiceTicket {
  title: string;
  actionSteps: string[];
  confidence: number;
  notes?: string;
}

/**
 * Interpreter prompt for the structure-feedback AI stage.
 * The AI acts as a strict speech-to-structured-task interpreter: it must ONLY structure, polish,
 * clarify, and organize what the user actually said — never invent or guess content.
 */
const SYSTEM_PROMPT = `You are a strict speech-to-structured-task interpreter. You convert spoken product feedback into structured developer actions. You must ONLY structure, polish, clarify, and organize what the user actually said. You must NEVER generate new content that the user did not say.

RULE 1 — NO CONTENT GENERATION
- You must NEVER generate new content, marketing copy, or sentences that were not spoken by the user.
- You must ONLY: structure, polish, clarify, organize what the user actually said.
- You must NOT: invent text, headlines, descriptions, names, file references, or URLs.
- If the user did not speak the exact content, you must not create it.

RULE 2 — HANDLE EXTERNAL REFERENCES SAFELY
- If the user references something outside the screenshot (documents, Figma files, shared folders, other websites, previous designs), keep the instruction referential. Do NOT invent the referenced content.
- Example: "Match the headline with the one from the other website" → "Update the headline to match the messaging used on the other website." Do NOT invent the headline.

RULE 3 — HANDLE VAGUE OR INCOMPLETE INSTRUCTIONS
- If the user instruction is vague, incomplete, or lacks specific details, do NOT guess missing information. Create a generic instruction reflecting the user's intent.
- Example: "Make this section better" → "Improve the design or functionality of this section." NOT "Increase spacing and improve typography."

RULE 4 — SPLIT CLEAR MULTI-STEP INSTRUCTIONS
- If the user clearly describes multiple actions, separate them into multiple action steps (one action per step).

RULE 5 — PRESERVE UNCERTAINTY
- If the user speaks with uncertainty ("maybe", "around", "something like"), preserve that uncertainty instead of converting it into an exact requirement.
- Example: "Maybe make the image around 20% bigger" → "Increase the image size by approximately 20%."

RULE 6 — IGNORE SPEECH FRAGMENTS
- If a transcript fragment contains only filler speech ("or something like that", "you know", "kind of", "maybe", "yeah") and does not contain a meaningful instruction, do not create a new action. Return empty actions or a single generic note if nothing substantive was said.

TRANSCRIPT NORMALIZATION RULES
Speech recognition artifacts may appear in transcripts.
Example: "this wholesalection feels a little cramped"
Correct output: "Increase the spacing between the cards in this section"

1. If a word appears to be a malformed or merged speech-to-text artifact (for example "wholesalection", "kindaarea", etc.) rewrite the phrase into clear natural English.
2. Prefer neutral phrases such as: "this section", "this area", "this card group".
3. Do NOT invent section names unless they appear in visibleText or nearbyText.
4. Maintain the user's intent but normalize spelling and grammar.
5. Remove obvious transcription artifacts that do not exist in normal English.

Additional:
- The transcript is the source of truth. DOM context is only used to correct UI element names (e.g. button labels, section names visible on the page).
- Extract ALL actions mentioned in the transcript. Each action must be a single clear developer instruction.
- Do NOT create actions not mentioned in the transcript.

Return JSON only.`;

function buildDomContextFromPipelineContext(ctx: PipelineContext | null): DomContextForAI {
  if (!ctx) {
    return { elementHTML: null, nearbyText: null, visibleText: null, domPath: null, pageURL: "" };
  }
  const url = typeof ctx.url === "string" ? ctx.url : "";
  const domPath = ctx.domPath ?? null;
  const nearbyText = ctx.nearbyText ?? null;
  const visibleText = ctx.visibleText ?? ctx.screenshotOCRText ?? null;
  const subtreeText = ctx.subtreeText ?? null;
  const elementHTML = subtreeText ?? null;
  return {
    elementHTML,
    nearbyText,
    visibleText,
    domPath,
    pageURL: url,
  };
}

/**
 * Truncate DOM context so total size is under DOM_CONTEXT_MAX_TOKENS (1000 tokens).
 * Uses truncateForTokenBudget on elementHTML, nearbyText, visibleText before building the prompt.
 * domPath and pageURL are kept as-is (small).
 */
function truncateDomContextToBudget(ctx: DomContextForAI): DomContextForAI {
  const maxChars = DOM_CONTEXT_MAX_TOKENS * CHARS_PER_TOKEN;
  const fixedChars = (ctx.pageURL?.length ?? 0) + (ctx.domPath?.length ?? 0);
  let remaining = maxChars - fixedChars;
  if (remaining <= 0) {
    return { ...ctx, elementHTML: null, nearbyText: null, visibleText: null };
  }
  const budgetElement = Math.floor(remaining * 0.4);
  const budgetNearby = Math.floor(remaining * 0.35);
  const budgetVisible = Math.floor(remaining * 0.25);

  return {
    elementHTML: ctx.elementHTML
      ? truncateForTokenBudget(ctx.elementHTML, budgetElement)
      : null,
    nearbyText: ctx.nearbyText
      ? truncateForTokenBudget(ctx.nearbyText, budgetNearby)
      : null,
    visibleText: ctx.visibleText
      ? truncateForTokenBudget(ctx.visibleText, budgetVisible)
      : null,
    domPath: ctx.domPath,
    pageURL: ctx.pageURL,
  };
}

/**
 * Build DOM context for the AI from raw request context.
 * Limits total DOM tokens to <1000.
 */
export function buildDomContextForPipeline(rawContext: unknown): DomContextForAI {
  const ctx = normalizeRawContext(rawContext);
  const domContext = buildDomContextFromPipelineContext(ctx);
  return truncateDomContextToBudget(domContext);
}

function normalizeRawContext(raw: unknown): PipelineContext | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    url: typeof o.url === "string" ? o.url : undefined,
    domPath: o.domPath != null && typeof o.domPath === "string" ? o.domPath : null,
    nearbyText:
      Array.isArray(o.nearbyText) && o.nearbyText.length > 0
        ? (o.nearbyText as unknown[]).filter((x): x is string => typeof x === "string").join("\n")
        : o.nearbyText != null && typeof o.nearbyText === "string"
          ? o.nearbyText
          : null,
    visibleText: o.visibleText != null && typeof o.visibleText === "string" ? o.visibleText : null,
    screenshotOCRText: o.screenshotOCRText != null && typeof o.screenshotOCRText === "string" ? o.screenshotOCRText : null,
    subtreeText: o.subtreeText != null && typeof o.subtreeText === "string" ? o.subtreeText : null,
  };
}

function buildUserMessage(transcript: string, domContext: DomContextForAI): string {
  const parts: string[] = [`Transcript:\n${transcript.trim()}`];
  parts.push("\nContext (use only to correct UI names):");
  if (domContext.pageURL) parts.push(`Page URL: ${domContext.pageURL}`);
  if (domContext.domPath) parts.push(`DOM path: ${domContext.domPath}`);
  if (domContext.elementHTML) parts.push(`Selected element text:\n${domContext.elementHTML}`);
  if (domContext.nearbyText) parts.push(`Nearby text:\n${domContext.nearbyText}`);
  if (domContext.visibleText) parts.push(`Visible text:\n${domContext.visibleText}`);
  return parts.join("\n");
}

/** JSON schema for strict extraction output. Enforced via response_format. */
const FEEDBACK_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          step: { type: "number" },
          description: { type: "string" },
          entity: { type: "string" },
          confidence: { type: "number" },
        },
        required: ["step", "description", "entity", "confidence"],
      },
    },
    confidence: { type: "number" },
    notes: { type: "string" },
  },
  required: ["actions", "confidence", "notes"],
} as const;

/** Fallback when parsing fails or actions array is missing. */
function fallbackStructuredFeedback(transcript: string): StructuredFeedbackJSON {
  return {
    actions: [
      {
        step: 1,
        description: transcript.trim() || "Update UI element",
        entity: "general",
        confidence: 0.5,
      },
    ],
    confidence: 0.5,
    notes: "Fallback action created due to parsing failure",
  };
}

function parseStructuredResponse(text: string): StructuredFeedbackJSON | null {
  const trimmed = text.trim();
  let jsonStr = trimmed;
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) jsonStr = codeBlock[1].trim();
  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (!Array.isArray(o.actions)) return null;
    const actions: ExtractedAction[] = [];
    for (const item of o.actions) {
      if (item && typeof item === "object" && "description" in item) {
        const a = item as Record<string, unknown>;
        actions.push({
          step: typeof a.step === "number" ? a.step : actions.length + 1,
          description: typeof a.description === "string" ? a.description : String(a.description ?? ""),
          entity: typeof a.entity === "string" ? a.entity : "",
          confidence: typeof a.confidence === "number" && a.confidence >= 0 && a.confidence <= 1 ? a.confidence : 0.8,
        });
      }
    }
    const confidence =
      typeof o.confidence === "number" && o.confidence >= 0 && o.confidence <= 1 ? o.confidence : 0.8;
    const notes = typeof o.notes === "string" ? o.notes : "";
    return { actions, confidence, notes };
  } catch {
    return null;
  }
}

/**
 * Deterministic ticket title from first action. No LLM call.
 */
function generateTicketTitle(actions: ExtractedAction[]): string {
  if (!actions || actions.length === 0) {
    return "Update UI element";
  }
  const first = actions[0].description?.trim() || "Update UI element";
  const normalized =
    first.charAt(0).toUpperCase() + first.slice(1);
  return normalized.slice(0, 60);
}

/**
 * Single GPT-4o-mini call: transcript + domContext → structured JSON.
 * Uses response_format json_schema so output is always valid JSON matching the schema.
 * On parse failure or missing actions, returns fallback (transcript as single action).
 */
export async function extractStructuredFeedback(
  client: OpenAI,
  transcript: string,
  domContext: DomContextForAI
): Promise<{ json: StructuredFeedbackJSON; raw: string }> {
  const userMessage = buildUserMessage(transcript, domContext);
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 300,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "feedback_actions",
        schema: FEEDBACK_JSON_SCHEMA as Record<string, unknown>,
        strict: true,
      },
    },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });
  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const json = parseStructuredResponse(raw);
  if (!json || !Array.isArray(json.actions) || json.actions.length === 0) {
    return { json: fallbackStructuredFeedback(transcript), raw };
  }
  return { json, raw };
}

/** Review pass: enforce strict interpreter rules — remove invented actions, do not add content the user did not say. */
const REVIEW_PROMPT = `Review the transcript and the list of actions. Apply strict interpreter rules: remove any actions that contain content the user did not say (no invented text, headlines, or descriptions). Add only actions that were clearly in the transcript. Fix wording to reflect the user's words only; do not invent or guess. Return the same JSON shape: {"actions":[{"step":1,"description":"...","entity":"...","confidence":0.9}],"confidence":0.9,"notes":"..."}. JSON only.`;

/**
 * Optional second pass when confidence < 0.85.
 */
export async function reviewStructuredFeedback(
  client: OpenAI,
  transcript: string,
  current: StructuredFeedbackJSON
): Promise<StructuredFeedbackJSON> {
  const actionsStr = JSON.stringify(current.actions);
  const userMessage = `Transcript:\n${transcript}\n\nCurrent actions:\n${actionsStr}\n\n${REVIEW_PROMPT}`;
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 300,
      messages: [{ role: "user", content: userMessage }],
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const parsed = parseStructuredResponse(raw);
    return parsed ?? current;
  } catch {
    return current;
  }
}

/**
 * Run the minimal pipeline: transcript + context → one ticket.
 * One transcript → one ticket. Multiple actions become actionSteps on that ticket; never multiple tickets.
 * Optionally runs a review pass when confidence < 0.85.
 */
export async function runVoiceToTicket(
  client: OpenAI,
  transcript: string,
  rawContext: unknown,
  options: { runReviewBelowConfidence?: number } = {}
): Promise<{
  success: boolean;
  ticket: VoiceTicket;
  needsClarification: boolean;
  clarityScore: number;
  clarityIssues: string[];
  suggestedRewrite: string | null;
}> {
  const runReviewThreshold = options.runReviewBelowConfidence ?? 0.85;

  if (!transcript || !transcript.trim()) {
    return {
      success: true,
      ticket: { title: "", actionSteps: [], confidence: 0 },
      needsClarification: true,
      clarityScore: 0,
      clarityIssues: ["No transcript provided."],
      suggestedRewrite: "Please provide your feedback in a few words.",
    };
  }

  const domContext = buildDomContextForPipeline(rawContext);
  const { json } = await extractStructuredFeedback(client, transcript, domContext);

  let finalJson = json;
  if (json.confidence < runReviewThreshold) {
    finalJson = await reviewStructuredFeedback(client, transcript, json);
  }

  const title = generateTicketTitle(finalJson.actions);
  const actionSteps = finalJson.actions
    .sort((a, b) => a.step - b.step)
    .map((a) => a.description.trim())
    .filter(Boolean);

  const ticket: VoiceTicket = {
    title,
    actionSteps,
    confidence: finalJson.confidence,
    notes: finalJson.notes || undefined,
  };

  const clarityScore = Math.round(finalJson.confidence * 100);
  const needsClarification = finalJson.confidence < 0.6;

  return {
    success: true,
    ticket,
    needsClarification,
    clarityScore,
    clarityIssues: needsClarification ? ["Low confidence; please rephrase if something was missed."] : [],
    suggestedRewrite: needsClarification ? "Please rephrase your feedback so we can create a clearer ticket." : null,
  };
}
