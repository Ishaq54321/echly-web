/**
 * Instruction Graph Layer — Groups instructions by UI target and preserves
 * multiple actions per element. Sits between Segmentation and Ticket Generation.
 * Builds the graph deterministically from segmentation output (no extra OpenAI calls).
 * Behaves like a senior product manager interpreting messy human feedback.
 */

import { echlyDebug } from "@/lib/utils/logger";
import {
  getElementsForPrompt,
  getTextContextForPrompt,
  type PipelineContext,
} from "./pipelineContext";
import type { PipelineTicket } from "./pipelineStages";

// ---------------------------------------------------------------------------
// Graph data structures
// ---------------------------------------------------------------------------

export interface InstructionGraph {
  targets: TargetNode[];
}

export interface TargetNode {
  element: string | null;
  actions: ActionNode[];
}

export interface ActionNode {
  action_type: string;
  details: Record<string, unknown>;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Allowed element vocabulary (never invent names not in transcript or context)
// ---------------------------------------------------------------------------

/** Extract phrases that can serve as UI element names from context only. */
function getAllowedElementPhrases(ctx: PipelineContext | null): Set<string> {
  const phrases = new Set<string>();
  const add = (s: string) => {
    const t = s.trim().toLowerCase();
    if (t.length >= 2 && t.length <= 80) phrases.add(t);
  };

  const elements = getElementsForPrompt(ctx ?? undefined);
  for (const el of elements) {
    if (el.type) add(el.type);
    if (el.label) add(el.label);
    if (el.text) add(el.text);
    if (el.role) add(el.role);
    // compound: "CTA button", "hero headline"
    if (el.label && el.type) add(`${el.label} ${el.type}`);
    if (el.text && el.type) add(`${el.text} ${el.type}`);
  }

  const visibleText = getTextContextForPrompt(ctx ?? undefined);
  if (visibleText) {
    // Add significant words (2+ chars) and short phrases (2–4 words) from visible text
    const words = visibleText.split(/\s+/).filter((w) => w.length >= 2);
    words.forEach((w) => add(w.replace(/[^\w\s-]/g, "")));
    for (let i = 0; i < words.length - 1; i++) {
      add(`${words[i]} ${words[i + 1]}`);
    }
  }

  // Canonical UI terms that often appear in feedback (generic, not invented content)
  [
    "cta",
    "button",
    "headline",
    "hero",
    "form",
    "nav",
    "navigation",
    "link",
    "links",
    "testimonial",
    "testimonials",
    "pricing",
    "card",
    "cards",
    "image",
    "footer",
    "header",
    "field",
    "input",
    "label",
    "section",
    "title",
    "subtitle",
    "text",
    "paragraph",
    "logo",
    "menu",
    "banner",
    "account",
    "phone",
    "company",
    "business account",
    "personal phone field",
    "company name field",
  ].forEach(add);

  return phrases;
}

/** Normalize a candidate element string for grouping. */
function normalizeElementKey(candidate: string): string {
  return candidate
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

/** Infer UI target from instruction text using allowed phrases only (anti-hallucination). */
function inferTargetFromInstruction(
  instruction: string,
  allowed: Set<string>,
  transcript: string
): string | null {
  const lower = instruction.toLowerCase();
  const transcriptLower = (transcript || "").toLowerCase();

  // Patterns: "the X", "X button", "the hero X", "make the X", conditional "hide X when", etc.
  const patterns: RegExp[] = [
    /\b(?:the|this|that)\s+([a-z][a-z0-9\s-]{1,50}?)(?:\s+(?:button|link|field|form|section|headline|image|card|text)|[.,]|$)/gi,
    /\b(?:make|change|update|fix|improve|move|resize|shorten|increase|decrease)\s+(?:the\s+)?([a-z][a-z0-9\s-]{1,50}?)(?:\s+(?:more|bigger|smaller)|[.,]|$)/gi,
    /\b(hero|cta|nav|pricing|testimonial|footer|header|form)\s*(?:section|area|block|card|button|headline|text|links?)?\b/gi,
    /\b(middle|first|second|main|primary)\s+([a-z][a-z0-9\s-]{1,40})/gi,
    /\b(?:hide|show|display)\s+(?:the\s+)?([a-z][a-z0-9\s-]{1,50}?)(?:\s+field|\s+when|[.,]|$)/gi,
    /\b(personal\s+phone\s+field|company\s+name\s+field|phone\s+field|account\s+type)\b/gi,
  ];

  const candidates: string[] = [];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(lower)) !== null) {
      const phrase = (m[1] || m[0]).trim().replace(/\s+/g, " ");
      if (phrase.length >= 2) candidates.push(phrase);
    }
  }

  // Prefer candidate that appears in allowed set or in transcript
  for (const c of candidates) {
    const key = normalizeElementKey(c);
    if (allowed.has(key)) return key;
    if (transcriptLower.includes(key)) return key;
    // Check individual words
    const words = key.split(/\s+/);
    const match = [...allowed].find((a) => words.some((w) => a.includes(w) || w.length >= 4 && a.includes(w)));
    if (match) return match;
  }

  // Single-word match from allowed
  const words = lower.split(/\s+/).filter((w) => w.length >= 3);
  for (const w of words) {
    const wNorm = w.replace(/[^a-z0-9]/g, "");
    if (!wNorm) continue;
    const found = [...allowed].find((a) => a.includes(wNorm) || a.replace(/\s/g, "") === wNorm);
    if (found) return found;
  }

  return null;
}

/** Infer action_type from instruction wording (deterministic). */
function inferActionType(instruction: string): string {
  const lower = instruction.toLowerCase();
  if (/\b(shorten|reduce|trim|simplify)\s+(?:the\s+)?(?:text|headline|title|copy)/.test(lower)) return "TEXT_CHANGE";
  if (/\b(rename|relabel|change\s+label|placeholder)/.test(lower)) return "RENAME_FIELD";
  if (/\b(replace|swap)\s+(?:the\s+)?(?:image|photo|pic)/.test(lower)) return "REPLACE_IMAGE";
  if (/\b(increase|decrease|bigger|smaller|larger|resize|size)\b/.test(lower)) return "RESIZE_ELEMENT";
  if (/\b(color|colour|blue|red|green|darker|lighter)\b/.test(lower)) return "COLOR_CHANGE";
  if (/\b(move|relocate|put|place)\s+(?:the\s+)?/.test(lower)) return "MOVE_ELEMENT";
  if (/\b(add|insert)\s+(?:a\s+)?(?:new\s+)?/.test(lower)) return "ADD_ELEMENT";
  if (/\b(remove|delete|drop)\b/.test(lower)) return "REMOVE_ELEMENT";
  if (/\b(hide|show|display)\s+(?:the\s+)?/.test(lower)) return "VISIBILITY";
  if (/\b(merge|combine)\s+(?:the\s+)?(?:field|input)/.test(lower)) return "MERGE_FIELDS";
  if (/\b(spacing|space|margin|padding|gap|stack|align|layout)\b/.test(lower)) return "LAYOUT_ADJUSTMENT";
  if (/\b(link|url|href)\b/.test(lower)) return "LINK_UPDATE";
  if (/\b(bug|broken|fix\s+the\s+behavior)/.test(lower)) return "BUG_FIX";
  if (/\b(accessibility|contrast|focus|a11y|screen\s+reader)/.test(lower)) return "ACCESSIBILITY_FIX";
  if (/\b(track|analytics|log|measure|count\s+clicks|click\s+tracking)/.test(lower)) return "ANALYTICS_EVENT";
  return "LAYOUT_ADJUSTMENT";
}

/**
 * Rule 7: Infer actionable summary from UX problem statements.
 * Never invent specific content (Rule 4: no "Change to 'Who We Are'").
 */
function inferActionSummary(instruction: string): string {
  const t = instruction.trim();
  const lower = t.toLowerCase();
  const targetFrom = (regex: RegExp, fallback: string) => {
    const m = t.match(regex);
    return m ? m[1].trim() : fallback;
  };
  if (/\b(hard to read|difficult to read|hard to scan|confusing)\b/.test(lower)) {
    const target = targetFrom(/(?:the\s+)?([a-z][a-z0-9\s-]{0,40}?)(?:\s+are|\s+is|\s+feel)/i, "content");
    return `Improve readability of ${target}`.slice(0, 120);
  }
  if (/\b(dense|cramped|too tight|squished|crowded)\b/.test(lower)) {
    const target = targetFrom(/(?:the\s+)?([a-z][a-z0-9\s-]{0,40}?)(?:\s+feel|\s+are|\s+is)/i, "elements");
    return `Increase spacing between ${target}`.slice(0, 120);
  }
  if (/\b(cluttered|too busy|overwhelming)\b/.test(lower)) {
    const target = targetFrom(/(?:the\s+)?([a-z][a-z0-9\s-]{0,40}?)(?:\s+feel|\s+is|\s+looks)/i, "section");
    return `Simplify ${target} layout`.slice(0, 120);
  }
  if (/\b(too long|feels long)\b/.test(lower)) {
    const target = targetFrom(/(?:the\s+)?([a-z][a-z0-9\s-]{0,40}?)(?:\s+is|\s+feel)/i, "section");
    return `Shorten or simplify ${target}`.slice(0, 120);
  }
  if (/\b(too small)\b/.test(lower)) {
    const target = targetFrom(/(?:the\s+)?([a-z][a-z0-9\s-]{0,40}?)(?:\s+is|\s+feel|\s+looks)/i, "element");
    return `Increase size of ${target}`.slice(0, 120);
  }
  if (/\b(too large|too big|huge)\b/.test(lower)) {
    const target = targetFrom(/(?:the\s+)?([a-z][a-z0-9\s-]{0,40}?)(?:\s+is|\s+feel|\s+looks)/i, "element");
    return `Reduce size of ${target}`.slice(0, 120);
  }
  if (/\b(hide|show|display)\s+(?:the\s+)?/.test(lower)) {
    const target = targetFrom(/(?:hide|show|display)\s+(?:the\s+)?([a-z][a-z0-9\s-]{0,40}?)(?:\s+when|\s+field|[.,]|$)/i, "element");
    return `${lower.startsWith("hide") ? "Hide" : "Show"} ${target}`.slice(0, 120);
  }
  return t.slice(0, 200);
}

/** Build action details without inventing content (only generic description). */
function buildActionDetails(instruction: string): Record<string, unknown> {
  const summary = inferActionSummary(instruction);
  return { summary };
}

/** Action verbs: never mark these as non-actionable. */
const ALWAYS_ACTIONABLE_VERBS = /\b(reduce|increase|move|change|rename|hide|show|add|remove)\b/i;

/** Decide if we can infer an actionable change (avoid unnecessary clarification). */
function isActionable(instruction: string): boolean {
  const t = instruction.trim();
  if (t.length < 5) return false;
  const lower = t.toLowerCase();
  if (ALWAYS_ACTIONABLE_VERBS.test(lower)) return true;
  const vague = /\b(fix\s+this|fix\s+it|make\s+it\s+better|improve\s+this|something\s+wrong)\s*$/i;
  if (vague.test(lower)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Graph builder (deterministic)
// ---------------------------------------------------------------------------

export interface BuildInstructionGraphInput {
  instructions: string[];
  context: PipelineContext | null;
  /** Original transcript for anti-hallucination and target matching */
  transcript?: string | null;
}

export interface BuildInstructionGraphResult {
  graph: InstructionGraph;
  needsClarification: boolean;
}

/**
 * Builds the instruction graph from segmented instructions.
 * - Groups instructions by UI target (same element → same TargetNode).
 * - Preserves multiple actions per target (including alternatives, no collapsing).
 * - Never invents UI element names: only from instruction/transcript/context.
 * - Infers target from context when implied (e.g. "pricing cards feel cramped" → target pricing cards).
 * Deterministic; no OpenAI calls.
 */
export function buildInstructionGraph(input: BuildInstructionGraphInput): BuildInstructionGraphResult {
  const { instructions, context, transcript = "" } = input;
  const allowed = getAllowedElementPhrases(context);

  const targetMap = new Map<string, ActionNode[]>();

  for (const inst of instructions) {
    const trimmed = inst.trim();
    if (!trimmed) continue;

    if (!isActionable(trimmed)) {
      // Still attach to a "general" bucket so we can later trigger clarification if everything is vague
      const key = "__vague__";
      if (!targetMap.has(key)) targetMap.set(key, []);
      targetMap.get(key)!.push({
        action_type: "UNKNOWN",
        details: { summary: trimmed },
        confidence: 0.3,
      });
      continue;
    }

    let element: string | null = inferTargetFromInstruction(trimmed, allowed, transcript);
    // Rule 7: If no target found but instruction is actionable, infer from UX diagnostic language
    if (!element && /(feel|feels|cramped|dense|hard to read|cluttered|too busy|crowded)/i.test(trimmed)) {
      const m = trimmed.match(/(?:the\s+)?([a-z][a-z0-9\s-]{1,40}?)(?:\s+feel|\s+are|\s+is)/i);
      if (m) {
        const candidate = normalizeElementKey(m[1].trim());
        if (allowed.has(candidate) || transcript.toLowerCase().includes(candidate)) {
          element = candidate;
        }
      }
      if (!element) {
        // Generic inferred target for problem statements
        if (/testimonial|quote/i.test(trimmed)) element = "testimonials";
        else if (/pricing|card/i.test(trimmed)) element = "pricing cards";
        else if (/hero|headline/i.test(trimmed)) element = "hero";
        else if (/dashboard|layout/i.test(trimmed)) element = "layout";
        else element = "section";
      }
    }

    const key = element ?? "__ungrouped__";
    if (!targetMap.has(key)) targetMap.set(key, []);

    const actionType = inferActionType(trimmed);
    const details = buildActionDetails(trimmed);
    const confidence = 0.85;

    targetMap.get(key)!.push({
      action_type: actionType,
      details,
      confidence,
    });
  }

  const targets: TargetNode[] = [];
  let nullActions: ActionNode[] = [];

  for (const [key, actions] of targetMap) {
    if (key === "__vague__" || key === "__ungrouped__") {
      nullActions = nullActions.concat(actions);
      continue;
    }
    targets.push({ element: key, actions });
  }

  if (nullActions.length > 0) {
    targets.push({ element: null, actions: nullActions });
  }

  const graph: InstructionGraph = { targets };

  const vagueTarget = graph.targets.find((t) => t.element === null && t.actions.some((a) => a.action_type === "UNKNOWN"));
  const hasOnlyVague = graph.targets.length === 1 && vagueTarget !== undefined && vagueTarget.actions.every((a) => a.action_type === "UNKNOWN");
  const noActionable = graph.targets.length === 0 || graph.targets.every((t) => t.actions.every((a) => a.confidence < 0.5));
  const needsClarification = (hasOnlyVague || noActionable) && instructions.length > 0;

  echlyDebug("INSTRUCTION GRAPH", { targetCount: graph.targets.length });
  graph.targets.forEach((t, i) => {
    echlyDebug("GRAPH TARGETS", `[${i}] element=${t.element ?? "null"} actions=${t.actions.length}`);
    t.actions.forEach((a, j) => {
      echlyDebug("GRAPH ACTIONS", `  [${j}] type=${a.action_type} confidence=${a.confidence} summary=${String((a.details as { summary?: string }).summary ?? "").slice(0, 60)}`);
    });
  });

  return { graph, needsClarification };
}

// ---------------------------------------------------------------------------
// Ticket generation from graph (single ticket with ALL instructions as action steps)
// ---------------------------------------------------------------------------

/** Build a short summary title from targets/elements (e.g. "Hero layout adjustments"). */
function generateTitleFromTargets(targets: TargetNode[]): string {
  const elements = targets
    .map((t) => t.element)
    .filter((e): e is string => e != null && e !== "__ungrouped__" && e !== "__vague__");
  if (elements.length === 0) return "Requested UI changes";
  if (elements.length === 1) {
    const label = elements[0].replace(/\b\w/g, (c) => c.toUpperCase());
    return `${label} adjustments`;
  }
  const first = elements[0].replace(/\b\w/g, (c) => c.toUpperCase());
  if (elements.some((e) => /hero|button|cta|image/i.test(e))) return `${first} layout adjustments`;
  return "Layout and content adjustments";
}

/**
 * Converts the instruction graph to a single pipeline ticket.
 * ALL instructions from the graph appear as action steps (no discarding).
 * Title summarizes the change; action steps are mapped directly from the graph.
 */
export function ticketsFromGraph(graph: InstructionGraph): PipelineTicket[] {
  const allActions: Array<{ summary: string; confidence: number }> = [];

  for (const node of graph.targets) {
    for (const a of node.actions) {
      if (a.action_type === "UNKNOWN" || a.confidence < 0.5) continue;
      const summary =
        (a.details && typeof (a.details as { summary?: string }).summary === "string")
          ? (a.details as { summary: string }).summary.trim()
          : "";
      const step = summary.length > 0 ? summary : a.action_type;
      if (step.length > 0) allActions.push({ summary: step, confidence: a.confidence });
    }
  }

  if (allActions.length === 0) return [];

  const actionSteps = allActions.map((a) => a.summary);
  const primaryTarget =
    graph.targets[0]?.element != null &&
    graph.targets[0].element !== "__ungrouped__" &&
    graph.targets[0].element !== "__vague__"
      ? graph.targets[0].element.replace(/\b\w/g, (c) => c.toUpperCase())
      : "layout";
  const title = generateTitleFromTargets(graph.targets);
  const averageConfidence =
    allActions.reduce((s, a) => s + a.confidence, 0) / allActions.length;

  echlyDebug("TICKET ACTION STEP COUNT", actionSteps.length);
  echlyDebug("ACTION STEPS INCLUDED", actionSteps);

  const ticket: PipelineTicket = {
    title: title.slice(0, 120),
    description: `Requested changes for ${primaryTarget}.`,
    actionSteps,
    tags: ["Feedback"],
    confidenceScore: Math.max(0, Math.min(1, averageConfidence)),
  };

  return [ticket];
}
