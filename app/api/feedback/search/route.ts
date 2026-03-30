import type { NextRequest } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import { serializeFeedback } from "@/lib/server/serializeFeedback";
import { getSessionFeedbackSearchCorpusForUserRepo } from "@/lib/repositories/feedbackRepository.server";
import { corsHeaders } from "@/lib/server/cors";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

function createdAtSeconds(item: Feedback): number {
  const c = item.createdAt as { seconds?: number; toDate?: () => Date } | null;
  if (!c) return 0;
  if (typeof c.seconds === "number") return c.seconds;
  if (typeof c.toDate === "function") return Math.floor(c.toDate().getTime() / 1000);
  return 0;
}

function feedbackMatchesQuery(item: Feedback, needle: string): boolean {
  const q = needle.trim().toLowerCase();
  if (!q) return false;

  const title = (item.title ?? "").toLowerCase();
  if (title.includes(q)) return true;

  const textParts = [
    item.instruction,
    item.description,
    item.suggestion,
    ...(Array.isArray(item.actionSteps) ? item.actionSteps : []),
  ]
    .filter((x): x is string => typeof x === "string" && x.length > 0)
    .join("\n")
    .toLowerCase();
  if (textParts.includes(q)) return true;

  const tags = item.suggestedTags;
  if (Array.isArray(tags)) {
    for (const t of tags) {
      if (typeof t === "string" && t.toLowerCase().includes(q)) return true;
    }
  }

  return false;
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/**
 * GET /api/feedback/search?sessionId=&query=
 * Loads a capped session corpus from Firestore and returns matches (title, text, tags). No pagination.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId")?.trim() ?? "";
  const queryRaw = searchParams.get("query") ?? "";

  if (!sessionId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "sessionId required",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    const built = await tryBuildRequestContext({
      req,
      sessionId,
      optionalAuth: true,
    });
    if (!built.ok) {
      return new Response(built.response.body, {
        status: built.response.status,
        statusText: built.response.statusText,
        headers: { ...Object.fromEntries(built.response.headers), ...corsHeaders(req) },
      });
    }
    const context = built.ctx;
    const access = context.access;
    if (!access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }

    const corpus = await getSessionFeedbackSearchCorpusForUserRepo({
      sessionId,
    });

    const needle = queryRaw.trim();
    if (!needle) {
      return apiSuccess({ feedback: [] }, access, { headers: corsHeaders(req) });
    }

    const matched = corpus.filter((item) => feedbackMatchesQuery(item, needle));
    matched.sort((a, b) => {
      const ta = createdAtSeconds(a);
      const tb = createdAtSeconds(b);
      if (tb !== ta) return tb - ta;
      return b.id.localeCompare(a.id);
    });

    return apiSuccess(
      { feedback: matched.map((item) => serializeFeedback(item, access)) },
      access,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("GET /api/feedback/search:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Server error",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
