import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireAuth } from "@/lib/server/auth";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { assertWorkspaceActive, WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { echlyDebug } from "@/lib/utils/logger";
import { runFeedbackPipeline } from "@/lib/ai/runFeedbackPipeline";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

/** Stable response shape. One recording → one ticket; tickets[] has one element for compatibility. */
type StructureResponse = {
  success: boolean;
  tickets: Array<Record<string, unknown>>;
  ticket?: { title: string; actionSteps: string[]; confidence: number };
  error?: string;
  clarityScore?: number;
  clarityIssues?: string[];
  suggestedRewrite?: string | null;
  confidence?: number;
  needsClarification?: boolean;
  verificationIssues?: string[];
  verificationWarnings?: string[];
};

/**
 * POST /api/structure-feedback
 *
 * Capture layer: accepts transcript + context (visibleText, nearbyText, domPath, elements, viewport, etc.).
 * All processing is delegated to the central pipeline (lib/ai/runFeedbackPipeline).
 */
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

  try {
    const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    throw err;
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

  echlyDebug("RAW TRANSCRIPT", transcript);

  try {
    const result = await runFeedbackPipeline(client, { transcript, context: body?.context }, {
      useVerification: true,
    });

    echlyDebug("PIPELINE RESULT", { success: result.success, ticketCount: result.tickets?.length ?? 0 });

    return NextResponse.json(result as StructureResponse, { status: 200 });
  } catch (err) {
    console.error("STRUCTURING ERROR:", err);
    return NextResponse.json(
      { success: false, tickets: [], error: "Structuring failed" },
      { status: 200 }
    );
  }
}
