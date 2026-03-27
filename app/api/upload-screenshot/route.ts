import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import "@/lib/server/firebaseAdmin";
import { getStorage } from "firebase-admin/storage";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  createScreenshotRepoSync,
  getScreenshotByIdRepo,
} from "@/lib/repositories/screenshotsRepository";
import { corsHeaders } from "@/lib/server/cors";
import { userWorkspaceMatchesSession } from "@/lib/server/sessionWorkspaceScope";
import { createScreenshotId } from "@/lib/uploadScreenshot";

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
    } catch (res) {
      const errRes = res as Response;
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
      return NextResponse.json(
        { error: "Missing required fields: imageDataUrl, sessionId" },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    const sid = sessionId.trim();
    const screenshotIdRaw =
      typeof screenshotId === "string" ? screenshotId.trim() : "";
    const ssId = screenshotIdRaw || createScreenshotId();

    const session = await getSessionByIdRepo(sid);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404, headers: corsHeaders(req) }
      );
    }
    if (!(await userWorkspaceMatchesSession(user.uid, session))) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers: corsHeaders(req) }
      );
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

    return NextResponse.json({ screenshotId: ssId, url }, { headers: corsHeaders(req) });
  } catch (err) {
    console.error("upload-screenshot error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
