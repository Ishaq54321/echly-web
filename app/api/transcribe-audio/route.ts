import type { NextRequest } from "next/server";
import OpenAI from "openai";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { resolveWorkspaceForUser } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_MESSAGE } from "@/lib/server/assertWorkspaceActive";
import { logger } from "@/lib/logger";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { NextResponse } from "next/server";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** Allowed Content-Type values (browsers may send audio/mpeg for MP3). */
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
]);

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function transcribeCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  let allowOrigin = "null";

  // Allow extension background calls.
  if (origin?.startsWith("chrome-extension://")) {
    allowOrigin = origin;
  }
  // Allow localhost + app origin.
  else if (
    origin === "http://localhost:3000" ||
    origin === "https://echly-web.vercel.app"
  ) {
    allowOrigin = origin;
  }
  // Allow any HTTPS origin (extension runs on websites).
  else if (origin?.startsWith("https://")) {
    allowOrigin = origin;
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(uid);
  if (!entry) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= RATE_LIMIT_MAX_REQUESTS;
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

function isMultipartFormData(req: NextRequest): boolean {
  const ct = req.headers.get("content-type")?.toLowerCase() ?? "";
  return ct.includes("multipart/form-data");
}

function getFileDebugMeta(file: FormDataEntryValue | null): {
  fileType: string | undefined;
  fileSize: number | undefined;
  isFileInstance: boolean;
  typeofFile: string;
} {
  const isFileInstance =
    typeof File !== "undefined" &&
    typeof file === "object" &&
    file !== null &&
    file instanceof File;

  return {
    fileType: isFileInstance ? file.type : undefined,
    fileSize: isFileInstance ? file.size : undefined,
    isFileInstance,
    typeofFile: typeof file,
  };
}

export async function OPTIONS(req: NextRequest) {
  const headers = transcribeCorsHeaders(req);
  return new Response(null, {
    status: 204,
    headers,
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  logger.debug("transcribe", "file_received");
  const headers = transcribeCorsHeaders(req);

  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    const errRes = toAuthorizationResponse(err);
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...headers },
    });
  }

  if (!checkRateLimit(user.uid)) {
    return apiError({
      code: "FORBIDDEN",
      message: "Rate limit exceeded. Try again later.",
      status: 429,
      init: { headers },
    });
  }

  try {
    await resolveWorkspaceForUser(user.uid);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return apiError({
        code: "FORBIDDEN",
        message: WORKSPACE_SUSPENDED_MESSAGE,
        status: 403,
        init: { headers },
      });
    }
    throw err;
  }

  let file: FormDataEntryValue | null = null;

  if (!isMultipartFormData(req)) {
    const debugMeta = getFileDebugMeta(file);
    logger.warn("transcribe", "failure", {
      reason: "invalid_content_type",
      fileExists: !!file,
      ...debugMeta,
    });
    return apiError({
      code: "INVALID_INPUT",
      message: 'Expected multipart/form-data with field "file"',
      status: 400,
      init: { headers },
    });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    const debugMeta = getFileDebugMeta(file);
    logger.warn("transcribe", "failure", {
      reason: "invalid_multipart_body",
      fileExists: !!file,
      ...debugMeta,
    });
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid multipart body",
      status: 400,
      init: { headers },
    });
  }

  file = formData.get("file");

  logger.debug("transcribe", "file_received", {
    exists: !!file,
    type: file instanceof File ? file.type : undefined,
    size: file instanceof File ? file.size : undefined,
    constructor: file?.constructor?.name,
  });

  if (!file || !(file instanceof File)) {
    const debugMeta = getFileDebugMeta(file);
    logger.warn("transcribe", "failure", {
      reason: "missing_file_field",
      fileExists: !!file,
      ...debugMeta,
    });
    return apiError({
      code: "INVALID_INPUT",
      message: 'Missing required multipart field "file" (audio file)',
      status: 400,
      init: { headers },
    });
  }

  const mime = (file.type ?? "").trim().toLowerCase();
  if (!mime || !ALLOWED_AUDIO_TYPES.has(mime)) {
    logger.warn("transcribe", "failure", {
      reason: "unsupported_mime",
      fileExists: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      isFileInstance: file instanceof File,
      typeofFile: typeof file,
    });
    return apiError({
      code: "INVALID_INPUT",
      message:
        "Invalid or unsupported audio type. Allowed: audio/webm, audio/mp3 (or audio/mpeg), audio/wav",
      status: 400,
      init: { headers },
    });
  }

  if (file.size <= 0) {
    logger.warn("transcribe", "failure", {
      reason: "empty_file",
      fileExists: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      isFileInstance: file instanceof File,
      typeofFile: typeof file,
    });
    return apiError({
      code: "INVALID_INPUT",
      message: "Audio file is empty",
      status: 400,
      init: { headers },
    });
  }

  if (file.size > MAX_FILE_BYTES) {
    logger.warn("transcribe", "failure", {
      reason: "file_too_large",
      fileExists: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      isFileInstance: file instanceof File,
      typeofFile: typeof file,
    });
    return apiError({
      code: "INVALID_INPUT",
      message: "Audio file exceeds maximum size (10MB)",
      status: 400,
      init: { headers },
    });
  }

  let openai: OpenAI;
  try {
    openai = getOpenAIClient();
  } catch {
    logger.error("error", "openai_configuration_missing");
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Transcription service unavailable",
      status: 500,
      init: { headers },
    });
  }

  try {
    logger.debug("transcribe", "openai_called");
    const response = await (async () => {
      try {
        return await openai.audio.transcriptions.create({
          file,
          model: "gpt-4o-mini-transcribe",
        });
      } catch (err) {
        logger.error("error", "openai_call_failed", err);
        throw err;
      }
    })();

    const transcript = typeof response.text === "string" ? response.text.trim() : "";
    if (!transcript || transcript.length < 3) {
      logger.error("error", "transcription_failed_empty_transcript");
      logger.error("transcribe", "failure");
      return apiError({
        code: "INVALID_INPUT",
        message: "NO_SPEECH_DETECTED",
        status: 400,
        init: { headers },
      });
    }

    logger.debug("transcribe", "success", { charCount: transcript.length });
    return apiSuccess({ transcript }, null, { headers });
  } catch (err) {
    logger.error("error", "transcription_failed", err);
    logger.error("transcribe", "failure");
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Transcription failed",
      status: 500,
      init: { headers },
    });
  }
}
