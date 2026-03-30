import type { NextRequest } from "next/server";
import OpenAI from "openai";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { resolveWorkspaceForUser } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_MESSAGE } from "@/lib/server/assertWorkspaceActive";
import { runFeedbackPipeline } from "@/lib/ai/runFeedbackPipeline";
import { corsHeaders } from "@/lib/server/cors";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { NextResponse } from "next/server";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

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

/**
 * POST /api/structure-feedback
 *
 * Capture layer: accepts transcript + context (visibleText, nearbyText, domPath, elements, viewport, etc.).
 * All processing is delegated to the central pipeline (lib/ai/runFeedbackPipeline).
 */
export async function POST(req: NextRequest): Promise<Response> {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    const errRes = toAuthorizationResponse(err);
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
    });
  }
  if (!checkRateLimit(user.uid)) {
    return apiError({
      code: "FORBIDDEN",
      message: "Rate limit exceeded. Try again later.",
      status: 429,
      data: { tickets: [] },
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    await resolveWorkspaceForUser(user.uid);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return apiError({
        code: "FORBIDDEN",
        message: WORKSPACE_SUSPENDED_MESSAGE,
        status: 403,
        data: { tickets: [] },
        init: { headers: corsHeaders(req) },
      });
    }
    throw err;
  }

  let client: OpenAI;
  try {
    client = getOpenAIClient();
  } catch {
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Missing OpenAI API key",
      status: 200,
      data: { tickets: [] },
      init: { headers: corsHeaders(req) },
    });
  }

  let body: { transcript?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid request body",
      status: 200,
      data: { tickets: [] },
      init: { headers: corsHeaders(req) },
    });
  }
  const transcript = body?.transcript;
  if (!transcript || typeof transcript !== "string") {
    return apiError({
      code: "INVALID_INPUT",
      message: "No valid transcript provided",
      status: 200,
      data: { tickets: [] },
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    const result = await runFeedbackPipeline(client, { transcript, context: body?.context });

    console.log("[PHASE3_FINAL]", {
      fields: Object.keys(result.tickets?.[0] || {}),
    });
    console.log("[PHASE3_READY]", {
      status: "clean",
      readyForPhase4: true,
    });

    return apiSuccess(
      {
        tickets: result.tickets ?? [],
        structuredSuccess: result.success,
      },
      null,
      { headers: corsHeaders(req), status: 200 }
    );
  } catch (err) {
    console.error("STRUCTURING ERROR:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "AI pipeline failed",
      status: 500,
      data: { tickets: [] },
      init: { headers: corsHeaders(req) },
    });
  }
}
