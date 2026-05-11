/**
 * Minimal voice → ticket pipeline: one transcript, one GPT-4o-mini call, one ticket.
 * The AI refines what the recorder said into a clean ticket — no prescription, no invention.
 */

import type OpenAI from "openai";
import { truncateForTokenBudget } from "@/lib/ai/pipelineTokenBudget";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/interpreterPrompt";
import type { PipelineContext } from "@/lib/server/pipelineContext";
import { whitelistTags, ALL_TAG_KEYS } from "@/lib/constants/ticketTags";
import { parsePageInfo } from "@/lib/utils/urlParsing";
import { logger } from "@/lib/logger";

/**
 * TEMPORARY DEBUG LOGGER — delete after testing.
 * Logs the exact DOM context and full user message sent to OpenAI
 * for every ticket. Helps debug AI behavior on real recordings.
 */
function logDomContextToAI(
  transcript: string,
  domContext: DomContextForAI,
  finalUserMessage: string
): void {
  const sep = "═".repeat(80);
  const subSep = "─".repeat(80);

  console.log("\n");
  console.log(sep);
  console.log("  AI INPUT DEBUG — exact data sent to the model");
  console.log(sep);

  console.log("\n📝 TRANSCRIPT:");
  console.log(`   "${transcript.trim()}"`);
  console.log(`   [${transcript.trim().length} chars]`);

  console.log(`\n${subSep}`);
  console.log("🌐 PAGE IDENTIFICATION (deterministic from URL parsing):");
  console.log(subSep);
  console.log(`   pageURL:  "${domContext.pageURL}"`);
  console.log(`   pageName: "${domContext.pageName}"`);
  console.log(`   siteName: "${domContext.siteName}"`);
  console.log(`   pageArea: "${domContext.pageArea}"`);

  console.log(`\n${subSep}`);
  console.log("🎯 RING 1 — SELECTED ELEMENT");
  console.log(subSep);

  console.log("\n   ► Selected element text (subtree):");
  const elText = domContext.elementHTML || "(empty)";
  console.log(`     "${elText}"`);
  console.log(`     [${elText.length} chars]`);

  console.log("\n   ► Element name (semantic identifier):");
  const semId = domContext.semanticIdentifier || "(empty)";
  console.log(`     "${semId}"`);
  console.log(`     [${semId.length} chars]`);

  console.log("\n   ► Element computed styles:");
  const styles = domContext.computedStyles || "(empty)";
  console.log(`     "${styles}"`);
  console.log(`     [${styles.length} chars]`);

  console.log("\n   ► Semantic type:");
  console.log(`     "${domContext.semanticType || "None"}"`);

  console.log("\n   ► Children of clicked element:");
  const children = domContext.childrenList || "(empty - clicked element has < 2 meaningful children)";
  console.log(`     "${children}"`);
  console.log(`     [${children.length} chars]`);

  console.log(`\n${subSep}`);
  console.log("💰 BUDGET USAGE:");
  console.log(subSep);

  const ring1Total = (domContext.elementHTML?.length || 0) +
                     (domContext.semanticIdentifier?.length || 0) +
                     (domContext.computedStyles?.length || 0) +
                     (domContext.childrenList?.length || 0);

  const overhead = (domContext.pageURL?.length || 0) +
                   (domContext.pageName?.length || 0) +
                   (domContext.siteName?.length || 0) +
                   (domContext.pageArea?.length || 0);

  console.log(`   Page identification:           ${overhead} chars`);
  console.log(`   Ring 1 (selected element):     ${ring1Total} chars`);
  console.log(`   ────────────────────────────────────────`);
  console.log(`   Total:                         ${ring1Total + overhead} chars`);
  console.log(`   Approximate tokens:            ~${Math.round((ring1Total + overhead) / 4)} tokens`);
  console.log(`   Budget cap:                    ~1000 tokens (~4000 chars)`);

  const utilization = ((ring1Total + overhead) / 4000) * 100;
  console.log(`   Budget utilization:            ${utilization.toFixed(1)}%`);

  console.log(`\n${subSep}`);
  console.log("📤 FULL USER MESSAGE SENT TO OPENAI:");
  console.log(subSep);
  console.log(finalUserMessage);

  console.log(`\n${sep}`);
  console.log("  END OF AI INPUT DEBUG");
  console.log(sep);
  console.log("\n");
}

/* ===== DOM CONTEXT & TYPES ===== */

/** DOM context sent to the AI. Limited to <1000 tokens total. */
export interface DomContextForAI {
  elementHTML: string | null;
  elementType: string | null;
  semanticType?: "button" | "link" | "input" | "heading" | "paragraph" | "image" | "icon" | "card" | "section" | null;
  pageURL: string;
  pageName: string;
  siteName: string;
  pageArea: string;
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
  /** Iframe context when element is inside an embedded frame. */
  iframeContext?: string;
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

function buildDomContextFromPipelineContext(ctx: PipelineContext | null): DomContextForAI {
  if (!ctx) {
    return {
      elementHTML: null,
      elementType: null,
      semanticType: null,
      pageURL: "",
      pageName: "",
      siteName: "",
      pageArea: "",
      semanticIdentifier: "",
      computedStyles: "",
      childrenList: "",
      elementState: "",
      disabledState: "",
      modalContext: "",
      inputValue: "",
      iframeContext: "",
    };
  }
  const rawUrl = (typeof ctx.url === "string" ? ctx.url : "").split("#")[0];
  const pageInfo = parsePageInfo(rawUrl);
  const elementType = ctx.elementType ?? null;
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
  const iframeContext = typeof ctx.iframeContext === "string" ? ctx.iframeContext : "";
  return {
    elementHTML,
    elementType,
    semanticType,
    pageURL: pageInfo.sanitizedUrl,
    pageName: pageInfo.pageName,
    siteName: pageInfo.siteName,
    pageArea: pageInfo.pageArea,
    semanticIdentifier,
    computedStyles,
    childrenList,
    elementState,
    disabledState,
    modalContext,
    inputValue,
    iframeContext,
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
    (ctx.semanticIdentifier?.length ?? 0) +
    (ctx.computedStyles?.length ?? 0) +
    (ctx.childrenList?.length ?? 0) +
    (ctx.elementState?.length ?? 0) +
    (ctx.disabledState?.length ?? 0) +
    (ctx.modalContext?.length ?? 0) +
    (ctx.inputValue?.length ?? 0) +
    (ctx.iframeContext?.length ?? 0);
  const remaining = Math.max(0, maxChars - fixedChars);

  return {
    elementHTML:
      ctx.elementHTML && remaining > 0
        ? truncateForTokenBudget(ctx.elementHTML, remaining)
        : null,
    elementType: ctx.elementType ?? null,
    semanticType: ctx.semanticType ?? null,
    pageURL: ctx.pageURL,
    pageName: ctx.pageName,
    siteName: ctx.siteName,
    pageArea: ctx.pageArea,
    semanticIdentifier: ctx.semanticIdentifier ?? "",
    computedStyles: ctx.computedStyles ?? "",
    childrenList: ctx.childrenList ?? "",
    elementState: ctx.elementState ?? "",
    disabledState: ctx.disabledState ?? "",
    modalContext: ctx.modalContext ?? "",
    inputValue: ctx.inputValue ?? "",
    iframeContext: ctx.iframeContext ?? "",
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
    screenshotOCRText: o.screenshotOCRText != null && typeof o.screenshotOCRText === "string" ? o.screenshotOCRText : null,
    subtreeText: o.subtreeText != null && typeof o.subtreeText === "string" ? o.subtreeText : null,
    elementType: o.elementType != null && typeof o.elementType === "string" ? o.elementType : null,
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
    iframeContext: typeof o.iframeContext === "string" ? o.iframeContext : undefined,
  };
}

function dedupeLines(text: string | null): string | null {
  if (!text) return text;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return [...new Set(lines)].join("\n");
}

function buildUserMessage(
  transcript: string,
  domContext: DomContextForAI,
): string {
  const parts: string[] = [];

  parts.push("USER INTENT (SOURCE OF TRUTH):");
  parts.push(transcript.trim());

  parts.push("\nPAGE URL:");
  parts.push(domContext.pageURL || "Unknown");

  parts.push("\nPAGE NAME (use this for [Page Name] bracket prefix in title):");
  parts.push(domContext.pageName || "Unknown");

  parts.push("\nSITE NAME:");
  parts.push(domContext.siteName || "Unknown");

  parts.push("\nPAGE AREA (use this verbatim for the pageArea JSON field):");
  parts.push(domContext.pageArea || "Unknown");

  parts.push("\nREFERENCE CONTEXT (USE FOR NAMING AND IDENTIFICATION ONLY — never generate description content from DOM, only use it to identify what element or area the recorder is referring to):");

  parts.push("Selected element:");
  parts.push(domContext.elementHTML || "None");

  parts.push("\nElement name (semantic identifier):");
  parts.push(domContext.semanticIdentifier || "None");

  parts.push("\nElement computed styles:");
  parts.push(domContext.computedStyles || "None");

  parts.push("\nChildren of clicked element (for disambiguation when recorder mentions specific children):");
  parts.push(domContext.childrenList || "None (clicked element has no meaningful children)");

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

  if (domContext.iframeContext) {
    parts.push("\nFrame context:");
    parts.push(domContext.iframeContext);
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
 * Single GPT-4o-mini call: transcript + domContext → structured JSON.
 * Uses response_format json_schema so output is always valid JSON matching the schema.
 * On parse failure or missing description, returns fallback (transcript as description).
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

  // TEMPORARY DEBUG — delete after testing
  logDomContextToAI(transcript, domContext, userMessage);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.0, // Deterministic output for reliable Ring 1 reliance
    max_tokens: 500,
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
  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const json = parseStructuredResponse(raw);
  logger.debug("ai", "processing_success", {
    title: json?.title,
    descriptionLength: json?.description?.length ?? 0,
    tags: json?.tags
  });
  if (!json || !json.description) {
    return { json: fallbackStructuredFeedback(transcript), raw };
  }
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
