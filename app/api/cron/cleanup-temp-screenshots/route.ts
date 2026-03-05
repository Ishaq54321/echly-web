import { NextResponse } from "next/server";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import {
  getTempScreenshotsOlderThanRepo,
  deleteScreenshotRepo,
} from "@/lib/repositories/screenshotsRepository";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * GET/POST /api/cron/cleanup-temp-screenshots
 * Deletes screenshot records with status TEMP and createdAt older than 1 hour,
 * and their Firebase Storage objects.
 * Call from a scheduled job (e.g. Vercel Cron). Protect with CRON_SECRET.
 */
export async function GET(req: Request) {
  return runCleanup(req);
}

export async function POST(req: Request) {
  return runCleanup(req);
}

async function runCleanup(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = req.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const headerSecret = req.headers.get("x-cron-secret");
    if (bearer !== secret && headerSecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const createdBefore = Date.now() - ONE_HOUR_MS;
    const candidates = await getTempScreenshotsOlderThanRepo(createdBefore);
    let deleted = 0;
    let storageErrors = 0;

    for (const record of candidates) {
      if (record.storagePath) {
        try {
          const storageRef = ref(storage, record.storagePath);
          await deleteObject(storageRef);
        } catch (err) {
          console.error("[cleanup-temp-screenshots] Storage delete failed:", record.id, err);
          storageErrors += 1;
          // Still delete the Firestore record so we don't retry forever
        }
      }
      await deleteScreenshotRepo(record.id);
      deleted += 1;
    }

    return NextResponse.json({
      success: true,
      deleted,
      storageErrors,
    });
  } catch (err) {
    console.error("cleanup-temp-screenshots error:", err);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
