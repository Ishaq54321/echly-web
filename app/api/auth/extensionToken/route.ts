import { requireAuth } from "@/lib/server/auth";
import { SignJWT } from "jose";

/**
 * GET /api/auth/extensionToken
 * Issues a short-lived access token for the extension.
 * Requires dashboard session cookie (credentials: 'include' from extension).
 * Does not accept Bearer auth — session cookie only.
 */
export async function GET(req: Request) {
  const user = await requireAuth(req);

  const secret = process.env.EXTENSION_TOKEN_SECRET;
  if (!secret) {
    console.error("EXTENSION_TOKEN_SECRET is not set");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = await new SignJWT({
    uid: user.uid,
    type: "extension",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(new TextEncoder().encode(secret));

  return Response.json({ token, uid: user.uid });
}
