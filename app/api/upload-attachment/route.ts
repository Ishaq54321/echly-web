import { adminBucket } from "@/lib/server/firebaseAdmin";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { randomUUID } from "crypto";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

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
    } catch (err) {
      return toAuthorizationResponse(err);
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return apiError({
        code: "INVALID_INPUT",
        message: "No file provided",
        status: 400,
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError({
        code: "INVALID_INPUT",
        message: "File must be smaller than 15 MB.",
        status: 400,
      });
    }

    const originalName = (file.name || "file").replace(/[/\\]/g, "").slice(0, 200);
    const storagePath = `${STORAGE_PREFIX}/${randomUUID()}-${originalName}`;

    const arrayBuffer = await file.arrayBuffer();
    const bucketFile = adminBucket.file(storagePath);
    await bucketFile.save(Buffer.from(arrayBuffer), {
      metadata: {
        contentType: file.type || "application/octet-stream",
      },
    });

    const [url] = await bucketFile.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return apiSuccess({
      url,
      name: originalName,
      size: file.size,
    });
  } catch (err) {
    console.error("upload-attachment error:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Upload failed",
      status: 500,
    });
  }
}
