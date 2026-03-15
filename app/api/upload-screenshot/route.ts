import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import {
  createScreenshotRepoSync,
  getScreenshotByIdRepo,
} from "@/lib/repositories/screenshotsRepository";
import { corsHeaders } from "@/lib/server/cors";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/**
 * POST /api/upload-screenshot
 * Body: { screenshotId: string, imageDataUrl: string, sessionId: string }
 * Creates a TEMP screenshot record, uploads to Storage, returns { url }.
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

    const body = await req.json();
    const { screenshotId, imageDataUrl, sessionId } = body;

    if (
      typeof screenshotId !== "string" ||
      !screenshotId.trim() ||
      typeof imageDataUrl !== "string" ||
      !imageDataUrl.trim() ||
      typeof sessionId !== "string" ||
      !sessionId.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required fields: screenshotId, imageDataUrl, sessionId" },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    const sid = sessionId.trim();
    const ssId = screenshotId.trim();

    const session = await getSessionByIdRepo(sid);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404, headers: corsHeaders(req) }
      );
    }
    if (session.userId !== user.uid) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers: corsHeaders(req) }
      );
    }

    const workspaceId = session.workspaceId ?? session.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    try {
      await resolveWorkspaceById(workspaceId);
    } catch (err) {
      if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
        return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
          status: 403,
          headers: corsHeaders(req),
        });
      }
      throw err;
    }

    const storagePath = `sessions/${sid}/screenshots/${ssId}.png`;

    const existing = await getScreenshotByIdRepo(ssId);
    if (existing?.status !== "ATTACHED") {
      await createScreenshotRepoSync(ssId, storagePath);
    }

    const screenshotRef = ref(storage, storagePath);

    const uploadStart = Date.now();
    await uploadString(screenshotRef, imageDataUrl, "data_url", {
      contentType: "image/png",
    });

    const url = await getDownloadURL(screenshotRef);
    const uploadDuration = Date.now() - uploadStart;
    console.log(`[UPLOAD] screenshot upload duration: ${uploadDuration}ms`);

    return NextResponse.json({ url }, { headers: corsHeaders(req) });
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    console.error("upload-screenshot error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
