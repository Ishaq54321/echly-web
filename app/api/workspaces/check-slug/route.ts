import type { NextRequest } from "next/server";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { corsHeaders } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rateLimit";
import { isValidSlug, suggestSlug } from "@/lib/utils/slugify";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders(req) });
}

/**
 * GET /api/workspaces/check-slug?slug=xyz
 * Returns { available: boolean, suggestion?: string }.
 *
 * Uses the `slugs/{slug}` lock collection as the source of truth for uniqueness
 * — see POST/PATCH workspaces routes for the matching reservation logic.
 */
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return new Response(toAuthorizationResponse(err).body, {
      status: toAuthorizationResponse(err).status,
      headers: corsHeaders(req),
    });
  }

  const rl = checkRateLimit({
    key: `check-slug:${clientKeyFromRequest(req)}`,
    max: 20,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Too many requests. Please slow down.",
      status: 429,
      init: {
        headers: { ...corsHeaders(req), "Retry-After": String(rl.retryAfterSeconds) },
      },
    });
  }

  const url = new URL(req.url);
  const rawSlug = (url.searchParams.get("slug") ?? "").trim().toLowerCase();

  if (!rawSlug) {
    return apiError({
      code: "INVALID_INPUT",
      message: "slug is required",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  if (!isValidSlug(rawSlug)) {
    return apiSuccess(
      { available: false, valid: false, suggestion: suggestSlug(rawSlug) },
      null,
      { headers: corsHeaders(req) }
    );
  }

  try {
    const lockSnap = await adminDb.doc(`slugs/${rawSlug}`).get();
    if (!lockSnap.exists) {
      return apiSuccess(
        { available: true, valid: true },
        null,
        { headers: corsHeaders(req) }
      );
    }

    const data = (lockSnap.data() ?? {}) as Record<string, unknown>;
    const ownerWid = typeof data.workspaceId === "string" ? data.workspaceId : "";

    // If the lock points at a workspace this caller already owns, treat as available.
    if (ownerWid) {
      const userSnap = await adminDb.doc(`users/${user.uid}`).get();
      const callerWid =
        typeof userSnap.data()?.workspaceId === "string"
          ? (userSnap.data()?.workspaceId as string)
          : "";
      if (callerWid && callerWid === ownerWid) {
        return apiSuccess(
          { available: true, valid: true, ownedByCaller: true },
          null,
          { headers: corsHeaders(req) }
        );
      }
    }

    return apiSuccess(
      { available: false, valid: true, suggestion: suggestSlug(rawSlug) },
      null,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("GET /api/workspaces/check-slug:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to check slug",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
