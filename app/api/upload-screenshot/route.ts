import type { NextRequest } from "next/server";
import "@/lib/server/firebaseAdmin";
import { getStorage } from "firebase-admin/storage";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import {
  createScreenshotRepoSync,
} from "@/lib/repositories/screenshotsRepository";
import { corsHeaders } from "@/lib/server/cors";
import { createScreenshotId } from "@/lib/uploadScreenshot";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { NextResponse } from "next/server";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/**
 * POST /api/upload-screenshot
 * Body: { imageDataUrl: string, sessionId: string, screenshotId?: string }
 * 🚨 ARCHITECTURE RULE:
 * Backend must NEVER generate or return access URLs.
 * Only return storage references (screenshotId, storagePath).
 * Uploads to Storage, then creates a TEMP screenshot record (with session-derived workspaceId).
 * When feedback is created with this screenshotId, the record is updated to ATTACHED.
 * TEMP screenshots never attached are cleaned up by a scheduled job.
 */
export async function POST(req: NextRequest) {
  try {
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

    const bucket = getStorage().bucket();

    const body = await req.json();
    const { screenshotId, imageDataUrl, sessionId } = body;

    if (
      typeof imageDataUrl !== "string" ||
      !imageDataUrl.trim() ||
      typeof sessionId !== "string" ||
      !sessionId.trim()
    ) {
      return apiError({
        code: "INVALID_INPUT",
        message: "Missing required fields: imageDataUrl, sessionId",
        status: 400,
        init: { headers: corsHeaders(req) },
      });
    }

    // Reject oversized data URLs before decoding to avoid wasted memory.
    // Base64 expands ~33%, so 14MB string ≈ 10MB binary.
    const MAX_DATA_URL_LENGTH = 14 * 1024 * 1024;
    if (imageDataUrl.length > MAX_DATA_URL_LENGTH) {
      return apiError({
        code: "INVALID_INPUT",
        message: "Screenshot too large. Maximum 10MB.",
        status: 413,
        init: { headers: corsHeaders(req) },
      });
    }

    const sid = sessionId.trim();
    const screenshotIdRaw =
      typeof screenshotId === "string" ? screenshotId.trim() : "";
    const ssId = screenshotIdRaw || createScreenshotId();

    const built = await tryBuildRequestContext({
      req,
      authenticatedUser: user,
      sessionId: sid,
    });
    if (!built.ok) {
      return new NextResponse(built.response.body, {
        status: built.response.status,
        statusText: built.response.statusText,
        headers: { ...Object.fromEntries(built.response.headers), ...corsHeaders(req) },
      });
    }
    const accessCtx = built.ctx;
    if (!accessCtx.access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    if (!accessCtx.access?.capabilities.canComment) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    if (!accessCtx.session) {
      return apiError({
        code: "NOT_FOUND",
        message: "Session not found",
        status: 404,
        init: { headers: corsHeaders(req) },
      });
    }

    const workspaceId = accessCtx.session.workspaceId.trim();
    if (!workspaceId) {
      return apiError({
        code: "INVALID_INPUT",
        message: "Invalid session: missing workspaceId",
        status: 400,
        init: { headers: corsHeaders(req) },
      });
    }

    const userId = user.uid;

    const contentType = "image/png";
    const ext = "png";
    const storagePath = `sessions/${sid}/screenshots/${ssId}.${ext}`;

    const uploadStart = Date.now();
    // Convert data URL → buffer
    const base64Data = imageDataUrl.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to Firebase Storage via Admin SDK (after session/workspace validation)
    const file = bucket.file(storagePath);

    await file.save(buffer, {
      metadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    // New screenshots never exist yet — write directly without an existence check (~200ms saved).
    await createScreenshotRepoSync(
      userId,
      ssId,
      storagePath,
      sid,
      workspaceId
    );

    const elapsedMs = Date.now() - uploadStart;
    console.log(`[UPLOAD] screenshot upload (+ record) duration: ${elapsedMs}ms`);

    return apiSuccess({ screenshotId: ssId, storagePath }, null, {
      headers: corsHeaders(req),
    });
  } catch (err) {
    console.error("upload-screenshot error:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Upload failed",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
