import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireAuth } from "@/lib/server/auth";
import { segmentInstructions } from "@/lib/server/instructionSegmentation";
import { refineInstructions } from "@/lib/server/instructionRefinement";
import { mapInstructionsToOntology } from "@/lib/server/instructionOntology";
import { batchIntentAndTicketsFromOntology } from "@/lib/server/pipelineStages";
import { anchorProperNouns } from "@/lib/server/properNounAnchoring";
import { normalizeTranscript } from "@/lib/server/transcriptNormalization";
import { verifyTicketsBatch } from "@/lib/server/ticketVerification";
import type { PipelineContext } from "@/lib/server/pipelineContext";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_INSTRUCTIONS = 12;
const CONFIDENCE_GATE_THRESHOLD = 0.6;

const rateLimitMap = new Map<
  string,
  { count: number; windowStart: number }
>();

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(uid);
  if (!entry) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  return true;
}

/** Normalize request context to PipelineContext (elements from various shapes). */
function normalizeContext(raw: unknown): PipelineContext | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const elements: Array<{ type: string; label?: string | null; text?: string | null; role?: string | null }> = [];
  const push = (arr: unknown) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (item && typeof item === "object" && "type" in item) {
        const t = item as Record<string, unknown>;
        elements.push({
          type: String(t.type ?? ""),
          label: t.label != null ? String(t.label) : null,
          text: t.text != null ? String(t.text) : null,
          role: t.role != null ? String(t.role) : null,
        });
      }
    }
  };
  push(o.elements);
  push(o.visibleElements);
  push(o.interactiveElements);
  push(o.formFields);
  push(o.buttons);
  push(o.headings);

  return {
    url: typeof o.url === "string" ? o.url : undefined,
    viewportWidth: typeof o.viewportWidth === "number" ? o.viewportWidth : undefined,
    viewportHeight: typeof o.viewportHeight === "number" ? o.viewportHeight : undefined,
    domPath: o.domPath != null && typeof o.domPath === "string" ? o.domPath : null,
    nearbyText: o.nearbyText != null && typeof o.nearbyText === "string" ? o.nearbyText : null,
    visibleText: o.visibleText != null && typeof o.visibleText === "string" ? o.visibleText : null,
    elements: elements.length > 0 ? elements : undefined,
    visibleElements: elements.length > 0 ? elements : undefined,
  };
}

/** Stable response shape. Never return {} or raw AI output. */
type StructureResponse = {
  success: boolean;
  tickets: Array<Record<string, unknown>>;
  error?: string;
  clarityScore?: number;
  clarityIssues?: string[];
  suggestedRewrite?: string | null;
  confidence?: number;
  needsClarification?: boolean;
  verificationIssues?: string[];
  /** Warnings for tickets that failed verification (partial verification). */
  verificationWarnings?: string[];
  /** When instructions were truncated to max. */
  instructionLimitWarning?: string | null;
  intent?: {
    intentType: string;
    targetElement: string | null;
    changeCategory: string;
    problemSummary: string;
    confidence: number;
  };
};

export async function POST(req: Request): Promise<Response> {
  const stableFailure = (error: string): NextResponse<StructureResponse> =>
    NextResponse.json({ success: false, tickets: [], error }, { status: 200 });

  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  if (!checkRateLimit(user.uid)) {
    return NextResponse.json(
      { success: false, tickets: [], error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { success: false, tickets: [], error: "Missing OpenAI API key" },
      { status: 200 }
    );
  }

  let body: { transcript?: unknown; context?: unknown };
  try {
    body = await req.json();
    if (process.env.NODE_ENV !== "production") {
      console.log("[STRUCTURE] transcript present:", !!body?.transcript);
      console.log("[STRUCTURE] context keys:", body?.context && typeof body.context === "object" ? Object.keys(body.context as object) : []);
    }
  } catch {
    return stableFailure("Invalid request body");
  }
  const transcript = body?.transcript;
  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json(
      { success: false, tickets: [], error: "No valid transcript provided" },
      { status: 200 }
    );
  }

  console.log("ECHLY DEBUG — TRANSCRIPT RECEIVED:", transcript);
  console.log("ECHLY DEBUG — CONTEXT RECEIVED:", body?.context ?? null);

  const ctx = normalizeContext(body?.context);
  const originalTranscript = transcript;
  const correctedTranscript = anchorProperNouns(
    originalTranscript,
    ctx?.visibleText ?? null
  );

  // ——— Transcript cleanup: fix STT/grammar before segmentation ———
  const normalizedTranscript = await normalizeTranscript(client, correctedTranscript, { retryOnce: true });

  console.log("ECHLY DEBUG — CORRECTED TRANSCRIPT:", correctedTranscript);
  console.log("ECHLY DEBUG — NORMALIZED TRANSCRIPT:", normalizedTranscript);

  try {
    // ——— Stage 1: Instruction segmentation (with context, gpt-4o, retry) ———
    const {
      instructions: segmentedInstructions,
      needsClarification: segmentNeedsClarification,
      confidence: segmentConfidence,
    } = await segmentInstructions(client, normalizedTranscript, ctx, { retryOnce: true });

    if (segmentNeedsClarification || segmentedInstructions.length === 0) {
      return NextResponse.json({
        success: true,
        tickets: [],
        needsClarification: true,
        verificationIssues: ["Vague or unclear feedback. Please specify what to change (e.g. which element and what to change)."],
        clarityScore: 0,
        clarityIssues: ["Feedback too vague to create a ticket"],
        suggestedRewrite: "Please specify what you'd like to change (e.g. which element and what to change).",
        confidence: 0,
      });
    }

    // ——— Stage 2: Instruction refinement ———
    const { instructions: refinedInstructions } = await refineInstructions(client, segmentedInstructions);
    let instructions = refinedInstructions;

    // ——— Instruction limit: max 12 ———
    let instructionLimitWarning: string | null = null;
    if (instructions.length > MAX_INSTRUCTIONS) {
      instructionLimitWarning = `Only the first ${MAX_INSTRUCTIONS} instructions were processed. ${instructions.length - MAX_INSTRUCTIONS} were skipped.`;
      instructions = instructions.slice(0, MAX_INSTRUCTIONS);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[STRUCTURE] Refined instructions:", instructions.length, instructionLimitWarning ?? "");
    }

    // ——— Stage 3: Instruction → Ontology Mapping (NEW) ———
    const ontologyResult = await mapInstructionsToOntology(client, instructions, ctx, { retryOnce: true });

    // ——— Stages 4–5: Intent + single merged ticket from ontology (with context, retry on parse) ———
    const { intents: _intents, tickets: pipelineTickets } = await batchIntentAndTicketsFromOntology(
      client,
      ontologyResult.actions,
      ctx,
      { instructions, retryOnce: true }
    );

    if (pipelineTickets.length === 0) {
      return NextResponse.json({
        success: true,
        tickets: [],
        needsClarification: true,
        verificationIssues: ["Could not generate tickets from instructions."],
        clarityScore: 0,
        clarityIssues: [],
        suggestedRewrite: null,
        confidence: 0.5,
      });
    }

    // ——— Stage 5: Verification (single ticket; retry once) ———
    const verifications = await verifyTicketsBatch(
      client,
      normalizedTranscript,
      instructions,
      pipelineTickets,
      { retryOnce: true }
    );

    // ——— Partial verification: keep only tickets that pass ———
    const validIndices: number[] = [];
    const verificationWarnings: string[] = [];
    verifications.forEach((v, i) => {
      const pass = v.isAccurate && v.isActionable && !v.needsClarification;
      if (pass) validIndices.push(i);
      else verificationWarnings.push(`Ticket ${i + 1} (${pipelineTickets[i]?.title ?? "?"}): did not pass verification`);
    });

    const validTickets = validIndices.map((i) => pipelineTickets[i]);
    const validVerifications = validIndices.map((i) => verifications[i]);

    // ——— All tickets failed verification → needsClarification ———
    if (validTickets.length === 0 && pipelineTickets.length > 0) {
      return NextResponse.json({
        success: true,
        tickets: [],
        needsClarification: true,
        verificationIssues: ["No tickets passed verification."],
        verificationWarnings: verificationWarnings.length > 0 ? verificationWarnings : undefined,
        clarityScore: 0,
        clarityIssues: verificationWarnings,
        suggestedRewrite: "Please rephrase your feedback so we can create an actionable ticket.",
        confidence: Math.min(...verifications.map((v) => v.confidence)),
      });
    }

    // ——— Confidence gate: if overall confidence low, return needsClarification ———
    const minTicketConfidence = validTickets.length > 0
      ? Math.min(...validTickets.map((t) => t.confidenceScore))
      : 1;
    const minVerificationConfidence = validVerifications.length > 0
      ? Math.min(...validVerifications.map((v) => v.confidence))
      : 1;
    const overallConfidence = Math.min(
      segmentConfidence,
      minTicketConfidence,
      minVerificationConfidence
    );

    if (overallConfidence < CONFIDENCE_GATE_THRESHOLD && validTickets.length > 0) {
      return NextResponse.json({
        success: true,
        tickets: [],
        needsClarification: true,
        verificationIssues: ["Confidence too low to return tickets. Please rephrase for clarity."],
        verificationWarnings: verificationWarnings.length > 0 ? verificationWarnings : undefined,
        clarityScore: Math.round(overallConfidence * 100),
        clarityIssues: ["Low confidence in interpretation"],
        suggestedRewrite: "Please rephrase your feedback so we can create an actionable ticket.",
        confidence: overallConfidence,
      });
    }

    // Return only valid tickets; include warnings for any that failed
    const valid = validTickets.map((t) => ({
      title: t.title,
      description: t.description,
      actionSteps: t.actionSteps,
      suggestedTags: t.tags,
      confidenceScore: t.confidenceScore,
    }));

    const minConfidence =
      validVerifications.length > 0
        ? Math.min(...validVerifications.map((v) => v.confidence))
        : overallConfidence;

    const ontologyNeedsClarification = ontologyResult.needsClarification === true;

    console.log("ECHLY DEBUG — FINAL TICKETS RETURNED:", valid);

    return NextResponse.json({
      success: true,
      tickets: valid,
      clarityScore: Math.round((valid.length > 0 ? minConfidence : overallConfidence) * 100),
      clarityIssues: ontologyNeedsClarification ? ["Some instructions had low mapping confidence"] : [],
      suggestedRewrite: null,
      confidence: valid.length > 0 ? minConfidence : overallConfidence,
      needsClarification: ontologyNeedsClarification ? true : undefined,
      verificationWarnings: verificationWarnings.length > 0 ? verificationWarnings : undefined,
      instructionLimitWarning: instructionLimitWarning ?? undefined,
    });
  } catch (err) {
    console.error("STRUCTURING ERROR:", err);
    return NextResponse.json(
      { success: false, tickets: [], error: "Structuring failed" },
      { status: 200 }
    );
  }
}
