import "server-only";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const ref = adminDb.collection("_admin_test").doc("phase2");

    const now = new Date().toISOString();
    await ref.set(
      {
        lastTouchedAt: now,
        note: "phase2_admin_setup",
      },
      { merge: true }
    );

    const snap = await ref.get();

    return NextResponse.json({
      ok: true,
      wrote: { path: ref.path, lastTouchedAt: now },
      read: { exists: snap.exists, data: snap.data() ?? null },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint: {
          credentials:
            "Set FIREBASE_SERVICE_ACCOUNT_JSON (recommended) or GOOGLE_APPLICATION_CREDENTIALS (ADC) before calling this route.",
          projectId:
            "If needed, set FIREBASE_PROJECT_ID (defaults to echly-b74cc in code).",
        },
      },
      { status: 500 }
    );
  }
}

