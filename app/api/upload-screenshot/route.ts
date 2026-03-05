import { NextResponse } from "next/server";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import {
  createScreenshotRepoSync,
  getScreenshotByIdRepo,
} from "@/lib/repositories/screenshotsRepository";

/**
 * POST /api/upload-screenshot
 * Body: { screenshotId: string, imageDataUrl: string, sessionId: string }
 * Creates a TEMP screenshot record, uploads to Storage, returns { url }.
 * When feedback is created with this screenshotId, the record is updated to ATTACHED.
 * TEMP screenshots never attached are cleaned up by a scheduled job.
 */
export async function POST(req: Request) {
  try {
    let user;
    try {
      user = await requireAuth(req);
    } catch (res) {
      return res as Response;
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
        { status: 400 }
      );
    }

    const sid = sessionId.trim();
    const ssId = screenshotId.trim();

    const session = await getSessionByIdRepo(sid);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }
    if (session.userId !== user.uid) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const storagePath = `sessions/${sid}/screenshots/${ssId}.png`;

    const existing = await getScreenshotByIdRepo(ssId);
    if (existing?.status !== "ATTACHED") {
      await createScreenshotRepoSync(ssId, storagePath);
    }

    const screenshotRef = ref(storage, storagePath);

    await uploadString(screenshotRef, imageDataUrl, "data_url", {
      contentType: "image/png",
    });

    const url = await getDownloadURL(screenshotRef);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("upload-screenshot error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
