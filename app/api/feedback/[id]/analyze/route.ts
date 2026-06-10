/**
 * POST /api/feedback/[id]/analyze — lazy, on-first-view AI Analysis.
 *
 * Generates a read-only second opinion for a ticket (summary + likely cause/fix)
 * and caches it back on feedback/{id}. The dashboard fires this when it opens a
 * ticket that has no analysis yet; the existing realtime listener
 * (feedbackStore.mapFeedbackFromSnap) streams the result into the open ticket so
 * the AI panel fills in a beat later.
 *
 * DELIBERATELY SEPARABLE: owns its own runtime/maxDuration, never touches the
 * ticket-create path, capture, or the human-facing priority/pageArea fields, and
 * can be deleted wholesale without affecting create. Any failure leaves the
 * ticket untouched and the panel shows a graceful "unavailable" state.
 */

import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { buildRequestContext } from "@/lib/server/requestContext";
import { getFeedbackByIdRepo } from "@/lib/repositories/feedbackRepository.server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { checkAiAnalyzeRateLimit } from "@/lib/ai/rateLimit";
import { checkAiQuota, incrementAiQuotaAsync } from "@/lib/ai/quotaCheck";
import { assembleAnalysisContext } from "@/lib/ai/assembleAnalysisContext";
import { ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/analysisPrompt";
import { PENDING_STALE_MS } from "@/lib/ai/analysisConstants";
import type { Feedback } from "@/lib/domain/feedback";

export const runtime = "nodejs";
// Platform allowance is 60s (Vercel Hobby caps function maxDuration at 60s —
// see api/cron/activity-digest/route.ts). We raise from 30 → 60 to give the
// in-process call timeout (MODEL_CALL_TIMEOUT_MS, ~22s) a wide margin: the call
// ALWAYS aborts itself and reaches the catch (writing terminal "error") long
// before the platform would kill the function mid-flight. The previous 30s with
// no per-call timeout was the root cause of the "stuck on pending" bug — a slow
// signal-heavy call got platform-killed between the "pending" write and the
// catch, so status:"error" was never written.
export const maxDuration = 60;

/** Model for AI Analysis. Named constant so it's bumpable in one place. */
export const AI_ANALYSIS_MODEL = "gpt-5.4-nano";

/**
 * Hard ceiling for a SINGLE model call. Must sit comfortably under maxDuration so
 * the call aborts itself IN-PROCESS (throwing a catchable error → the catch writes
 * "error") rather than the platform killing the whole function. 22s under a 60s
 * function budget leaves ~38s of headroom for the error-status write and response.
 */
const MODEL_CALL_TIMEOUT_MS = 22 * 1000; // 22s

/** A successful (complete/no_fault) analysis is reused for this long. */
const ANALYSIS_FRESH_MS = 24 * 60 * 60 * 1000; // 24h
// PENDING_STALE_MS lives in lib/ai/analysisConstants (shared with the dashboard
// client so the stale-pending reclaim and the client retry agree on the threshold).

type AnalysisStatus = NonNullable<Feedback["aiAnalysisStatus"]>;

interface AnalysisResult {
  aiSummary: string | null;
  aiFixSuggestion: string | null;
  aiConfidence: number | null;
  aiAnalysisStatus: AnalysisStatus;
}

/** Strict JSON schema for the model's output (voiceToTicketPipeline pattern). */
const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    aiSummary: { type: "string" },
    aiFixSuggestion: { type: "string" },
    aiConfidence: { type: "number" },
  },
  required: ["aiSummary", "aiFixSuggestion", "aiConfidence"],
} as const;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Epoch-ms of an Admin Timestamp / Date / {seconds} value, else 0. */
function toMillis(value: unknown): number {
  if (value == null) return 0;
  const v = value as { toMillis?: () => number; toDate?: () => Date; seconds?: number };
  if (typeof v.toMillis === "function") return v.toMillis();
  if (typeof v.toDate === "function") return v.toDate().getTime();
  if (typeof v.seconds === "number") return v.seconds * 1000;
  if (value instanceof Date) return value.getTime();
  return 0;
}

/**
 * True when an existing analysis is a SUCCESS recent enough to reuse. Note
 * "error" is intentionally NOT fresh — a transient failure must be retryable on
 * a later view (the client re-fires when it sees an "error" status), so we let
 * the lock claim re-run it.
 */
function isFreshSuccess(status: unknown, generatedAtMs: number, now: number): boolean {
  if (status !== "complete" && status !== "no_fault") return false;
  if (generatedAtMs === 0) return true; // terminal success but no stamp — don't loop
  return now - generatedAtMs < ANALYSIS_FRESH_MS;
}

type LockOutcome =
  | { kind: "claimed" }
  | { kind: "cached"; status: AnalysisStatus }
  | { kind: "inflight" };

/**
 * Atomically claim the analysis lock for this feedback doc. Inside one
 * transaction we re-read status and decide:
 *  - fresh complete/no_fault → "cached" (caller returns it, no model call)
 *  - fresh "pending" (another open is analyzing) → "inflight" (caller bails)
 *  - anything else (null / error / stale pending) → write "pending" and "claimed"
 * This closes the TOCTOU race for BOTH the fault and no-fault paths: only the
 * request that writes "pending" inside the txn proceeds.
 */
async function claimAnalysisLock(id: string, now: number): Promise<LockOutcome> {
  const ref = adminDb.doc(`feedback/${id}`);
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = (snap.data() ?? {}) as Record<string, unknown>;
    const status = data.aiAnalysisStatus;
    const generatedAtMs = toMillis(data.aiGeneratedAt);

    if (isFreshSuccess(status, generatedAtMs, now)) {
      return { kind: "cached", status: status as AnalysisStatus };
    }
    if (status === "pending" && now - generatedAtMs < PENDING_STALE_MS) {
      return { kind: "inflight" };
    }
    tx.set(
      ref,
      { aiAnalysisStatus: "pending", aiGeneratedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    return { kind: "claimed" };
  });
}

/** Template message for a report with no technical fault (no model call needed). */
function buildNoFaultResult(feedback: Feedback): AnalysisResult {
  const desc =
    typeof feedback.description === "string" ? feedback.description.trim() : "";
  const summary = desc
    ? `This report describes: ${desc.slice(0, 280)}${desc.length > 280 ? "…" : ""}`
    : "This report has no captured technical signals to analyze.";
  return {
    aiSummary: summary,
    aiFixSuggestion:
      "No console or network errors and no uncaught exceptions were captured in the recorded window — this appears to be a usability or design observation rather than a code defect. Treat it as product/UX feedback: review the described experience against the intended design rather than looking for a bug to fix.",
    aiConfidence: null,
    aiAnalysisStatus: "no_fault",
  };
}

function sanitizeOut(s: unknown, max: number): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

function clampConfidence(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Math.max(0, Math.min(1, n));
}

/**
 * One OpenAI call → strict JSON. Throws on transport/parse failure (caller maps
 * to "error").
 *
 * The call is hard-bounded by MODEL_CALL_TIMEOUT_MS so a slow signal-heavy ticket
 * ABORTS IN-PROCESS (an AbortError thrown here, caught by POST's catch → terminal
 * "error" written) instead of running until the platform kills the whole function
 * — which would freeze the doc at "pending" forever. Belt-and-suspenders:
 *   - signal: our AbortController fires at the deadline.
 *   - timeout: the SDK's own per-request deadline (same value) as a backstop.
 *   - maxRetries: 0 so one slow attempt is terminal — the SDK default (2 retries)
 *     would otherwise stack ~3× the wall time and blow past the function budget.
 */
async function runModelAnalysis(
  client: OpenAI,
  contextText: string
): Promise<AnalysisResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODEL_CALL_TIMEOUT_MS);
  let completion;
  try {
    completion = await client.chat.completions.create(
      {
        model: AI_ANALYSIS_MODEL,
        temperature: 0.2,
        max_completion_tokens: 600,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "ticket_analysis",
            schema: ANALYSIS_JSON_SCHEMA as Record<string, unknown>,
            strict: true,
          },
        },
        messages: [
          { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
          { role: "user", content: contextText },
        ],
      },
      { signal: controller.signal, timeout: MODEL_CALL_TIMEOUT_MS, maxRetries: 0 }
    );
  } finally {
    clearTimeout(timer);
  }

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const parsed = JSON.parse(raw) as {
    aiSummary?: unknown;
    aiFixSuggestion?: unknown;
    aiConfidence?: unknown;
  };
  const aiSummary = sanitizeOut(parsed.aiSummary, 600);
  const aiFixSuggestion = sanitizeOut(parsed.aiFixSuggestion, 2000);
  if (!aiSummary || !aiFixSuggestion) {
    throw new Error("Model returned empty analysis fields");
  }
  return {
    aiSummary,
    aiFixSuggestion,
    aiConfidence: clampConfidence(parsed.aiConfidence),
    aiAnalysisStatus: "complete",
  };
}

/** Write the terminal analysis back to feedback/{id}. ai* fields only. */
async function writeAnalysis(id: string, result: AnalysisResult): Promise<void> {
  await adminDb.doc(`feedback/${id}`).set(
    {
      aiSummary: result.aiSummary,
      aiFixSuggestion: result.aiFixSuggestion,
      aiConfidence: result.aiConfidence,
      aiAnalysisStatus: result.aiAnalysisStatus,
      aiGeneratedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/** Terminal error analysis (null summary/fix → panel shows the graceful state). */
function errorResult(): AnalysisResult {
  return {
    aiSummary: null,
    aiFixSuggestion: null,
    aiConfidence: null,
    aiAnalysisStatus: "error",
  };
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  // ---- Identity ----
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    console.error("[TEMP-DIAG][route] NO AUTH — requireAuth threw:", err); // TEMP-DIAG REMOVE
    return toAuthorizationResponse(err);
  }

  const { id } = await ctx.params;
  const feedbackId = typeof id === "string" ? id.trim() : "";
  console.log("[TEMP-DIAG][route] ENTRY", JSON.stringify({ feedbackId, uid: user.uid })); // TEMP-DIAG REMOVE
  if (!feedbackId) {
    return json({ error: "Missing feedback id" }, 400);
  }

  // ---- Load + access check (same pattern as GET /api/tickets/[id]) ----
  let feedback: Feedback | null;
  try {
    feedback = await getFeedbackByIdRepo(feedbackId);
  } catch (err) {
    console.error("[TEMP-DIAG][route] getFeedbackByIdRepo THREW:", err); // TEMP-DIAG REMOVE
    console.error("[analyze] load failed:", err);
    return json({ error: "Server error" }, 500);
  }
  // TEMP-DIAG: confirm the doc loaded AND carries the fields the listener query
  // filters on — if sessionId/workspaceId are missing here the write would drop
  // the doc out of the listener's window. REMOVE.
  console.log(
    "[TEMP-DIAG][route] getFeedbackByIdRepo done",
    JSON.stringify({
      found: !!feedback,
      sessionId: feedback?.sessionId ?? null,
      workspaceId: feedback?.workspaceId ?? null,
      aiAnalysisStatus: feedback?.aiAnalysisStatus ?? null,
    })
  );
  if (!feedback) {
    return json({ error: "Not found" }, 404);
  }

  let canView = false;
  try {
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      feedbackId,
      feedback,
      session: null,
    });
    canView = context.access?.capabilities.canView === true;
  } catch (err) {
    return toAuthorizationResponse(err);
  }
  if (!canView) {
    return json({ error: "You do not have access" }, 403);
  }

  // ---- Fast idempotency: reuse a fresh successful analysis without gating ----
  const now = Date.now();
  if (isFreshSuccess(feedback.aiAnalysisStatus, toMillis(feedback.aiGeneratedAt), now)) {
    return json({
      status: feedback.aiAnalysisStatus,
      cached: true,
      aiSummary: feedback.aiSummary ?? null,
      aiFixSuggestion: feedback.aiFixSuggestion ?? null,
      aiConfidence: feedback.aiConfidence ?? null,
    });
  }

  // ---- Gating: rateLimit → quota → (blocked? graceful, status unchanged) ----
  const rate = checkAiAnalyzeRateLimit(user.uid);
  if (!rate.allowed) {
    // Leave status as-is so a later view retries once the window resets.
    return json(
      { status: "rate_limited", retryAfterSeconds: rate.retryAfterSeconds },
      429
    );
  }
  try {
    const quota = await checkAiQuota(user.uid);
    if (!quota.allowed) {
      return json({ status: "quota_exceeded" }, 429);
    }
  } catch (err) {
    // Quota check failure must not block analysis (matches improve route).
    console.error("[analyze] quota check failed:", err);
  }

  // ---- Atomic lock claim (closes the TOCTOU race for both paths) ----
  let lock: LockOutcome;
  try {
    lock = await claimAnalysisLock(feedbackId, now);
  } catch (err) {
    console.error("[TEMP-DIAG][route] claimAnalysisLock THREW:", err); // TEMP-DIAG REMOVE
    console.error("[analyze] lock claim failed:", err);
    return json({ error: "Server error" }, 500);
  }
  console.log("[TEMP-DIAG][route] lock claimed", JSON.stringify({ kind: lock.kind })); // TEMP-DIAG REMOVE
  if (lock.kind === "cached") {
    return json({
      status: lock.status,
      cached: true,
      aiSummary: feedback.aiSummary ?? null,
      aiFixSuggestion: feedback.aiFixSuggestion ?? null,
      aiConfidence: feedback.aiConfidence ?? null,
    });
  }
  if (lock.kind === "inflight") {
    // Another open is already analyzing — don't double-fire the model.
    return json({ status: "pending", inflight: true });
  }
  // lock.kind === "claimed": we own the analysis; status is now "pending".

  // ---- Assemble correlated context (Part 2) ----
  const { contextText, hasAnchors } = assembleAnalysisContext(feedback);
  console.log(
    "[TEMP-DIAG][route] branch",
    JSON.stringify({ hasAnchors, branch: hasAnchors ? "FAULT (model call)" : "NO_FAULT (template)" })
  ); // TEMP-DIAG REMOVE

  // ---- No-fault path: template the message, NO model call, NO quota charge ----
  // (Zero OpenAI cost — charging quota would mischarge the user.)
  if (!hasAnchors) {
    const result = buildNoFaultResult(feedback);
    try {
      console.log("[TEMP-DIAG][route] writing status=no_fault to feedback/" + feedbackId); // TEMP-DIAG REMOVE
      await writeAnalysis(feedbackId, result);
      console.log("[TEMP-DIAG][route] no_fault write RESOLVED"); // TEMP-DIAG REMOVE
    } catch (err) {
      console.error("[analyze] no-fault write failed:", err);
      await writeAnalysis(feedbackId, errorResult()).catch(() => {});
      return json({ status: "error" });
    }
    return json({
      status: result.aiAnalysisStatus,
      aiSummary: result.aiSummary,
      aiFixSuggestion: result.aiFixSuggestion,
      aiConfidence: result.aiConfidence,
    });
  }

  // ---- Fault path: one model call → write back; increment quota on success ----
  let client: OpenAI;
  try {
    client = getOpenAIClient();
  } catch (err) {
    console.error("[analyze] OpenAI client init failed:", err);
    await writeAnalysis(feedbackId, errorResult()).catch(() => {});
    return json({ status: "error" });
  }

  try {
    console.log("[TEMP-DIAG][route] model call start"); // TEMP-DIAG REMOVE
    const _t0 = Date.now(); // TEMP-DIAG REMOVE
    const result = await runModelAnalysis(client, contextText);
    console.log("[TEMP-DIAG][route] model call done in", Date.now() - _t0, "ms"); // TEMP-DIAG REMOVE
    console.log("[TEMP-DIAG][route] writing status=" + result.aiAnalysisStatus + " to feedback/" + feedbackId); // TEMP-DIAG REMOVE
    await writeAnalysis(feedbackId, result);
    console.log("[TEMP-DIAG][route] success write RESOLVED"); // TEMP-DIAG REMOVE
    incrementAiQuotaAsync(user.uid);
    return json({
      status: result.aiAnalysisStatus,
      aiSummary: result.aiSummary,
      aiFixSuggestion: result.aiFixSuggestion,
      aiConfidence: result.aiConfidence,
    });
  } catch (err) {
    // Any failure (model error, timeout, parse fail) → graceful "error" status.
    // The ticket itself is never affected; the panel shows "analysis unavailable".
    // "error" is NOT cached as fresh, so a later view retries.
    console.error("[TEMP-DIAG][route] model/generation FAILED:", err); // TEMP-DIAG REMOVE
    console.error("[analyze] generation failed:", err);
    console.log("[TEMP-DIAG][route] writing status=error to feedback/" + feedbackId); // TEMP-DIAG REMOVE
    await writeAnalysis(feedbackId, errorResult())
      .then(() => console.log("[TEMP-DIAG][route] error write RESOLVED")) // TEMP-DIAG REMOVE
      .catch((e) =>
        console.error("[analyze] error-status write failed:", e)
      );
    return json({ status: "error" });
  }
}
