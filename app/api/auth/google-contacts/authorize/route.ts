import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { corsHeaders } from "@/lib/server/cors";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

export const dynamic = "force-dynamic";

const SCOPE = "https://www.googleapis.com/auth/contacts.readonly";
const STATE_COOKIE = "gc_oauth_state";
const STATE_TTL_SEC = 600; // 10 minutes

function getOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  return host ? `${proto}://${host}` : "";
}

function buildStateCookie(value: string): string {
  return [
    `${STATE_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${STATE_TTL_SEC}`,
  ].join("; ");
}

/**
 * GET /api/auth/google-contacts/authorize
 * Returns { url } — the Google OAuth consent URL the frontend should open.
 * Sets a short-lived HttpOnly cookie with the CSRF state value, validated by
 * the callback route below.
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
  void user;

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Google OAuth client id not configured",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }

  const origin = getOrigin(req);
  if (!origin) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Could not determine origin",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }

  const state = randomBytes(24).toString("base64url");
  const redirectUri = `${origin}/api/auth/google-contacts/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    state,
    access_type: "online",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  const headers = new Headers(corsHeaders(req));
  headers.append("Set-Cookie", buildStateCookie(state));
  return apiSuccess({ url }, null, { headers });
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders(req) });
}
