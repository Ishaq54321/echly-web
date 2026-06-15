import "server-only";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiError } from "@/lib/server/apiResponse";

export const runtime = "nodejs";

async function countByStatus(status: "pending" | "processing" | "failed"): Promise<number> {
  const snapshot = await adminDb
    .collection("insights_events")
    .where("status", "==", status)
    .count()
    .get();
  return snapshot.data().count ?? 0;
}

export async function GET(req: Request) {
  // Internal health endpoint — gate on CRON_SECRET, matching the cron routes
  // (e.g. app/api/cron/workspace-purge/route.ts:12-17). It only reads, but it
  // still leaks internal pipeline state, so reject unauthenticated callers.
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!secret || bearer !== secret) {
    return apiError({ code: "UNAUTHORIZED", message: "Unauthorized", status: 401 });
  }

  const [pending, processing, failed, recentSnapshot] = await Promise.all([
    countByStatus("pending"),
    countByStatus("processing"),
    countByStatus("failed"),
    adminDb
      .collection("insights_events")
      .orderBy("updatedAt", "desc")
      .limit(50)
      .get(),
  ]);

  const lastDoneDoc = recentSnapshot.docs.find((doc) => doc.get("status") === "done");
  const lastUpdatedAtRaw = lastDoneDoc?.get("updatedAt");
  const lastProcessedAt =
    lastUpdatedAtRaw && typeof (lastUpdatedAtRaw as { toDate?: unknown }).toDate === "function"
      ? ((lastUpdatedAtRaw as { toDate: () => Date }).toDate().toISOString())
      : null;

  return NextResponse.json({
    pending,
    processing,
    failed,
    lastProcessedAt,
  });
}
