import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";
import { getSessionFeedbackSearchCorpusForUserRepo } from "@/lib/repositories/feedbackRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { corsHeaders } from "@/lib/server/cors";
import { verifyExtensionToken } from "@/lib/server/extensionAuth";
import { verifyIdToken, type AuthUser } from "@/lib/server/auth";
import { getSessionUser } from "@/lib/server/session";

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

function serializeFeedbackMinimal(item: Feedback): Record<string, unknown> {
  const createdAt = item.createdAt as { toDate?: () => Date; seconds?: number } | null;
  const createdAtOut =
    createdAt != null && typeof createdAt.toDate === "function"
      ? createdAt.toDate().toISOString()
      : null;

  const lastCommentAt = item.lastCommentAt as { toDate?: () => Date; seconds?: number } | null | undefined;
  const lastCommentAtOut =
    lastCommentAt != null && typeof lastCommentAt.toDate === "function"
      ? { seconds: Math.floor(lastCommentAt.toDate().getTime() / 1000) }
      : lastCommentAt != null && typeof (lastCommentAt as { seconds?: number }).seconds === "number"
        ? { seconds: (lastCommentAt as { seconds: number }).seconds }
        : null;

  const rawStatus =
    typeof (item as { status?: string }).status === "string"
      ? ((item as { status?: string }).status as string)
      : (item as { isResolved?: boolean }).isResolved
        ? "resolved"
        : "open";
  const normalizedStatus = normalizeTicketStatus(rawStatus);

  return {
    id: item.id,
    sessionId: item.sessionId,
    createdAt: createdAtOut,
    title: item.title,
    instruction: item.instruction ?? item.description,
    description: item.description,
    type: item.type,
    actionSteps: item.actionSteps ?? undefined,
    suggestedTags: item.suggestedTags ?? undefined,
    commentCount: typeof item.commentCount === "number" ? item.commentCount : 0,
    lastCommentPreview: item.lastCommentPreview,
    lastCommentAt: lastCommentAtOut ?? undefined,
    status: normalizedStatus,
    isResolved: normalizedStatus === "resolved",
    isDeleted: item.isDeleted ?? false,
    screenshotUrl: item.screenshotUrl ?? null,
    screenshotStatus: item.screenshotStatus ?? null,
  };
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
  let user: AuthUser;
  try {
    user = await requireAuthFast(req);
  } catch (res) {
    const errRes = res as Response;
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
    });
  }

  const userId = user.uid;
  let workspaceId: string;
  try {
    workspaceId = await getUserWorkspaceIdRepo(userId);
  } catch {
    return NextResponse.json(
      { error: "Missing workspaceId" },
      { status: 403, headers: corsHeaders(req) }
    );
  }

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
    const corpus = await getSessionFeedbackSearchCorpusForUserRepo({
      workspaceId,
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
      { feedback: matched.map(serializeFeedbackMinimal) },
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
