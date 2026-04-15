import "server-only";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";

async function countByStatus(status: "pending" | "processing" | "failed"): Promise<number> {
  const snapshot = await adminDb
    .collection("insights_events")
    .where("status", "==", status)
    .count()
    .get();
  return snapshot.data().count ?? 0;
}

export async function GET() {
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
