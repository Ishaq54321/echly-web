/**
 * Instruction Graph Layer — Groups instructions by UI target and preserves
 * multiple actions per element. Sits between Segmentation and Ticket Generation.
 * Builds the graph deterministically from segmentation output (no extra OpenAI calls).
 * Behaves like a senior product manager interpreting messy human feedback.
 */

import { generateTicketTitle } from "@/lib/tickets/generateTicketTitle";
import { echlyDebug } from "@/lib/utils/logger";
import type { PipelineContext } from "./pipelineContext";
import type { PipelineTicket } from "./pipelineStages";
import type { ExtractedInstruction } from "./instructionExtraction";

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

/** Normalize a candidate element string for grouping (preserves entity; no re-parsing). */
function normalizeElementKey(candidate: string): string {
  return candidate
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Graph builder (structured input only; no string re-parsing)
// ---------------------------------------------------------------------------

export interface BuildInstructionGraphInput {
  /** Structured instructions from extraction layer; entity is used directly (no re-parsing). */
  structuredInstructions: ExtractedInstruction[];
  context: PipelineContext | null;
  /** Original transcript (kept for compatibility; not used for entity inference). */
  transcript?: string | null;
}

export interface BuildInstructionGraphResult {
  graph: InstructionGraph;
  needsClarification: boolean;
}

/** Treat entity as ungrouped when empty or generic. */
function isUngroupedEntity(entity: string): boolean {
  const t = entity.trim().toLowerCase();
  return !t || t === "unknown" || t === "page" || t === "this";
}

/**
 * Builds the instruction graph from structured extraction output.
 * Uses entity/action/intent/confidence directly — NO string conversion or re-parsing.
 * One extracted instruction → one graph action; same entity → same target node.
 */
export function buildInstructionGraph(input: BuildInstructionGraphInput): BuildInstructionGraphResult {
  const { structuredInstructions } = input;
  const targetMap = new Map<string, ActionNode[]>();

  for (const instruction of structuredInstructions) {
    const entityRaw = instruction.entity.trim();
    const element: string | null = entityRaw && !isUngroupedEntity(entityRaw)
      ? normalizeElementKey(entityRaw)
      : null;
    const key = element ?? "__ungrouped__";

    echlyDebug("GRAPH ENTITY", entityRaw || "(ungrouped)");

    if (!targetMap.has(key)) targetMap.set(key, []);

    targetMap.get(key)!.push({
      action_type: instruction.intent,
      details: { summary: instruction.action.trim() },
      confidence: instruction.confidence,
    });
  }

  const targets: TargetNode[] = [];
  let nullActions: ActionNode[] = [];

  for (const [key, actions] of targetMap) {
    if (key === "__ungrouped__") {
      nullActions = nullActions.concat(actions);
      continue;
    }
    targets.push({ element: key, actions });
  }

  if (nullActions.length > 0) {
    targets.push({ element: null, actions: nullActions });
  }

  const graph: InstructionGraph = { targets };

  const noActionable =
    graph.targets.length === 0 ||
    graph.targets.every((t) => t.actions.every((a) => a.confidence < 0.5));
  const needsClarification = noActionable && structuredInstructions.length > 0;

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
 * Title is generated via generateTicketTitle(entity, actionSteps) for intent-based, short titles.
 */
export function ticketsFromGraph(
  graph: InstructionGraph,
  instructions?: ExtractedInstruction[]
): PipelineTicket[] {
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
  const titleEntity =
    graph.targets[0]?.element ?? instructions?.[0]?.entity?.trim() ?? null;
  const entityStr = (titleEntity ?? primaryTarget).toString().trim() || "layout";
  console.log("ECHLY DEBUG — TITLE GENERATION INPUT:", {
    entity: titleEntity,
    actionSteps,
  });
  const title = generateTicketTitle(entityStr, actionSteps);
  console.log("ECHLY DEBUG — GENERATED TITLE:", title);
  const averageConfidence =
    allActions.reduce((s, a) => s + a.confidence, 0) / allActions.length;

  echlyDebug("TICKET ACTION STEP COUNT", actionSteps.length);
  echlyDebug("ACTION STEPS INCLUDED", actionSteps);

  const ticket: PipelineTicket = {
    title: title.slice(0, 120),
    actionSteps,
    tags: ["Feedback"],
    confidenceScore: Math.max(0, Math.min(1, averageConfidence)),
  };

  return [ticket];
}
