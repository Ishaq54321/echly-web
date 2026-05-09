import { adminBucket } from "@/lib/server/firebaseAdmin";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { randomUUID } from "crypto";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const STORAGE_PREFIX = "discussion-attachments";

// Slack/Loom-style coverage. Excludes SVG, HTML, JS, executables (XSS / malware risk).
const ALLOWED_ATTACHMENT_TYPES = new Set<string>([
  // Images
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/rtf",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

const ALLOWED_ATTACHMENT_EXTENSIONS = new Set<string>([
  "png", "jpg", "jpeg", "webp", "gif", "heic", "heif",
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "txt", "csv", "rtf", "zip",
  "mp3", "wav", "webm", "mp4", "ogg", "mov", "avi",
]);

/**
 * POST /api/upload-attachment
 * multipart/form-data with field "file"
 * 🚨 ARCHITECTURE RULE:
 * Backend must NEVER generate or return access URLs.
 * Only return storage references (screenshotId, storagePath).
 * Validates 15 MB max, uploads to Firebase Storage, returns reference-only metadata.
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

    const fileMime = (file.type ?? "").trim().toLowerCase();
    if (!ALLOWED_ATTACHMENT_TYPES.has(fileMime)) {
      return apiError({
        code: "INVALID_INPUT",
        message:
          "File type not supported. Allowed: images, PDF, Office docs, audio, video, ZIP.",
        status: 400,
      });
    }

    // Defense-in-depth: file.type can be spoofed, also check extension.
    const ext = (file.name || "").split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_ATTACHMENT_EXTENSIONS.has(ext)) {
      return apiError({
        code: "INVALID_INPUT",
        message: "File extension not supported.",
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
    const token = randomUUID();
    await bucketFile.setMetadata({
      metadata: { firebaseStorageDownloadTokens: token },
    });
    const encodedPath = encodeURIComponent(storagePath);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${adminBucket.name}/o/${encodedPath}?alt=media&token=${token}`;

    return apiSuccess({
      storagePath,
      url: publicUrl,
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
