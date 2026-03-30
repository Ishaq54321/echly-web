import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

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

    return apiSuccess({
      wrote: { path: ref.path, lastTouchedAt: now },
      read: { exists: snap.exists, data: snap.data() ?? null },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return apiError({
      code: "INTERNAL_ERROR",
      message,
      status: 500,
      data: {
        hint: {
          credentials:
            "Set FIREBASE_SERVICE_ACCOUNT_JSON (recommended) or GOOGLE_APPLICATION_CREDENTIALS (ADC) before calling this route.",
          projectId:
            "If needed, set FIREBASE_PROJECT_ID (defaults to echly-b74cc in code).",
        },
      },
    });
  }
}
