import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { corsHeaders } from "@/lib/server/cors";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import {
  DEFAULT_EMAIL_PREFERENCES,
  type EmailPreferences,
} from "@/lib/email/preferences";

export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = new Set(Object.keys(DEFAULT_EMAIL_PREFERENCES));

function unauthorizedResponse(req: NextRequest, errRes: Response): NextResponse {
  return new NextResponse(errRes.body, {
    status: errRes.status,
    statusText: errRes.statusText,
    headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
  });
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders(req) });
}

/**
 * GET /api/users/email-preferences — current user's effective preferences,
 * layered over the all-true defaults. Used by /settings?tab=notifications
 * to populate the toggles on initial load.
 */
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  try {
    const snap = await adminDb.doc(`users/${user.uid}`).get();
    const stored = (snap.data()?.emailPreferences ?? {}) as Partial<EmailPreferences>;
    const effective: EmailPreferences = {
      ...DEFAULT_EMAIL_PREFERENCES,
      ...stored,
    };
    return apiSuccess({ preferences: effective }, null, {
      headers: corsHeaders(req),
    });
  } catch (err) {
    console.error("GET /api/users/email-preferences:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to load email preferences",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}

/**
 * POST /api/users/email-preferences — toggle a single category.
 * Body: { category: "lifecycle" | "notifications", enabled: boolean }
 */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  let body: { category?: unknown; enabled?: unknown };
  try {
    body = (await req.json()) as { category?: unknown; enabled?: unknown };
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const category = typeof body.category === "string" ? body.category : "";
  const enabled = body.enabled;
  if (!ALLOWED_CATEGORIES.has(category)) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Unknown preference category",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }
  if (typeof enabled !== "boolean") {
    return apiError({
      code: "INVALID_INPUT",
      message: "`enabled` must be a boolean",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    await adminDb.doc(`users/${user.uid}`).set(
      {
        emailPreferences: { [category]: enabled },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return apiSuccess({ category, enabled }, null, {
      headers: corsHeaders(req),
    });
  } catch (err) {
    console.error("POST /api/users/email-preferences:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to update email preferences",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
