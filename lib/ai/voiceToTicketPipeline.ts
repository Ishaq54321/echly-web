/**
 * Minimal voice → ticket pipeline: one transcript, one interpreter model call, one ticket.
 * The AI refines what the recorder said into a clean ticket — no prescription, no invention.
 */

import type OpenAI from "openai";
import { truncateForTokenBudget } from "@/lib/ai/pipelineTokenBudget";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/interpreterPrompt";
import type { PipelineContext } from "@/lib/server/pipelineContext";
import { whitelistTags, ALL_TAG_KEYS } from "@/lib/constants/ticketTags";
import { parsePageInfo } from "@/lib/utils/urlParsing";
import { logger } from "@/lib/logger";

/** Interpreter model — shared with the verify harness so both always test the same thing. */
export const INTERPRETER_MODEL = "gpt-5.4-nano";

/* ===== DOM CONTEXT & TYPES ===== */

/** DOM context sent to the AI. Limited to <1000 tokens total. */
export interface DomContextForAI {
  elementHTML: string | null;
  semanticType?: "button" | "link" | "input" | "heading" | "paragraph" | "image" | "icon" | "card" | "section" | null;
  pageURL: string;
  pageName: string;
  siteName: string;
  pageArea: string;
  /** document.title — page-level grounding. */
  pageTitle?: string;
  /** First visible h1 text — page-level grounding. */
  pageH1?: string;
  /** Tag name of the clicked element (lowercase), e.g. "button", "div". */
  elementTag?: string;
  /** Ancestor breadcrumb, outermost first, e.g. 'main > section "Plans" > div'. */
  ancestorTrail?: string;
  /** Up to 2 named siblings of the clicked element. */
  siblingsList?: string;
  /** Best human-readable name for the clicked element (aria-label/alt/title/placeholder/innerText). */
  semanticIdentifier?: string;
  /** Computed styles (color, background, font-size, padding, size) for the clicked element. */
  computedStyles?: string;
  /** Structured list of meaningful direct children of the clicked element (tag, name, brief styles). */
  childrenList?: string;
  /** ARIA state of the clicked element (checked, expanded, selected, pressed, current). */
  elementState?: string;
  /** "disabled" if element has disabled or aria-disabled, otherwise empty. */
  disabledState?: string;
  /** Modal/dialog/popover context when element is inside one. */
  modalContext?: string;
  /** Current value of the input element (with privacy filtering). */
  inputValue?: string;
  /** Human-readable viewport line, e.g. "1280×720 @2x (scrolled 1400px down)". */
  viewport?: string;
}

/** Max tokens for combined DOM context (element subtree + page identification). */
const DOM_CONTEXT_MAX_TOKENS = 1000;
const CHARS_PER_TOKEN = 4;

/** Raw JSON shape returned by the LLM. */
export interface StructuredFeedbackJSON {
  title?: string;
  description?: string;
  pageArea?: string;
  tags?: string[];
}

/** Normalized ticket for API response. */
export interface VoiceTicket {
  title: string;
  description: string;
  pageArea: string;
  tags: string[];
}

/** Format viewport/scroll/DPR into one human-readable line. Empty string when unknown. */
function formatViewport(ctx: PipelineContext): string {
  const w = ctx.viewportWidth;
  const h = ctx.viewportHeight;
  if (typeof w !== "number" || typeof h !== "number" || w <= 0 || h <= 0) return "";
  let out = `${Math.round(w)}×${Math.round(h)}`;
  const dpr = ctx.devicePixelRatio;
  if (typeof dpr === "number" && dpr > 0 && dpr !== 1) {
    out += ` @${Math.round(dpr * 100) / 100}x`;
  }
  const scrollY = ctx.scrollY;
  if (typeof scrollY === "number" && Math.round(scrollY) > 0) {
    out += ` (scrolled ${Math.round(scrollY)}px down)`;
  }
  return out;
}

function buildDomContextFromPipelineContext(ctx: PipelineContext | null): DomContextForAI {
  if (!ctx) {
    return {
      elementHTML: null,
      semanticType: null,
      pageURL: "",
      pageName: "",
      siteName: "",
      pageArea: "",
      pageTitle: "",
      pageH1: "",
      elementTag: "",
      ancestorTrail: "",
      siblingsList: "",
      semanticIdentifier: "",
      computedStyles: "",
      childrenList: "",
      elementState: "",
      disabledState: "",
      modalContext: "",
      inputValue: "",
      viewport: "",
    };
  }
  const rawUrl = (typeof ctx.url === "string" ? ctx.url : "").split("#")[0];
  const pageInfo = parsePageInfo(rawUrl);
  const semanticType = ctx.semanticType ?? null;
  const subtreeText = ctx.subtreeText ?? null;
  const elementHTML = subtreeText ?? null;
  const semanticIdentifier = ctx.semanticIdentifier ?? "";
  const computedStyles = ctx.computedStyles ?? "";
  const childrenList = typeof ctx.childrenList === "string" ? ctx.childrenList : "";
  const elementState = typeof ctx.elementState === "string" ? ctx.elementState : "";
  const disabledState = typeof ctx.disabledState === "string" ? ctx.disabledState : "";
  const modalContext = typeof ctx.modalContext === "string" ? ctx.modalContext : "";
  const inputValue = typeof ctx.inputValue === "string" ? ctx.inputValue : "";
  return {
    elementHTML,
    semanticType,
    pageURL: pageInfo.sanitizedUrl,
    pageName: pageInfo.pageName,
    siteName: pageInfo.siteName,
    pageArea: pageInfo.pageArea,
    pageTitle: typeof ctx.pageTitle === "string" ? ctx.pageTitle : "",
    pageH1: typeof ctx.pageH1 === "string" ? ctx.pageH1 : "",
    elementTag: typeof ctx.elementTag === "string" ? ctx.elementTag : "",
    ancestorTrail: typeof ctx.ancestorTrail === "string" ? ctx.ancestorTrail : "",
    siblingsList: typeof ctx.siblingsList === "string" ? ctx.siblingsList : "",
    semanticIdentifier,
    computedStyles,
    childrenList,
    elementState,
    disabledState,
    modalContext,
    inputValue,
    viewport: formatViewport(ctx),
  };
}

/**
 * Truncate DOM context so total size is under DOM_CONTEXT_MAX_TOKENS (1000 tokens).
 * Fixed overhead is kept as-is; remaining budget goes to elementHTML (Ring 1 subtree text).
 */
function truncateDomContextToBudget(ctx: DomContextForAI): DomContextForAI {
  const maxChars = DOM_CONTEXT_MAX_TOKENS * CHARS_PER_TOKEN;
  const fixedChars =
    (ctx.pageURL?.length ?? 0) +
    (ctx.pageName?.length ?? 0) +
    (ctx.siteName?.length ?? 0) +
    (ctx.pageArea?.length ?? 0) +
    (ctx.pageTitle?.length ?? 0) +
    (ctx.pageH1?.length ?? 0) +
    (ctx.elementTag?.length ?? 0) +
    (ctx.ancestorTrail?.length ?? 0) +
    (ctx.siblingsList?.length ?? 0) +
    (ctx.semanticIdentifier?.length ?? 0) +
    (ctx.computedStyles?.length ?? 0) +
    (ctx.childrenList?.length ?? 0) +
    (ctx.elementState?.length ?? 0) +
    (ctx.disabledState?.length ?? 0) +
    (ctx.modalContext?.length ?? 0) +
    (ctx.inputValue?.length ?? 0) +
    (ctx.viewport?.length ?? 0);
  const remaining = Math.max(0, maxChars - fixedChars);

  return {
    elementHTML:
      ctx.elementHTML && remaining > 0
        ? truncateForTokenBudget(ctx.elementHTML, remaining)
        : null,
    semanticType: ctx.semanticType ?? null,
    pageURL: ctx.pageURL,
    pageName: ctx.pageName,
    siteName: ctx.siteName,
    pageArea: ctx.pageArea,
    pageTitle: ctx.pageTitle ?? "",
    pageH1: ctx.pageH1 ?? "",
    elementTag: ctx.elementTag ?? "",
    ancestorTrail: ctx.ancestorTrail ?? "",
    siblingsList: ctx.siblingsList ?? "",
    semanticIdentifier: ctx.semanticIdentifier ?? "",
    computedStyles: ctx.computedStyles ?? "",
    childrenList: ctx.childrenList ?? "",
    elementState: ctx.elementState ?? "",
    disabledState: ctx.disabledState ?? "",
    modalContext: ctx.modalContext ?? "",
    inputValue: ctx.inputValue ?? "",
    viewport: ctx.viewport ?? "",
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
    viewportWidth: typeof o.viewportWidth === "number" ? o.viewportWidth : undefined,
    viewportHeight: typeof o.viewportHeight === "number" ? o.viewportHeight : undefined,
    scrollX: typeof o.scrollX === "number" ? o.scrollX : undefined,
    scrollY: typeof o.scrollY === "number" ? o.scrollY : undefined,
    devicePixelRatio: typeof o.devicePixelRatio === "number" ? o.devicePixelRatio : undefined,
    pageTitle: typeof o.pageTitle === "string" ? o.pageTitle : null,
    pageH1: typeof o.pageH1 === "string" ? o.pageH1 : null,
    elementTag: typeof o.elementTag === "string" ? o.elementTag : null,
    ancestorTrail: typeof o.ancestorTrail === "string" ? o.ancestorTrail : null,
    siblingsList: typeof o.siblingsList === "string" ? o.siblingsList : null,
    subtreeText: o.subtreeText != null && typeof o.subtreeText === "string" ? o.subtreeText : null,
    semanticType:
      o.semanticType != null && typeof o.semanticType === "string"
        ? (o.semanticType as PipelineContext["semanticType"])
        : null,
    semanticIdentifier:
      o.semanticIdentifier != null && typeof o.semanticIdentifier === "string"
        ? o.semanticIdentifier
        : null,
    computedStyles:
      o.computedStyles != null && typeof o.computedStyles === "string"
        ? o.computedStyles
        : null,
    childrenList:
      o.childrenList != null && typeof o.childrenList === "string"
        ? o.childrenList
        : null,
    elementState: typeof o.elementState === "string" ? o.elementState : undefined,
    disabledState: typeof o.disabledState === "string" ? o.disabledState : undefined,
    modalContext: typeof o.modalContext === "string" ? o.modalContext : undefined,
    inputValue: typeof o.inputValue === "string" ? o.inputValue : undefined,
  };
}

function dedupeLines(text: string | null): string | null {
  if (!text) return text;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return [...new Set(lines)].join("\n");
}

export function buildUserMessage(
  transcript: string,
  domContext: DomContextForAI,
): string {
  const parts: string[] = [];

  parts.push("USER INTENT (SOURCE OF TRUTH):");
  parts.push(transcript.trim());

  parts.push("\nPAGE URL:");
  parts.push(domContext.pageURL || "Unknown");

  parts.push("\nPAGE NAME (use this for [Page Name] bracket prefix in title):");
  parts.push(
    domContext.pageName ||
      "(none — omit the bracket prefix from the title entirely)"
  );

  parts.push("\nSITE NAME:");
  parts.push(domContext.siteName || "Unknown");

  parts.push("\nPAGE AREA (use this verbatim for the pageArea JSON field):");
  parts.push(domContext.pageArea || "(unknown — use empty string for pageArea)");

  if (domContext.pageTitle || domContext.pageH1) {
    parts.push("\nPAGE HEADER (for page-level grounding when feedback is about the page, not the selected element):");
    const header: string[] = [];
    if (domContext.pageTitle) header.push(`Title: "${domContext.pageTitle}"`);
    if (domContext.pageH1) header.push(`H1: "${domContext.pageH1}"`);
    parts.push(header.join(" | "));
  }

  if (domContext.viewport) {
    parts.push("\nVIEWPORT:");
    parts.push(domContext.viewport);
  }

  parts.push("\nREFERENCE CONTEXT — use it to identify what element or area the recorder is referring to, and to ground current values (colors, sizes, text) when the recorder references them. Never quote DOM text the recorder didn't reference, and never pad the description with properties they didn't mention:");

  parts.push(
    domContext.elementTag
      ? `Selected element <${domContext.elementTag}>:`
      : "Selected element:"
  );
  parts.push(domContext.elementHTML || "None");

  parts.push("\nElement name (semantic identifier):");
  parts.push(domContext.semanticIdentifier || "None");

  parts.push("\nElement computed styles:");
  parts.push(domContext.computedStyles || "None");

  parts.push("\nChildren of clicked element (for disambiguation when recorder mentions specific children):");
  parts.push(domContext.childrenList || "None (clicked element has no meaningful children)");

  if (domContext.ancestorTrail) {
    parts.push("\nLocated inside (ancestors, outermost first):");
    parts.push(domContext.ancestorTrail);
  }

  if (domContext.siblingsList) {
    parts.push("\nNamed siblings (next to the clicked element):");
    parts.push(domContext.siblingsList);
  }

  if (domContext.semanticType) {
    parts.push("\nSemantic type:");
    parts.push(domContext.semanticType);
    parts.push("(This is what the recorder clicked — use type-specific rules from the prompt to interpret feedback.)");
  }

  if (domContext.elementState) {
    parts.push("\nElement state:");
    parts.push(domContext.elementState);
  }

  if (domContext.disabledState) {
    parts.push("\nElement is:");
    parts.push(domContext.disabledState);
  }

  if (domContext.modalContext) {
    parts.push("\nElement is inside:");
    parts.push(domContext.modalContext);
  }

  if (domContext.inputValue) {
    parts.push("\nInput field current value:");
    parts.push(`"${domContext.inputValue}"`);
  }

  return parts.join("\n");
}

/* ===== EXTRACTION & PARSING ===== */

/** JSON schema for strict extraction output. Enforced via response_format. */
export const FEEDBACK_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    pageArea: { type: "string" },
    tags: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: { type: "string", enum: ALL_TAG_KEYS },
    },
  },
  required: ["title", "description", "pageArea", "tags"],
} as const;

/** Fallback when parsing fails or the model returned no description. */
function fallbackStructuredFeedback(transcript: string): StructuredFeedbackJSON {
  const cleaned = transcript.trim().replace(/\s+/g, " ");
  return {
    title: "",
    description: cleaned || "Feedback recorded but could not be processed.",
    pageArea: "",
    tags: ["feedback"],
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
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const description = typeof o.description === "string" ? o.description.trim() : "";
    const pageArea = typeof o.pageArea === "string" ? o.pageArea.trim() : "";
    const tagsRaw = Array.isArray(o.tags) ? o.tags : [];
    const tags = whitelistTags(tagsRaw);
    if (!description) return null;
    return { title, description, pageArea, tags };
  } catch {
    return null;
  }
}

/** Truncate page area to max 40 chars; fall back to deterministic value when AI returns empty/placeholder. */
function sanitizePageArea(pageArea: string | undefined, fallback: string): string {
  if (!pageArea) return fallback;
  const trimmed = pageArea.trim();
  if (!trimmed || trimmed.toLowerCase() === "unknown") return fallback;
  return trimmed.slice(0, 40);
}

/** Sanitize AI-generated title: max 100 characters. */
function sanitizeTitle(title: string): string {
  if (!title) return "";
  const trimmed = title.trim();
  return trimmed.slice(0, 100);
}

/** Sanitize AI-generated description: max 2000 characters. */
function sanitizeDescription(description: string): string {
  if (!description) return "";
  return description.trim().slice(0, 2000);
}

/* ===== GPT CALLS ===== */

/**
 * Output-token ceiling for the interpreter call. With a strict JSON schema, a
 * length-truncated response fails parsing and degrades the ticket to the raw
 * transcript — long, detailed voice notes need real headroom here.
 */
const INTERPRETER_MAX_OUTPUT_TOKENS = 1200;

/** Appended to the user message when retrying after an output-length truncation. */
const RETRY_CONCISE_INSTRUCTION =
  "IMPORTANT: Your previous attempt exceeded the output length limit and was cut off. " +
  "Produce a more concise ticket — shorter description, fewer and tighter bullets — " +
  "while still covering every distinct issue the recorder raised.";

/**
 * Single interpreter call: transcript + domContext → structured JSON.
 * Uses response_format json_schema so output is always valid JSON matching the schema.
 * If the model hits the output-token ceiling, retries once with a be-more-concise
 * instruction. On parse failure or missing description, returns fallback
 * (transcript as description) — logged so degradation is never silent.
 */
export async function extractStructuredFeedback(
  client: OpenAI,
  transcript: string,
  domContext: DomContextForAI
): Promise<{ json: StructuredFeedbackJSON; raw: string }> {
  logger.debug("ai", "processing_started", {
    hasElement: !!domContext.elementHTML,
    elementLength: domContext.elementHTML?.length || 0,
  });
  const userMessage = buildUserMessage(transcript, domContext);

  const callModel = (extraInstruction?: string) => {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: extraInstruction
          ? `${userMessage}\n\n${extraInstruction}`
          : userMessage,
      },
    ];
    return client.chat.completions.create({
      model: INTERPRETER_MODEL,
      temperature: 0.0, // Deterministic output for reliable Ring 1 reliance
      max_completion_tokens: INTERPRETER_MAX_OUTPUT_TOKENS,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "feedback_ticket",
          schema: FEEDBACK_JSON_SCHEMA as Record<string, unknown>,
          strict: true,
        },
      },
      messages,
    });
  };

  let completion = await callModel();
  let choice = completion.choices[0];
  if (choice?.finish_reason === "length") {
    logger.warn("ai", "interpreter_output_truncated", {
      transcriptChars: transcript.length,
      retrying: true,
    });
    completion = await callModel(RETRY_CONCISE_INSTRUCTION);
    choice = completion.choices[0];
    if (choice?.finish_reason === "length") {
      logger.error("ai", "interpreter_output_truncated_after_retry", {
        transcriptChars: transcript.length,
      });
    }
  }

  const raw = choice?.message?.content?.trim() ?? "";
  const json = parseStructuredResponse(raw);
  if (!json || !json.description) {
    logger.error("ai", "interpreter_fallback_raw_transcript", {
      finishReason: choice?.finish_reason ?? "unknown",
      rawChars: raw.length,
      transcriptChars: transcript.length,
    });
    return { json: fallbackStructuredFeedback(transcript), raw };
  }
  logger.debug("ai", "processing_success", {
    descriptionLength: json.description.length,
    tags: json.tags,
  });
  return { json, raw };
}

/* ===== PUBLIC API ===== */

/**
 * Run the minimal pipeline: transcript + context → one ticket.
 * One transcript → one ticket with title, description, pageArea, tags.
 */
export async function runVoiceToTicket(
  client: OpenAI,
  transcript: string,
  rawContext: unknown
): Promise<{ success: boolean; ticket: VoiceTicket }> {
  if (!transcript || !transcript.trim()) {
    return {
      success: true,
      ticket: { title: "", description: "", pageArea: "", tags: [] },
    };
  }

  const domContext = buildDomContextForPipeline(rawContext);
  const elementText = dedupeLines(domContext?.elementHTML || null);

  const aiContext: DomContextForAI = {
    ...domContext,
    elementHTML: elementText && elementText.length > 0 ? elementText : null,
  };
  const { json } = await extractStructuredFeedback(
    client,
    transcript,
    aiContext
  );

  const title = sanitizeTitle(json.title ?? "");
  const description = sanitizeDescription(json.description ?? "");
  const pageArea = sanitizePageArea(json.pageArea, domContext.pageArea);
  const tags = whitelistTags(json.tags);

  const ticket: VoiceTicket = {
    title: title || "Untitled feedback",
    description,
    pageArea,
    tags: tags.length > 0 ? tags : ["feedback"],
  };
  return { success: true, ticket };
}
