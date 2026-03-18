import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { requireAuth } from "@/lib/server/auth";
import { corsHeaders } from "@/lib/server/cors";

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
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    const errRes = res instanceof Response ? res : new Response(JSON.stringify({ error: "Unauthorized - Missing or invalid session" }), { status: 401 });
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(request) },
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

    return NextResponse.json(
      {
        extensionToken,
        user: {
          uid,
          email,
        },
      },
      { headers: corsHeaders(request) }
    );
  } catch (err) {
    console.error("Extension token generation failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}
