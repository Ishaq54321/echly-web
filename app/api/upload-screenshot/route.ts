import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import { adminStorage } from "@/lib/server/firebaseAdmin";

const MAX_BASE64_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const DATA_IMAGE_PREFIX = "data:image/";

type UploadBody = {
  sessionId?: string;
  feedbackId?: string;
  imageBase64?: string;
};

/**
 * POST /api/upload-screenshot
 * Body: { sessionId, feedbackId, imageBase64 }
 * Returns: { success: true, url } or { success: false, error }
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  let body: UploadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { sessionId, feedbackId, imageBase64 } = body;

  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    return NextResponse.json(
      { success: false, error: "Missing or invalid sessionId" },
      { status: 400 }
    );
  }
  if (typeof feedbackId !== "string" || feedbackId.trim() === "") {
    return NextResponse.json(
      { success: false, error: "Missing or invalid feedbackId" },
      { status: 400 }
    );
  }
  if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    return NextResponse.json(
      { success: false, error: "Missing or invalid imageBase64" },
      { status: 400 }
    );
  }

  if (!imageBase64.startsWith(DATA_IMAGE_PREFIX)) {
    return NextResponse.json(
      { success: false, error: "imageBase64 must start with data:image/" },
      { status: 400 }
    );
  }

  // Size check: base64 is ~4/3 of raw size; use byte length of the string
  const sizeBytes = Math.ceil((imageBase64.length * 3) / 4);
  if (sizeBytes > MAX_BASE64_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, error: "imageBase64 size must be <= 10MB" },
      { status: 400 }
    );
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 }
    );
  }
  if (session.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  let buffer: Buffer;
  try {
    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64.slice(DATA_IMAGE_PREFIX.length);
    buffer = Buffer.from(base64Data ?? "", "base64");
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid base64 image data" },
      { status: 400 }
    );
  }

  if (buffer.length === 0) {
    return NextResponse.json(
      { success: false, error: "Empty image data" },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  const storagePath = `sessions/${sessionId}/feedback/${feedbackId}/${timestamp}.png`;

  try {
    const bucket = adminStorage.bucket();
    const file = bucket.file(storagePath);

    await file.save(buffer, {
      contentType: "image/png",
      metadata: {
        contentType: "image/png",
      },
    });

    await file.makePublic();

    const bucketName = bucket.name;
    const encodedPath = encodeURIComponent(storagePath);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error("POST /api/upload-screenshot:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
