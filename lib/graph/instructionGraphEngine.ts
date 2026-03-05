/**
 * Instruction Graph Engine — Global session-level aggregation of instructions.
 * Builds a graph keyed by ENTITY + INTENT for duplicate detection, clustering,
 * and product insights. Deterministic; no AI. Runs after ticket persistence.
 */

import { doc, runTransaction, type Firestore } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ExtractedInstruction } from "@/lib/server/instructionExtraction";
import type { ExtractionIntent } from "@/lib/server/instructionExtraction";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InstructionNode {
  entity: string;
  intent: ExtractionIntent;
  actions: string[];
  mentionCount: number;
  tickets: string[];
  averageConfidence: number;
}

export interface InstructionGraph {
  sessionId: string;
  nodes: Map<string, InstructionNode>;
}

// ---------------------------------------------------------------------------
// Node key: entity + intent (deterministic clustering)
// ---------------------------------------------------------------------------

/** Normalize entity for stable grouping (lowercase, collapse spaces, trim). */
function normalizeEntityKey(entity: string): string {
  return entity
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

/**
 * Node key = entity + intent. Same entity+intent across tickets clusters together.
 * Example: "hero image:UI_VISUAL_ADJUSTMENT", "signup button:UI_LAYOUT"
 */
export function nodeKey(entity: string, intent: ExtractionIntent): string {
  const normalized = normalizeEntityKey(entity);
  return `${normalized}:${intent}`;
}

// ---------------------------------------------------------------------------
// Firestore layout: instructionGraphs / {sessionId} / nodes / {nodeKey}
// ---------------------------------------------------------------------------

const COLLECTION = "instructionGraphs";
const NODES_SUBCOLLECTION = "nodes";

function nodeRef(firestore: Firestore, sessionId: string, key: string) {
  return doc(firestore, COLLECTION, sessionId, NODES_SUBCOLLECTION, key);
}

/** Firestore document shape for a node (stored fields). */
interface NodeDoc {
  entity: string;
  intent: string;
  mentionCount: number;
  actions: string[];
  tickets: string[];
  averageConfidence: number;
}

function toNodeDoc(node: InstructionNode): NodeDoc {
  return {
    entity: node.entity,
    intent: node.intent,
    mentionCount: node.mentionCount,
    actions: [...node.actions],
    tickets: [...node.tickets],
    averageConfidence: node.averageConfidence,
  };
}

function fromNodeDoc(key: string, data: NodeDoc): InstructionNode {
  return {
    entity: data.entity,
    intent: data.intent as ExtractionIntent,
    actions: Array.isArray(data.actions) ? data.actions : [],
    mentionCount: typeof data.mentionCount === "number" ? data.mentionCount : 0,
    tickets: Array.isArray(data.tickets) ? data.tickets : [],
    averageConfidence:
      typeof data.averageConfidence === "number" ? data.averageConfidence : 0,
  };
}

// ---------------------------------------------------------------------------
// Graph update: merge ticket instructions into session graph
// ---------------------------------------------------------------------------

/**
 * Groups instructions by node key (entity + intent) for a single ticket.
 * Each group gets one node update: mentionCount += group size, actions merged,
 * ticketId added once, averageConfidence recomputed.
 */
function groupInstructionsByNodeKey(
  instructions: ExtractedInstruction[]
): Map<string, ExtractedInstruction[]> {
  const map = new Map<string, ExtractedInstruction[]>();
  for (const inst of instructions) {
    const key = nodeKey(inst.entity, inst.intent);
    console.log("ECHLY DEBUG — GRAPH NODE KEY:", key);
    const list = map.get(key) ?? [];
    list.push(inst);
    map.set(key, list);
  }
  return map;
}

/**
 * Updates the global instruction graph for a session with a new ticket's instructions.
 * Runs asynchronously; safe to call fire-and-forget after ticket persistence.
 * - Increments mentionCount per instruction (grouped by entity+intent).
 * - Appends actions, adds ticketId once per node, recomputes averageConfidence.
 */
export async function updateInstructionGraph(
  sessionId: string,
  ticketId: string,
  instructions: ExtractedInstruction[]
): Promise<void> {
  if (!sessionId || !ticketId || instructions.length === 0) {
    return;
  }

  const groups = groupInstructionsByNodeKey(instructions);
  const firestore = db;

  await runTransaction(firestore, async (tx) => {
    for (const [key, list] of groups) {
      const nodeRefSnap = nodeRef(firestore, sessionId, key);
      const snap = await tx.get(nodeRefSnap);

      const actionTexts = list.map((i) => i.action.trim()).filter(Boolean);
      const confidenceSum = list.reduce((s, i) => s + i.confidence, 0);
      const count = list.length;

      if (!snap.exists()) {
        const newNode: InstructionNode = {
          entity: list[0].entity.trim(),
          intent: list[0].intent,
          actions: actionTexts,
          mentionCount: count,
          tickets: [ticketId],
          averageConfidence: confidenceSum / count,
        };
        tx.set(nodeRefSnap, toNodeDoc(newNode));
        continue;
      }

      const data = snap.data() as NodeDoc;
      const existing = fromNodeDoc(key, data);
      const newMentionCount = existing.mentionCount + count;
      const newActions = [...existing.actions, ...actionTexts];
      const newTickets = existing.tickets.includes(ticketId)
        ? existing.tickets
        : [...existing.tickets, ticketId];
      const newSum =
        existing.averageConfidence * existing.mentionCount + confidenceSum;
      const newAverageConfidence = newSum / newMentionCount;

      const updated: InstructionNode = {
        entity: existing.entity,
        intent: existing.intent,
        actions: newActions,
        mentionCount: newMentionCount,
        tickets: newTickets,
        averageConfidence: newAverageConfidence,
      };
      tx.set(nodeRefSnap, toNodeDoc(updated));
    }
  });
}
