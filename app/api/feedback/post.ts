import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  addFeedbackWithSessionCountersRepo,
  getFeedbackByIdRepo,
  updateFeedbackRepo,
} from "@/lib/repositories/feedbackRepository";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import {
  getScreenshotByIdRepo,
  updateScreenshotAttachedRepo,
} from "@/lib/repositories/screenshotsRepository";
import { generateTicketTitle } from "@/lib/tickets/generateTicketTitle";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { corsHeaders } from "@/lib/server/cors";
import { verifyExtensionToken } from "@/lib/server/extensionAuth";
import { verifyIdToken, type AuthUser } from "@/lib/server/auth";
import { getSessionUser } from "@/lib/server/session";
import { invalidateFeedbackCache } from "@/lib/server/cache/feedbackCache";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

const WORKSPACE_BY_ID_CACHE_TTL_MS = 30_000;
const workspaceByIdCache = new Map<string, { workspace: unknown; expiresAt: number }>();

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
  const now = Date.now();
  const hit = workspaceByIdCache.get(workspaceId);
  if (hit && now < hit.expiresAt) {
    return { workspace: hit.workspace };
  }
  const { workspace } = await resolveWorkspaceById(workspaceId);
  workspaceByIdCache.set(workspaceId, { workspace, expiresAt: now + WORKSPACE_BY_ID_CACHE_TTL_MS });
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
  const storagePath = storagePathRaw.length > 0 ? storagePathRaw : fallbackStoragePath;

  try {
    return await getDownloadURL(ref(storage, storagePath));
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
    title?: string;
    description?: string;
    suggestion?: string;
    screenshotUrl?: string;
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
    clarityScore?: number;
    clarityStatus?: "clear" | "needs_improvement" | "unclear";
    clarityIssues?: string[];
    clarityConfidence?: number;
    extractedInstructions?: Array<{
      intent?: string;
      entity?: string;
      action?: string;
      confidence?: number;
    }>;
    screenshotId?: string;
  };
  try {
    body = await req.json();
  } catch (err) {
    console.error("[feedback] invalid JSON body:", err);
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
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
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (!title) {
    return NextResponse.json(
      { success: false, error: "title is required (or provide actionSteps)" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const screenshotUrlRaw =
    typeof body.screenshotUrl === "string" ? body.screenshotUrl.trim() : "";
  const screenshotIdRaw =
    typeof body.screenshotId === "string" ? body.screenshotId.trim() : "";
  const hasScreenshotUrl = screenshotUrlRaw.length > 0;
  const hasScreenshotId = screenshotIdRaw.length > 0;
  const normalizedScreenshotUrl = hasScreenshotUrl ? screenshotUrlRaw : undefined;
  const normalizedScreenshotId = hasScreenshotId ? screenshotIdRaw : "";
  const hasAnyScreenshotData = hasScreenshotId || hasScreenshotUrl;
  const screenshotStatus: "attached" | "pending" | "none" =
    hasAnyScreenshotData ? "pending" : "none";

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

  const structuredData = {
    title,
    description: description || title,
    suggestion: typeof body.suggestion === "string" ? body.suggestion : undefined,
    type: "general" as const,
    contextSummary:
      typeof body.contextSummary === "string" ? body.contextSummary : undefined,
    actionSteps: actionSteps.length > 0 ? actionSteps : undefined,
    suggestedTags: Array.isArray(body.suggestedTags)
      ? body.suggestedTags
      : undefined,
    screenshotUrl:
      normalizedScreenshotUrl,
    status: "processing" as const,
    screenshotStatus,
    url: meta?.url,
    viewportWidth: meta?.viewportWidth,
    viewportHeight: meta?.viewportHeight,
    userAgent: meta?.userAgent,
    timestamp: meta?.clientTimestamp,
    clarityScore:
      typeof body.clarityScore === "number" && body.clarityScore >= 0 && body.clarityScore <= 100
        ? body.clarityScore
        : undefined,
    clarityStatus:
      body.clarityStatus === "clear" ||
      body.clarityStatus === "needs_improvement" ||
      body.clarityStatus === "unclear"
        ? body.clarityStatus
        : undefined,
    clarityIssues: Array.isArray(body.clarityIssues) ? body.clarityIssues : undefined,
    clarityConfidence:
      typeof body.clarityConfidence === "number" &&
      body.clarityConfidence >= 0 &&
      body.clarityConfidence <= 1
        ? body.clarityConfidence
        : undefined,
  };

  try {
    const workspaceId = session.workspaceId ?? session.userId ?? ((await getUserWorkspaceIdRepo(user.uid)) ?? user.uid);

    const docRef = await addFeedbackWithSessionCountersRepo(
      workspaceId,
      sessionId,
      user.uid,
      structuredData
    );
    console.log("[feedback lifecycle] created", {
      feedbackId: docRef.id,
      sessionId,
      hasScreenshotId,
      hasScreenshotUrl,
    });

    try {
      if (hasScreenshotId) {
        await updateScreenshotAttachedRepo(normalizedScreenshotId, docRef.id);
        const resolvedScreenshotUrl = await resolveScreenshotDownloadUrl(normalizedScreenshotId, sessionId);
        if (!resolvedScreenshotUrl) {
          await updateFeedbackRepo(docRef.id, {
            screenshotStatus: "failed",
            status: "failed",
          });
          console.error("[feedback lifecycle] screenshot URL missing after attach", {
            feedbackId: docRef.id,
            screenshotId: normalizedScreenshotId,
          });
        } else {
          await updateFeedbackRepo(docRef.id, {
            screenshotStatus: "attached",
            screenshotUrl: resolvedScreenshotUrl,
            status: "complete",
          });
          console.log("[feedback lifecycle] screenshot attached", {
            feedbackId: docRef.id,
            method: "screenshotId",
            hasScreenshotUrl: true,
          });
        }
      } else if (hasScreenshotUrl) {
        await updateFeedbackRepo(docRef.id, { screenshotStatus: "attached", status: "complete" });
        console.log("[feedback lifecycle] screenshot attached", {
          feedbackId: docRef.id,
          method: "screenshotUrl",
        });
      } else {
        await updateFeedbackRepo(docRef.id, { status: "complete" });
      }
    } catch (lifecycleErr) {
      console.error("[feedback lifecycle] failed", {
        feedbackId: docRef.id,
        error: lifecycleErr,
      });
      try {
        await updateFeedbackRepo(docRef.id, {
          screenshotStatus: hasAnyScreenshotData ? "failed" : "none",
          status: "failed",
        });
      } catch (finalizeErr) {
        console.error("[feedback lifecycle] failed to persist failed state", {
          feedbackId: docRef.id,
          error: finalizeErr,
        });
      }
    }
    const created = await getFeedbackByIdRepo(docRef.id);
    if (!created) {
      return NextResponse.json(
        { success: false, error: "Feedback created but could not be read" },
        { status: 500, headers: corsHeaders(req) }
      );
    }

    invalidateFeedbackCache(workspaceId, sessionId);

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

