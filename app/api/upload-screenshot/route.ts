import { NextResponse } from "next/server";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";

/**
 * POST /api/upload-screenshot
 * Body: { imageDataUrl: string, sessionId: string, feedbackId: string }
 * Returns: { url: string } on success, { error: string } on failure.
 * Storage path: sessions/{sessionId}/feedback/{feedbackId}/{timestamp}.png
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
    const { imageDataUrl, sessionId, feedbackId } = body;

    if (
      typeof imageDataUrl !== "string" ||
      !imageDataUrl.trim() ||
      typeof sessionId !== "string" ||
      !sessionId.trim() ||
      typeof feedbackId !== "string" ||
      !feedbackId.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required fields: imageDataUrl, sessionId, feedbackId" },
        { status: 400 }
      );
    }

    const session = await getSessionByIdRepo(sessionId.trim());
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

    const timestamp = Date.now();
    const path = `sessions/${sessionId.trim()}/feedback/${feedbackId.trim()}/${timestamp}.png`;

    const screenshotRef = ref(storage, path);

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
