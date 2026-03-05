/**
 * Instruction Graph Layer — Groups instructions by UI target and preserves
 * multiple actions per element. Builds the graph deterministically from extraction output.
 * Ticket generation: one ticket per entity (target); entities that differ significantly
 * produce separate tickets (e.g. hero section, signup button, footer → three tickets).
 * Titles are not set here; runStructuringLayer assigns them via generateTicketTitlesBatch.
 */

import { echlyDebug } from "@/lib/utils/logger";
import type { PipelineContext } from "./pipelineContext";
import type { PipelineTicket } from "./pipelineStages";
import type { ExtractedInstruction } from "./instructionExtraction";

const MAX_TITLE_LENGTH = 60;

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
// Ticket generation from graph (one ticket per entity/target)
// ---------------------------------------------------------------------------

/**
 * Converts the instruction graph to pipeline tickets: one ticket per target (entity).
 * Returns tickets WITHOUT generated titles (placeholder used); runStructuringLayer
 * assigns titles in a single batch call via generateTicketTitlesBatch.
 */
export function ticketsFromGraph(
  graph: InstructionGraph,
  _instructions?: ExtractedInstruction[]
): PipelineTicket[] {
  const tickets: PipelineTicket[] = [];

  for (const node of graph.targets) {
    const actionsForTarget: Array<{ summary: string; confidence: number }> = [];
    for (const a of node.actions) {
      if (a.action_type === "UNKNOWN" || a.confidence < 0.5) continue;
      const summary =
        (a.details && typeof (a.details as { summary?: string }).summary === "string")
          ? (a.details as { summary: string }).summary.trim()
          : "";
      const step = summary.length > 0 ? summary : a.action_type;
      if (step.length > 0) actionsForTarget.push({ summary: step, confidence: a.confidence });
    }

    if (actionsForTarget.length === 0) continue;

    const actionSteps = actionsForTarget.map((a) => a.summary);
    const averageConfidence =
      actionsForTarget.reduce((s, a) => s + a.confidence, 0) / actionsForTarget.length;
    const placeholderTitle =
      actionSteps[0]?.slice(0, MAX_TITLE_LENGTH).trim() ?? "Requested UI changes";

    echlyDebug("TICKET PER ENTITY", {
      element: node.element,
      actionStepCount: actionSteps.length,
    });

    tickets.push({
      title: placeholderTitle,
      actionSteps,
      tags: ["Feedback"],
      confidenceScore: Math.max(0, Math.min(1, averageConfidence)),
    });
  }

  return tickets;
}
