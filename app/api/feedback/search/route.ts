import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import { serializeFeedback } from "@/lib/server/serializeFeedback";
import { getSessionFeedbackSearchCorpusForUserRepo } from "@/lib/repositories/feedbackRepository.server";
import { getAccessContext } from "@/lib/access/getAccessContext";
import { corsHeaders } from "@/lib/server/cors";
import { verifyExtensionToken } from "@/lib/server/extensionAuth";
import { verifyIdToken, type AuthUser } from "@/lib/server/auth";
import { getSessionUser } from "@/lib/server/session";
import { extractShareToken } from "@/lib/server/shareTokenFromRequest";

function unauthorized(): Response {
  return Response.json(
    {
      success: false,
      error: "NOT_AUTHENTICATED",
      message: "User is not authenticated",
    },
    { status: 401 }
  );
}

function missingExtensionToken(): Response {
  return Response.json({ error: "MISSING_EXTENSION_TOKEN" }, { status: 401 });
}

function base64UrlDecodeToString(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function peekJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = base64UrlDecodeToString(parts[1] ?? "");
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (err) {
    console.error("[feedback/search] peekJwtPayload parse failed:", err);
    return null;
  }
}

async function tryRequireAuthFast(req: NextRequest): Promise<AuthUser | null> {
  try {
    return await requireAuthFast(req);
  } catch {
    return null;
  }
}

async function requireAuthFast(req: NextRequest): Promise<AuthUser> {
  const extensionToken = req.headers.get("x-extension-token")?.trim() ?? "";
  const origin = req.headers.get("origin")?.toLowerCase() ?? "";
  const isExtensionRequest = origin.startsWith("chrome-extension://");

  if (isExtensionRequest && !extensionToken) {
    throw missingExtensionToken();
  }

  if (extensionToken) {
    const decoded = await verifyExtensionToken(extensionToken);
    if (!decoded) throw unauthorized();
    return { uid: decoded.uid, email: decoded.email ?? undefined };
  }

  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const payload = peekJwtPayload(token);
    if (payload && payload.type === "extension") {
      const decoded = await verifyExtensionToken(token);
      if (!decoded) throw unauthorized();
      return { uid: decoded.uid, email: decoded.email ?? undefined };
    }
    const decoded = await verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? undefined };
  }

  const sessionUser = await getSessionUser(req);
  if (sessionUser) return { uid: sessionUser.uid, email: sessionUser.email ?? undefined };
  throw unauthorized();
}

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
  const shareTok = extractShareToken(req);
  const authUser = await tryRequireAuthFast(req);
  const user = authUser ?? null;

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId")?.trim() ?? "";
  const queryRaw = searchParams.get("query") ?? "";

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId required" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  try {
    const { access } = await getAccessContext({
      sessionId,
      user: user ? { uid: user.uid, email: user.email ?? null } : null,
      tokenString: shareTok ?? undefined,
    });
    if (!access?.capabilities.canView) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers: corsHeaders(req) }
      );
    }

    const corpus = await getSessionFeedbackSearchCorpusForUserRepo({
      sessionId,
    });

    const needle = queryRaw.trim();
    if (!needle) {
      return NextResponse.json({ feedback: [] }, { headers: corsHeaders(req) });
    }

    const matched = corpus.filter((item) => feedbackMatchesQuery(item, needle));
    matched.sort((a, b) => {
      const ta = createdAtSeconds(a);
      const tb = createdAtSeconds(b);
      if (tb !== ta) return tb - ta;
      return b.id.localeCompare(a.id);
    });

    return NextResponse.json(
      { feedback: matched.map((item) => serializeFeedback(item, access)) },
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("GET /api/feedback/search:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
