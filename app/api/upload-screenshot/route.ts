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
  getScreenshotByIdRepo,
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
 * Creates a TEMP screenshot record, uploads to Storage, returns { screenshotId, url }.
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

    const userId = user.uid;

    const storagePath = `sessions/${sid}/screenshots/${ssId}.png`;

    const existing = await getScreenshotByIdRepo(ssId);
    if (existing?.status !== "ATTACHED") {
      await createScreenshotRepoSync(userId, ssId, storagePath);
    }

    const uploadStart = Date.now();
    // Convert data URL → buffer
    const base64Data = imageDataUrl.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to Firebase Storage via Admin SDK
    const file = bucket.file(storagePath);

    await file.save(buffer, {
      metadata: {
        contentType: "image/png",
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    const uploadDuration = Date.now() - uploadStart;
    console.log(`[UPLOAD] screenshot upload duration: ${uploadDuration}ms`);

    return apiSuccess({ screenshotId: ssId, url }, null, {
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
