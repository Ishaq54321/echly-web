/**
 * Pipeline stages: Intent extraction + ticket generation (batched).
 * Uses DOM context when available (prefer over OCR). Enforces developer-ready ticket quality.
 * When Instruction Ontology is used, ticket generation takes ontology actions as primary input.
 */

import type OpenAI from "openai";
import {
  getElementsForPrompt,
  getTextContextForPrompt,
  isValidPipelineTag,
  type PipelineContext,
} from "./pipelineContext";
import type { OntologyAction } from "./instructionOntology";

export const PIPELINE_INTENT_TYPES = [
  "UI change",
  "Content change",
  "Layout change",
  "Bug fix",
  "Accessibility improvement",
  "UX improvement",
] as const;

export type PipelineIntentType = (typeof PIPELINE_INTENT_TYPES)[number];

export interface InstructionIntent {
  intent_type: PipelineIntentType;
  target_element: string | null;
  change_type: string;
  confidence: number;
}

export interface PipelineTicket {
  title: string;
  description: string;
  actionSteps: string[];
  tags: string[];
  confidenceScore: number;
}

const INTENT_AND_TICKET_SYSTEM = `You are Echly's pipeline: for a list of instructions you will output (1) one intent per instruction and (2) ONE developer-ready ticket that merges all instructions into a single ticket with multiple action steps. Accuracy over creativity. Use temperature 0 behavior.

STAGE A — INTENT (per instruction):
For each instruction output:
- intent_type: one of "UI change", "Content change", "Layout change", "Bug fix", "Accessibility improvement", "UX improvement"
- target_element: short label for the UI element (e.g. "hero CTA button", "Email field") or null. Use page context when provided.
- change_type: specific type (e.g. "size_increase", "color_change", "text_replace", "layout_width", "redirect_fix")
- confidence: 0–1

STAGE B — SINGLE TICKET (all instructions merged):
Output exactly ONE ticket that represents the entire group of changes. Each instruction becomes one action step. Action steps must be clear product requirements, faithful to the user's intent — never invent implementation mechanics.

TICKET RULES:
1. title: Short summary (4–10 words) describing the group of changes (e.g. "Update contact form fields", "Adjust hero and CTA styling").
2. description: One concise sentence explaining that multiple UI changes are requested (e.g. "Modify several form fields to improve clarity and usability.").
3. actionSteps: One step per instruction, in order. Write clear product requirements (see ACTION STEPS QUALITY below). Clarify wording when necessary; never invent how to implement.
4. tags: 1–3 from ["UI", "Content", "UX", "Layout", "Bug", "Accessibility"]. Combine tags that apply across the instructions.
5. confidenceScore: Average of the per-instruction confidences (0–1).

ACTION STEPS QUALITY (strict):
- Action steps must read like clear product requirements, not engineering instructions. Preserve the exact intent of the user's instruction.
- Clarify wording when necessary (e.g. spell out which field, which context). Never invent implementation mechanisms.
- Never assume specific technologies, properties, or code. Never add phrases like: "by adding a conditional rule", "by applying CSS", "by implementing JavaScript", "using a visibility property", "using loading='lazy'", "using WebP".
- Avoid vague phrases: "implement the change", "improve layout", "update design".
- Prefer concrete product phrasing: "Show the Company Name field when Business Account is selected", "Rename the Email field label to 'Business Email'".

Good examples (instruction → action step):
- "Show company name field when business account is selected" → "Show the Company Name field when Business Account is selected."
- "Hide personal phone number field for business accounts" → "Hide the Personal Phone Number field when Business Account is selected."
- "Require work email instead of personal email" → "Require a Work Email instead of a Personal Email for Business Account signups."

Bad (disallowed): "Apply a conditional visibility rule", "Use CSS display property", "Implement logic to dynamically show the field" — these invent implementation.

Do not hallucinate. Only include what the instructions state or clearly imply. No invented technical details.

OUTPUT: Return ONLY valid JSON. No markdown.
{
  "intents": [
    { "intent_type": "UI change", "target_element": "Email field", "change_type": "label_change", "confidence": 0.9 },
    { "intent_type": "UI change", "target_element": "Phone field", "change_type": "label_change", "confidence": 0.88 }
  ],
  "ticket": {
    "title": "Update contact form fields",
    "description": "Modify several form fields to improve clarity and usability.",
    "actionSteps": ["Rename Email field to Business Email", "Rename Phone Number field to Mobile Number"],
    "tags": ["UI", "UX"],
    "confidenceScore": 0.89
  }
}

The number of intents MUST equal the number of instructions. Output exactly one "ticket" object (not "tickets" array).`;

/** Map ontology action_type to pipeline intent_type and change_type for consistency. */
const ONTOLOGY_TO_INTENT: Record<
  string,
  { intent_type: PipelineIntentType; change_type: string }
> = {
  TEXT_CHANGE: { intent_type: "Content change", change_type: "text_replace" },
  RENAME_FIELD: { intent_type: "UI change", change_type: "label_change" },
  REPLACE_IMAGE: { intent_type: "Content change", change_type: "image_replace" },
  RESIZE_ELEMENT: { intent_type: "UI change", change_type: "size_increase" },
  COLOR_CHANGE: { intent_type: "UI change", change_type: "color_change" },
  MOVE_ELEMENT: { intent_type: "Layout change", change_type: "element_move" },
  ADD_ELEMENT: { intent_type: "UI change", change_type: "add_element" },
  REMOVE_ELEMENT: { intent_type: "UI change", change_type: "remove_element" },
  MERGE_FIELDS: { intent_type: "UI change", change_type: "merge_fields" },
  LAYOUT_ADJUSTMENT: { intent_type: "Layout change", change_type: "layout_width" },
  LINK_UPDATE: { intent_type: "Content change", change_type: "link_update" },
  BUG_FIX: { intent_type: "Bug fix", change_type: "bug_fix" },
  ACCESSIBILITY_FIX: { intent_type: "Accessibility improvement", change_type: "accessibility" },
};

const TICKET_FROM_ONTOLOGY_SYSTEM = `You are Echly's pipeline: for a list of ONTOLOGY ACTIONS you will output ONE developer-ready ticket that merges all actions. Use the structured actions and instructions as the source of truth. Accuracy over creativity. Temperature 0.

INPUT: You receive an array of ontology actions (action_type, target_element, change_details, confidence) and the original instructions (one per action). Generate one action step per instruction. Write clear product requirements (see ACTION STEPS QUALITY below). Clarify wording when necessary; never invent how to implement.

TICKET RULES (strict):
1. Output exactly ONE ticket for the entire group. Each instruction/action becomes one action step.
2. title: Short summary (4–10 words) describing the group of changes (e.g. "Update contact form fields", "Adjust hero and CTA").
3. description: One concise sentence explaining that multiple UI changes are requested.
4. actionSteps: One step per instruction, in order. Write clear product requirements; never invent implementation mechanisms (see ACTION STEPS QUALITY).
5. tags: 1–3 from ["UI", "Content", "UX", "Layout", "Bug", "Accessibility"]. Combine tags inferred from all actions.
6. confidenceScore: Average of the actions' confidence values (0–1).
7. Do not hallucinate. Only include what the actions state. No invented technical details.

ACTION STEPS QUALITY (strict):
- Action steps must read like clear product requirements, not engineering instructions. Preserve the exact intent of the user's instruction.
- Clarify wording when necessary (e.g. spell out which field, which context). Never invent implementation mechanisms.
- Never assume specific technologies, properties, or code. Never add phrases like: "by adding a conditional rule", "by applying CSS", "by implementing JavaScript", "using a visibility property", "using loading='lazy'", "using WebP".
- Avoid vague phrases: "implement the change", "improve layout", "update design".
- Prefer concrete product phrasing: "Show the Company Name field when Business Account is selected", "Rename the Email field label to 'Business Email'".

Good examples (instruction → action step):
- "Show company name field when business account is selected" → "Show the Company Name field when Business Account is selected."
- "Hide personal phone number field for business accounts" → "Hide the Personal Phone Number field when Business Account is selected."
- "Require work email instead of personal email" → "Require a Work Email instead of a Personal Email for Business Account signups."

Bad (disallowed): "Apply a conditional visibility rule", "Use CSS display property", "Implement logic to dynamically show the field" — these invent implementation.

OUTPUT: Return ONLY valid JSON. No markdown.
{
  "ticket": {
    "title": "Update contact form fields",
    "description": "Modify several form fields to improve clarity and usability.",
    "actionSteps": ["Rename Email field to Business Email", "Rename Phone Number field to Mobile Number", "Merge First Name and Last Name into Full Name"],
    "tags": ["UI", "UX"],
    "confidenceScore": 0.9
  }
}

Output exactly one "ticket" object (not "tickets" array).`;

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

function buildUserContent(instructions: string[], context: PipelineContext | null): string {
  const lines: string[] = [];
  const textContext = getTextContextForPrompt(context);
  const elements = getElementsForPrompt(context ?? undefined);
  if (elements.length > 0) {
    lines.push("UI elements (prefer these to identify targets):", JSON.stringify(elements.slice(0, 80)).slice(0, 2500));
    lines.push("");
  }
  if (textContext) {
    lines.push("Visible text / context:", textContext);
    lines.push("");
  }
  if (lines.length === 0) lines.push("Visible text from page: (none)");
  lines.push("", "Instructions (one per line):", ...instructions.map((s, i) => `${i + 1}. ${s}`));
  return lines.join("\n");
}

function buildUserContentFromOntology(
  actions: OntologyAction[],
  instructions: string[],
  context: PipelineContext | null
): string {
  const lines: string[] = [];
  const textContext = getTextContextForPrompt(context);
  const elements = getElementsForPrompt(context ?? undefined);
  if (elements.length > 0) {
    lines.push("UI elements (for reference):", JSON.stringify(elements.slice(0, 80)).slice(0, 2500));
    lines.push("");
  }
  if (textContext) {
    lines.push("Visible text / context:", textContext);
    lines.push("");
  }
  lines.push("Ontology actions (merge into ONE ticket; write one clear product-requirement action step per instruction — do not invent implementation):", JSON.stringify(actions, null, 0).slice(0, 4000));
  lines.push("");
  lines.push("Instructions (one clear product-requirement step per line; preserve intent, clarify wording only; never add technical implementation):", ...instructions.map((s, i) => `${i + 1}. ${s}`));
  return lines.join("\n");
}

/**
 * Generates intents and one merged ticket from ontology actions (primary path after Instruction Ontology stage).
 * Intents are derived from action_type; one ticket contains all instructions as action steps.
 */
export async function batchIntentAndTicketsFromOntology(
  client: OpenAI,
  actions: OntologyAction[],
  context: PipelineContext | null,
  options?: { instructions?: string[]; retryOnce?: boolean }
): Promise<{ intents: InstructionIntent[]; tickets: PipelineTicket[] }> {
  const instructions = options?.instructions ?? actions.map((a) => ticketTitleFromAction(a));
  console.log("ECHLY DEBUG — ONTOLOGY ACTIONS RECEIVED BY PIPELINE:", actions.length);
  console.log("ECHLY DEBUG — VISIBLE TEXT LENGTH:", context?.visibleText ? context.visibleText.length : 0);

  if (actions.length === 0) {
    return { intents: [], tickets: [] };
  }

  const retryOnce = options?.retryOnce ?? true;
  const userContent = buildUserContentFromOntology(actions, instructions, context);

  const call = async (): Promise<{ intents: InstructionIntent[]; tickets: PipelineTicket[] }> => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      top_p: 1,
      max_tokens: 2500,
      messages: [
        { role: "system", content: TICKET_FROM_ONTOLOGY_SYSTEM },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return fallbackFromOntology(actions, instructions);

    const parsed = JSON.parse(cleanJson(content)) as { ticket?: unknown };
    const tickets = normalizeSingleTicketFromOntology(parsed.ticket, actions, instructions);
    const intents = actions.map((a) => ontologyActionToIntent(a));
    console.log("ECHLY DEBUG — GENERATED TICKETS (single merged):", tickets);
    return { intents, tickets };
  };

  try {
    return await call();
  } catch (err) {
    console.error("[pipelineStages] Ontology ticket parse failed:", err);
    if (retryOnce) {
      try {
        return await call();
      } catch (retryErr) {
        console.error("[pipelineStages] Ontology retry failed:", retryErr);
        return fallbackFromOntology(actions, instructions);
      }
    }
    return fallbackFromOntology(actions, instructions);
  }
}

function ontologyActionToIntent(a: OntologyAction): InstructionIntent {
  const mapped = ONTOLOGY_TO_INTENT[a.action_type] ?? {
    intent_type: "UX improvement" as PipelineIntentType,
    change_type: "general",
  };
  return {
    intent_type: mapped.intent_type,
    target_element: a.target_element,
    change_type: mapped.change_type,
    confidence: a.confidence,
  };
}

/** Build one merged ticket from parsed single-ticket response; actionSteps = instructions. */
function normalizeSingleTicketFromOntology(
  raw: unknown,
  actions: OntologyAction[],
  instructions: string[]
): PipelineTicket[] {
  const actionSteps = instructions
    .filter((s) => typeof s === "string" && String(s).trim() !== "")
    .map((s) => String(s).trim());
  const fallbackTitle =
    actions.length === 1
      ? ticketTitleFromAction(actions[0])
      : "Multiple UI changes";
  const avgConfidence =
    actions.length > 0
      ? actions.reduce((sum, a) => sum + a.confidence, 0) / actions.length
      : 0.5;

  if (!raw || typeof raw !== "object") {
    return [
      {
        title: fallbackTitle,
        description: "Multiple UI changes requested.",
        actionSteps: actionSteps.length > 0 ? actionSteps : actions.map((a) => ticketTitleFromAction(a)),
        tags: ["Feedback"],
        confidenceScore: avgConfidence,
      },
    ];
  }

  const r = raw as Record<string, unknown>;
  const rawTitle =
    typeof r.title === "string" && r.title.trim() !== "" ? String(r.title).trim() : fallbackTitle;
  const title = enforceTitle(rawTitle, fallbackTitle);
  const description =
    typeof r.description === "string" && r.description.trim() !== ""
      ? String(r.description).trim().slice(0, 500)
      : "Multiple UI changes requested.";
  const parsedSteps = Array.isArray(r.actionSteps)
    ? (r.actionSteps as unknown[])
        .filter((s) => typeof s === "string" && String(s).trim() !== "")
        .map((s) => String(s).trim())
    : [];
  const steps = parsedSteps.length > 0 ? parsedSteps : actionSteps.length > 0 ? actionSteps : actions.map((a) => ticketTitleFromAction(a));
  const rawTags = Array.isArray(r.tags)
    ? (r.tags as unknown[]).filter((s) => typeof s === "string").map((s) => String(s))
    : [];
  const tags = rawTags.length > 0 ? rawTags.filter(isValidPipelineTag).slice(0, 3) : ["Feedback"];
  if (tags.length === 0) tags.push("Feedback");

  return [
    {
      title,
      description,
      actionSteps: steps,
      tags,
      confidenceScore: clamp(r.confidenceScore ?? avgConfidence),
    },
  ];
}

function ticketTitleFromAction(a: OntologyAction): string {
  const target = a.target_element ? `${a.target_element} ` : "";
  const det = a.change_details;
  if (a.action_type === "RESIZE_ELEMENT" && (det.increase ?? det.decrease)) {
    const amt = String(det.increase ?? det.decrease);
    return `${target}${det.increase ? "Increase" : "Decrease"} size by ${amt}`.trim().slice(0, 120);
  }
  if (a.action_type === "RENAME_FIELD" && det.new_label) {
    return `Rename ${target}to ${String(det.new_label)}`.trim().slice(0, 120);
  }
  return `${a.action_type} ${target}`.trim().slice(0, 120) || "UI change";
}

function fallbackFromOntology(
  actions: OntologyAction[],
  instructions: string[]
): { intents: InstructionIntent[]; tickets: PipelineTicket[] } {
  const actionSteps = instructions
    .filter((s) => typeof s === "string" && String(s).trim() !== "")
    .map((s) => String(s).trim());
  const avgConfidence =
    actions.length > 0
      ? actions.reduce((sum, a) => sum + a.confidence, 0) / actions.length
      : 0.5;
  const title =
    actions.length === 1 ? ticketTitleFromAction(actions[0]) : "Multiple UI changes";
  const ticket: PipelineTicket = {
    title,
    description: "Multiple UI changes requested.",
    actionSteps: actionSteps.length > 0 ? actionSteps : actions.map((a) => ticketTitleFromAction(a)),
    tags: ["Feedback"],
    confidenceScore: avgConfidence,
  };
  return {
    intents: actions.map(ontologyActionToIntent),
    tickets: [ticket],
  };
}

/**
 * For a list of instructions, returns intents and tickets in one batch call.
 * Uses context (DOM elements preferred over visibleText) for disambiguation.
 * Retries once on JSON parse failure.
 */
export async function batchIntentAndTickets(
  client: OpenAI,
  instructions: string[],
  context: PipelineContext | null,
  options?: { retryOnce?: boolean }
): Promise<{ intents: InstructionIntent[]; tickets: PipelineTicket[] }> {
  console.log("ECHLY DEBUG — INSTRUCTIONS RECEIVED BY PIPELINE:", instructions);
  console.log("ECHLY DEBUG — VISIBLE TEXT LENGTH:", context?.visibleText ? context.visibleText.length : 0);

  if (instructions.length === 0) {
    return { intents: [], tickets: [] };
  }

  const retryOnce = options?.retryOnce ?? true;
  const userContent = buildUserContent(instructions, context);

  const call = async (): Promise<{ intents: InstructionIntent[]; tickets: PipelineTicket[] }> => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      top_p: 1,
      max_tokens: 2500,
      messages: [
        { role: "system", content: INTENT_AND_TICKET_SYSTEM },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return fallbackIntentAndTickets(instructions);

    const parsed = JSON.parse(cleanJson(content)) as {
      intents?: unknown[];
      ticket?: unknown;
    };
    const intents = normalizeIntents(parsed.intents, instructions.length);
    const tickets = normalizeSingleTicket(parsed.ticket, instructions);
    console.log("ECHLY DEBUG — GENERATED TICKETS (single merged):", tickets);
    return { intents, tickets };
  };

  try {
    const result = await call();
    return result;
  } catch (err) {
    console.error("[pipelineStages] Parse failed:", err);
    if (retryOnce) {
      try {
        return await call();
      } catch (retryErr) {
        console.error("[pipelineStages] Retry parse failed:", retryErr);
        return fallbackIntentAndTickets(instructions);
      }
    }
    return fallbackIntentAndTickets(instructions);
  }
}

function normalizeIntents(raw: unknown[] | undefined, expectedLen: number): InstructionIntent[] {
  if (!Array.isArray(raw)) return [];
  const result: InstructionIntent[] = [];
  for (let i = 0; i < expectedLen; i++) {
    const o = raw[i];
    if (!o || typeof o !== "object") {
      result.push(defaultIntent());
      continue;
    }
    const r = o as Record<string, unknown>;
    const intent_type = PIPELINE_INTENT_TYPES.includes(r.intent_type as PipelineIntentType)
      ? (r.intent_type as PipelineIntentType)
      : "UX improvement";
    const target_element =
      r.target_element != null && typeof r.target_element === "string" && r.target_element.trim() !== ""
        ? String(r.target_element).trim()
        : null;
    const change_type =
      typeof r.change_type === "string" && r.change_type.trim() !== ""
        ? String(r.change_type).trim().slice(0, 80)
        : "general";
    result.push({
      intent_type,
      target_element,
      change_type,
      confidence: clamp(r.confidence),
    });
  }
  return result;
}

function defaultIntent(): InstructionIntent {
  return {
    intent_type: "UX improvement",
    target_element: null,
    change_type: "general",
    confidence: 0.5,
  };
}

/** Enforce title 4–10 words (soft: truncate long, pad short with instruction). */
function enforceTitle(title: string, instruction: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 4 && words.length <= 10) return title.trim().slice(0, 120);
  if (words.length > 10) return words.slice(0, 10).join(" ").slice(0, 120);
  const fromInst = instruction.trim().split(/\s+/).filter(Boolean).slice(0, 10).join(" ");
  return (fromInst || title).slice(0, 120);
}

/** Build one merged ticket from parsed single-ticket response; actionSteps = instructions. */
function normalizeSingleTicket(raw: unknown, instructions: string[]): PipelineTicket[] {
  const actionSteps = instructions
    .filter((s) => typeof s === "string" && String(s).trim() !== "")
    .map((s) => String(s).trim());
  const fallbackTitle =
    instructions.length === 1
      ? instructions[0].trim().slice(0, 80)
      : "Multiple UI changes";

  if (!raw || typeof raw !== "object") {
    return [
      {
        title: fallbackTitle,
        description: "Multiple UI changes requested.",
        actionSteps: actionSteps.length > 0 ? actionSteps : ["See instructions"],
        tags: ["Feedback"],
        confidenceScore: 0.5,
      },
    ];
  }

  const r = raw as Record<string, unknown>;
  const rawTitle =
    typeof r.title === "string" && r.title.trim() !== "" ? String(r.title).trim() : fallbackTitle;
  const title = enforceTitle(rawTitle, fallbackTitle);
  const description =
    typeof r.description === "string" && r.description.trim() !== ""
      ? String(r.description).trim().slice(0, 500)
      : "Multiple UI changes requested.";
  const parsedSteps = Array.isArray(r.actionSteps)
    ? (r.actionSteps as unknown[])
        .filter((s) => typeof s === "string" && String(s).trim() !== "")
        .map((s) => String(s).trim())
    : [];
  const steps = parsedSteps.length > 0 ? parsedSteps : actionSteps.length > 0 ? actionSteps : ["See instructions"];
  const rawTags = Array.isArray(r.tags)
    ? (r.tags as unknown[]).filter((s) => typeof s === "string").map((s) => String(s))
    : [];
  const tags = rawTags.length > 0 ? rawTags.filter(isValidPipelineTag).slice(0, 3) : ["Feedback"];
  if (tags.length === 0) tags.push("Feedback");

  return [
    {
      title,
      description,
      actionSteps: steps,
      tags,
      confidenceScore: clamp(r.confidenceScore),
    },
  ];
}

function fallbackIntentAndTickets(
  instructions: string[]
): { intents: InstructionIntent[]; tickets: PipelineTicket[] } {
  const actionSteps = instructions
    .filter((s) => typeof s === "string" && String(s).trim() !== "")
    .map((s) => String(s).trim());
  const ticket: PipelineTicket = {
    title: instructions.length === 1 ? instructions[0].trim().slice(0, 80) : "Multiple UI changes",
    description: "Multiple UI changes requested.",
    actionSteps: actionSteps.length > 0 ? actionSteps : ["See instructions"],
    tags: ["Feedback"],
    confidenceScore: 0.5,
  };
  return {
    intents: instructions.map(() => defaultIntent()),
    tickets: [ticket],
  };
}
