/**
 * Minimal voice → ticket pipeline: one transcript, one GPT-4o-mini call, one ticket.
 * No instruction graph, no refinement, no verification.
 */

import type OpenAI from "openai";
import { truncateForTokenBudget } from "@/lib/ai/pipelineTokenBudget";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/interpreterPrompt";
import type { PipelineContext } from "@/lib/server/pipelineContext";
import { generateTicketTitle } from "@/lib/tickets/generateTicketTitle";

/* ===== DOM CONTEXT & TYPES ===== */

/** DOM context sent to the AI. Limited to <1000 tokens total. */
export interface DomContextForAI {
  elementHTML: string | null;
  elementType: string | null;
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
  instruction: string;
  entity: string;
}

/** Raw JSON shape returned by the LLM. */
export interface StructuredFeedbackJSON {
  title?: string;
  actions: ExtractedAction[];
}

/** Normalized ticket for API response. */
export interface VoiceTicket {
  title: string;
  actionSteps: string[];
}

function buildDomContextFromPipelineContext(ctx: PipelineContext | null): DomContextForAI {
  if (!ctx) {
    return { elementHTML: null, elementType: null, nearbyText: null, visibleText: null, domPath: null, pageURL: "" };
  }
  const url = typeof ctx.url === "string" ? ctx.url : "";
  const domPath = ctx.domPath ?? null;
  const elementType = ctx.elementType ?? null;
  const nearbyText = ctx.nearbyText ?? null;
  const visibleText = ctx.visibleText ?? ctx.screenshotOCRText ?? null;
  const subtreeText = ctx.subtreeText ?? null;
  const elementHTML = subtreeText ?? null;
  return {
    elementHTML,
    elementType,
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
  const remaining = maxChars - fixedChars;
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
    elementType: ctx.elementType ?? null,
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
    elementType: o.elementType != null && typeof o.elementType === "string" ? o.elementType : null,
  };
}

function dedupeLines(text: string | null): string | null {
  if (!text) return text;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return [...new Set(lines)].join("\n");
}

function cleanVisibleText(text: string | null): string | null {
  if (!text) return text;

  return text
    .replace(/[^\x20-\x7E\n]/g, " ")
    .replace(/\b[a-zA-Z]{1,2}\b/g, " ")
    .replace(/(.)\1{3,}/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function limitText(text: string | null, max = 1500): string | null {
  if (!text) return text;
  return text.slice(0, max);
}

function buildUserMessage(
  transcript: string,
  domContext: DomContextForAI,
  shouldUseOCR: boolean,
  ocrText: string | null
): string {
  const parts: string[] = [];

  parts.push("USER INTENT (SOURCE OF TRUTH):");
  parts.push(transcript.trim());

  parts.push("\nREFERENCE CONTEXT (DO NOT USE FOR DECISIONS):");

  parts.push("Selected element:");
  parts.push(domContext.elementHTML || "None");

  parts.push("\nElement type:");
  parts.push(domContext.elementType || "None");

  parts.push("\nNearby text:");
  parts.push(domContext.nearbyText || "None");

  parts.push("\nVisible text:");
  parts.push(domContext.visibleText || "None");

  if (shouldUseOCR) {
    parts.push("\nVISUAL TEXT (OCR - REFERENCE ONLY):");
    parts.push(ocrText || "None");
  }

  return parts.join("\n");
}

/* ===== EXTRACTION & PARSING ===== */

/** JSON schema for strict extraction output. Enforced via response_format. */
const FEEDBACK_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          step: { type: "number" },
          description: { type: "string" },
          entity: { type: "string" },
        },
        required: ["step", "description", "entity"],
      },
    },
  },
  required: ["title", "actions"],
} as const;

/** Fallback when parsing fails or actions array is missing. */
function fallbackStructuredFeedback(transcript: string): StructuredFeedbackJSON {
  return {
    actions: [
      {
        step: 1,
        instruction: transcript.trim() || "Update UI element",
        entity: "general",
      },
    ],
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
      if (item && typeof item === "object") {
        const a = item as Record<string, unknown>;
        const instruction =
          typeof a.description === "string"
            ? a.description
            : typeof a.instruction === "string"
              ? a.instruction
              : String(a.description ?? a.instruction ?? "");
        actions.push({
          step: typeof a.step === "number" ? a.step : actions.length + 1,
          instruction,
          entity: typeof a.entity === "string" ? a.entity : "",
        });
      }
    }
    const title = typeof o.title === "string" ? o.title.trim() : "";
    return { title, actions };
  } catch {
    return null;
  }
}

/** Sanitize AI-generated title: max 5 words, max 60 characters. */
function sanitizeTitle(title: string): string {
  if (!title) return "";
  const words = title.split(/\s+/).slice(0, 5);
  const cleaned = words.join(" ");
  return cleaned.slice(0, 60);
}

/* ===== GPT CALLS ===== */

/**
 * Single GPT-4o-mini call: transcript + domContext → structured JSON.
 * Uses response_format json_schema so output is always valid JSON matching the schema.
 * On parse failure or missing actions, returns fallback (transcript as single action).
 */
export async function extractStructuredFeedback(
  client: OpenAI,
  transcript: string,
  domContext: DomContextForAI,
  context?: { ocrText?: string | null; screenshotOCRText?: string | null } | null
): Promise<{ json: StructuredFeedbackJSON; raw: string }> {
  const ocrText =
    context?.ocrText ||
    context?.screenshotOCRText ||
    null;
  const shouldUseOCR =
    (!domContext.elementHTML || domContext.elementHTML.length < 10) &&
    !!ocrText &&
    ocrText.length > 20;
  console.log("[OCR_DECISION]", {
    hasElement: !!domContext.elementHTML,
    elementLength: domContext.elementHTML?.length || 0,
    ocrLength: ocrText?.length || 0,
    shouldUseOCR
  });
  console.log("[AI_PHASE2_INPUT]", {
    transcriptPreview: transcript.slice(0, 100),
    elementPreview: domContext.elementHTML?.slice(0, 100),
    elementType: domContext.elementType || null,
    nearbyPreview: domContext.nearbyText?.slice(0, 100),
    visiblePreview: domContext.visibleText?.slice(0, 100),
    ocrPreview: shouldUseOCR ? ocrText?.slice(0, 100) : null
  });
  const userMessage = buildUserMessage(transcript, domContext, shouldUseOCR, ocrText);
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];
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
    messages,
  });
  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const json = parseStructuredResponse(raw);
  console.log("[AI_PHASE2_OUTPUT]", {
    title: json?.title,
    actionsCount: json?.actions?.length,
    firstAction: json?.actions?.[0]?.instruction
  });
  if (!json || !Array.isArray(json.actions) || json.actions.length === 0) {
    return { json: fallbackStructuredFeedback(transcript), raw };
  }
  return { json, raw };
}

/* ===== PUBLIC API ===== */

/**
 * Run the minimal pipeline: transcript + context → one ticket.
 * One transcript → one ticket. Multiple actions become actionSteps on that ticket; never multiple tickets.
 */
export async function runVoiceToTicket(
  client: OpenAI,
  transcript: string,
  rawContext: unknown
): Promise<{
  success: boolean;
  ticket: VoiceTicket;
}> {
  if (!transcript || !transcript.trim()) {
    return {
      success: true,
      ticket: { title: "", actionSteps: [] },
    };
  }

  const domContext = buildDomContextForPipeline(rawContext);
  const rawCtx = rawContext != null && typeof rawContext === "object"
    ? (rawContext as Record<string, unknown>)
    : null;
  const normalizedInput = {
    transcript: transcript || "",
    elementText: domContext?.elementHTML || null,
    nearbyText: domContext?.nearbyText || null,
    visibleText: domContext?.visibleText || "",
    ocrText:
      (typeof rawCtx?.ocrText === "string" ? rawCtx.ocrText : null) ||
      (typeof rawCtx?.screenshotOCRText === "string" ? rawCtx.screenshotOCRText : null),
  };

  normalizedInput.elementText = dedupeLines(normalizedInput.elementText);
  normalizedInput.nearbyText = dedupeLines(normalizedInput.nearbyText);
  normalizedInput.visibleText = dedupeLines(normalizedInput.visibleText) ?? "";
  normalizedInput.visibleText = cleanVisibleText(normalizedInput.visibleText) ?? "";
  normalizedInput.visibleText = limitText(normalizedInput.visibleText, 1500) ?? "";
  normalizedInput.nearbyText = limitText(normalizedInput.nearbyText, 1500);

  if (!normalizedInput.elementText) {
    normalizedInput.elementText = null;
  }

  if (!normalizedInput.nearbyText) {
    normalizedInput.nearbyText = null;
  }

  if (!normalizedInput.ocrText) {
    normalizedInput.ocrText = null;
  }

  const aiContext: DomContextForAI = {
    ...domContext,
    elementHTML: normalizedInput.elementText,
    nearbyText: normalizedInput.nearbyText,
    visibleText: normalizedInput.visibleText || null,
  };
  const { json } = await extractStructuredFeedback(client, normalizedInput.transcript, aiContext, {
    ocrText: normalizedInput.ocrText,
    screenshotOCRText: typeof rawCtx?.screenshotOCRText === "string" ? rawCtx.screenshotOCRText : null,
  });

  const actionSteps = json.actions
    .sort((a, b) => a.step - b.step)
    .map((a) => a.instruction.trim())
    .filter(Boolean);

  const aiTitle =
    typeof json.title === "string"
      ? sanitizeTitle(json.title)
      : "";
  const title =
    aiTitle.length > 0
      ? aiTitle
      : generateTicketTitle(actionSteps);

  const ticket: VoiceTicket = {
    title,
    actionSteps,
  };

  return {
    success: true,
    ticket,
  };
}
