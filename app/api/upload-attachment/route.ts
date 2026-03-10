import { NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { requireAuth } from "@/lib/server/auth";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const STORAGE_PREFIX = "discussion-attachments";

/**
 * POST /api/upload-attachment
 * multipart/form-data with field "file"
 * Validates 15 MB max, uploads to Firebase Storage, returns { url, name, size }.
 */
export async function POST(req: Request) {
  try {
    let user;
    try {
      user = await requireAuth(req);
    } catch (res) {
      return res as Response;
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be smaller than 15 MB." },
        { status: 400 }
      );
    }

    const originalName = (file.name || "file").replace(/[/\\]/g, "").slice(0, 200);
    const storagePath = `${STORAGE_PREFIX}/${randomUUID()}-${originalName}`;

    const storageRef = ref(storage, storagePath);

    const arrayBuffer = await file.arrayBuffer();
    await uploadBytes(storageRef, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
    });

    const url = await getDownloadURL(storageRef);

    return NextResponse.json({
      url,
      name: originalName,
      size: file.size,
    });
  } catch (err) {
    console.error("upload-attachment error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
