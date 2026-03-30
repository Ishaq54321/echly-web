import type { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { getSessionUser } from "@/lib/server/session";
import { corsHeaders } from "@/lib/server/cors";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

export const dynamic = "force-dynamic";

function getExtensionSecret(): Uint8Array {
  const secret = process.env.EXTENSION_TOKEN_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "EXTENSION_TOKEN_SECRET must be set and at least 16 characters"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/**
 * POST /api/extension/session
 * Exchange the echly_session cookie for a short-lived extension token.
 * No request body. Session is read from the echly_session cookie.
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return apiError({
      code: "UNAUTHORIZED",
      message: "User is not authenticated",
      status: 401,
      init: { headers: corsHeaders(request) },
    });
  }

  try {
    const secret = getExtensionSecret();
    const uid = user.uid;
    const email = user.email ?? null;
    const payload = {
      uid,
      email,
      type: "extension" as const,
    };
    const extensionToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret);

    return apiSuccess(
      {
        extensionToken,
        user: {
          uid,
          email,
        },
      },
      null,
      { headers: corsHeaders(request) }
    );
  } catch (err) {
    console.error("Extension token generation failed:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      status: 500,
      init: { headers: corsHeaders(request) },
    });
  }
}
