import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  addFeedbackWithSessionCountersRepo,
  getFeedbackByIdRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import {
  getScreenshotByIdRepo,
} from "@/lib/repositories/screenshotsRepository";
import { generateTicketTitle } from "@/lib/tickets/generateTicketTitle";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { corsHeaders } from "@/lib/server/cors";
import { verifyExtensionToken } from "@/lib/server/extensionAuth";
import { verifyIdToken, type AuthUser } from "@/lib/server/auth";
import { getSessionUser } from "@/lib/server/session";
import "@/lib/server/firebaseAdmin";
import { getStorage } from "firebase-admin/storage";
import { assert, ECHLY_STRICT_MODE } from "@/lib/guardrails";


function unauthorized(): Response {
  return Response.json(
    {
      success: false,
      error: "NOT_AUTHENTICATED",
      message: "User is not authenticated",
    },
    {
      status: 401,
    }
  );
}

function missingExtensionToken(): Response {
  return Response.json(
    { error: "MISSING_EXTENSION_TOKEN" },
    {
      status: 401,
    }
  );
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
    console.error("[feedback] peekJwtPayload parse failed:", err);
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

async function resolveWorkspaceByIdCached(workspaceId: string): Promise<{ workspace: unknown }> {
  const { workspace } = await resolveWorkspaceById(workspaceId);
  return { workspace };
}

async function resolveScreenshotDownloadUrl(
  screenshotId: string,
  sessionId: string
): Promise<string | null> {
  const screenshotRecord = await getScreenshotByIdRepo(screenshotId);

  const storagePathRaw =
    typeof screenshotRecord?.storagePath === "string"
      ? screenshotRecord.storagePath.trim()
      : "";

  const fallbackStoragePath = `sessions/${sessionId}/screenshots/${screenshotId}.png`;

  const storagePath =
    storagePathRaw.length > 0 ? storagePathRaw : fallbackStoragePath;

  try {
    const bucket = getStorage().bucket();

    const file = bucket.file(storagePath);

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return url;
  } catch (err) {
    console.error("[feedback lifecycle] failed to resolve screenshot URL", {
      screenshotId,
      sessionId,
      storagePath,
      hasScreenshotRecord: !!screenshotRecord,
      error: err,
    });
    return null;
  }
}

/** POST /api/feedback — create feedback (ticket) for a session. Returns same shape as GET /api/tickets/:id. */
export async function POST(req: NextRequest) {
  let user;
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

  let body: {
    sessionId?: string;
    feedbackId?: string;
    title?: string;
    instruction?: string;
    suggestion?: string;
    contextSummary?: string;
    actionSteps?: string[];
    suggestedTags?: string[];
    metadata?: {
      url?: string;
      viewportWidth?: number;
      viewportHeight?: number;
      userAgent?: string;
      clientTimestamp?: number;
    };
    screenshotId?: string;
    status?: string;
  } = {};

  try {
    body = await req.json();
  } catch (err) {
    console.error("[feedback] invalid JSON body:", err);
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const incomingStatusRaw =
    typeof body.status === "string" ? body.status.trim().toLowerCase() : "open";
  if (incomingStatusRaw === "failed") {
    return NextResponse.json(
      { success: false, error: "invalid status" },
      { status: 400, headers: corsHeaders(req) }
    );
  }
  if (
    incomingStatusRaw !== "open" &&
    incomingStatusRaw !== "resolved" &&
    incomingStatusRaw !== "processing"
  ) {
    return NextResponse.json(
      { success: false, error: "invalid status" },
      { status: 400, headers: corsHeaders(req) }
    );
  }
  type FeedbackStatus = "open" | "resolved" | "processing";
  const incomingStatus = incomingStatusRaw as FeedbackStatus;
  const normalizedIncomingStatus: FeedbackStatus =
    incomingStatus === "processing" ? "open" : incomingStatus;

  const feedbackId = body?.feedbackId;
  if (!feedbackId) {
    console.warn("[IDEMPOTENCY WARNING] Missing feedbackId in request", {
      time: new Date().toISOString(),
      route: "/api/feedback",
      bodyKeys: Object.keys(body || {}),
    });
  }
  if (feedbackId && typeof feedbackId !== "string") {
    console.warn("[IDEMPOTENCY WARNING] Invalid feedbackId type", {
      feedbackId,
      type: typeof feedbackId,
    });
  }
  if (typeof feedbackId === "string" && feedbackId.startsWith("fb-")) {
    console.warn("[IDEMPOTENCY NOTICE] Fallback ID detected (non-UUID)", {
      feedbackId,
    });
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  const feedbackIdRaw =
    typeof body.feedbackId === "string" ? body.feedbackId.trim() : "";
  const normalizedFeedbackId =
    feedbackIdRaw.length > 0 ? feedbackIdRaw : undefined;
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "sessionId is required" },
      { status: 400, headers: corsHeaders(req) }
    );
  }
  const actionSteps =
    Array.isArray(body.actionSteps)
      ? body.actionSteps.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map((s) => s.trim())
      : [];
  const title =
    actionSteps.length > 0
      ? generateTicketTitle(actionSteps)
      : (typeof body.title === "string" ? body.title.trim() : "");
  if (!title) {
    return NextResponse.json(
      { success: false, error: "title is required (or provide actionSteps)" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const screenshotIdRaw =
    typeof body.screenshotId === "string" ? body.screenshotId.trim() : "";
  const hasScreenshotId = screenshotIdRaw.length > 0;
  const normalizedScreenshotId = hasScreenshotId ? screenshotIdRaw : "";
  if (!hasScreenshotId) {
    if (ECHLY_STRICT_MODE) {
      console.error("[GUARDRAIL] Invalid feedback create attempt", { feedbackId: normalizedFeedbackId });
      try {
        assert(hasScreenshotId, "ARCHITECTURE VIOLATION: screenshotId required");
      } catch {
        return NextResponse.json(
          { success: false, error: "ARCHITECTURE VIOLATION: screenshotId required" },
          { status: 400, headers: corsHeaders(req) }
        );
      }
    }
    return NextResponse.json(
      { success: false, error: "Atomic violation: screenshotId required" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404, headers: corsHeaders(req) }
    );
  }
  if (session.userId !== user.uid) {
    const userWorkspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    const sessionWorkspaceId = session.workspaceId ?? session.userId ?? null;
    const ok = sessionWorkspaceId != null && sessionWorkspaceId === userWorkspaceId;
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403, headers: corsHeaders(req) }
      );
    }
  }

  const workspaceId = session.workspaceId ?? session.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  try {
    await resolveWorkspaceByIdCached(workspaceId);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403, headers: corsHeaders(req) }
      );
    }
    throw err;
  }

  const meta = body.metadata;
  const resolvedScreenshotUrl = await resolveScreenshotDownloadUrl(normalizedScreenshotId, sessionId);
  if (!resolvedScreenshotUrl) {
    if (ECHLY_STRICT_MODE) {
      console.error("[GUARDRAIL] Invalid feedback create attempt", { feedbackId: normalizedFeedbackId });
      try {
        assert(
          Boolean(resolvedScreenshotUrl),
          "ARCHITECTURE VIOLATION: screenshot must exist before create"
        );
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: "ARCHITECTURE VIOLATION: screenshot must exist before create",
          },
          { status: 409, headers: corsHeaders(req) }
        );
      }
    }
    return NextResponse.json(
      { success: false, error: "Atomic violation: screenshot URL unavailable" },
      { status: 409, headers: corsHeaders(req) }
    );
  }

  const structuredData = {
    title,
    instruction:
      typeof body.instruction === "string"
        ? body.instruction
        : typeof (body as { description?: unknown }).description === "string"
          ? ((body as { description?: string }).description ?? undefined)
        : undefined,
    suggestion: typeof body.suggestion === "string" ? body.suggestion : undefined,
    type: "general" as const,
    contextSummary:
      typeof body.contextSummary === "string" ? body.contextSummary : undefined,
    actionSteps: actionSteps.length > 0 ? actionSteps : undefined,
    suggestedTags: Array.isArray(body.suggestedTags)
      ? body.suggestedTags
      : undefined,
    screenshotUrl: resolvedScreenshotUrl,
    status: normalizedIncomingStatus,
    screenshotStatus: "attached" as const,
    url: meta?.url,
    viewportWidth: meta?.viewportWidth,
    viewportHeight: meta?.viewportHeight,
    userAgent: meta?.userAgent,
    timestamp: meta?.clientTimestamp,
  };

  try {
    const workspaceId = session.workspaceId ?? session.userId ?? ((await getUserWorkspaceIdRepo(user.uid)) ?? user.uid);

    const docRef = await addFeedbackWithSessionCountersRepo(
      workspaceId,
      sessionId,
      user.uid,
      structuredData,
      normalizedFeedbackId,
      normalizedScreenshotId
    );
    const created = await getFeedbackByIdRepo(docRef.id);
    if (!created) {
      return NextResponse.json(
        { success: false, error: "Feedback created but could not be read" },
        { status: 500, headers: corsHeaders(req) }
      );
    }

    return NextResponse.json(
      {
        success: true,
        ticket: serializeTicket(created),
      },
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403, headers: corsHeaders(req) }
      );
    }
    console.error("POST /api/feedback:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

