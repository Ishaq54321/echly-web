import { getScreenshotByIdRepo } from "@/lib/repositories/screenshotsRepository";
import { apiError } from "@/lib/server/apiResponse";
import { adminBucket } from "@/lib/server/firebaseAdmin";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { NextResponse } from "next/server";
import { Readable } from "node:stream";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = rawId?.trim() ?? "";
  if (!id) {
    return apiError({ code: "INVALID_INPUT", message: "Missing screenshot id", status: 400 });
  }

  const record = await getScreenshotByIdRepo(id);
  const sessionId = record?.sessionId?.trim() ?? "";
  const storagePath = record?.storagePath?.trim() ?? "";

  if (!record || !sessionId || !storagePath) {
    return apiError({ code: "NOT_FOUND", message: "Screenshot not found", status: 404 });
  }

  const built = await tryBuildRequestContext({
    req,
    sessionId,
    optionalAuth: true,
  });
  if (!built.ok) {
    return built.response;
  }
  if (!built.ctx.access?.capabilities.canView) {
    return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
  }

  try {
    const file = adminBucket.file(storagePath);
    const [exists] = await file.exists();
    if (!exists) {
      return apiError({ code: "NOT_FOUND", message: "Screenshot file missing", status: 404 });
    }
    const nodeStream = file.createReadStream();
    nodeStream.on("error", (err) => {
      console.error("Stream error:", err);
    });
    const webStream = Readable.toWeb(nodeStream);
    return new NextResponse(webStream as unknown as ReadableStream<Uint8Array>, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("GET /api/screenshot/[id]:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
  }
}
