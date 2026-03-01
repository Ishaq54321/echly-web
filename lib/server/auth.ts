import { adminAuth } from "@/lib/server/firebaseAdmin";

export interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

/**
 * Extracts Bearer idToken from Authorization header, verifies it with Firebase Admin,
 * and returns the decoded token. Throws a 401 Response if missing or invalid.
 */
export async function requireAuth(request: Request): Promise<DecodedIdToken> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || typeof authHeader !== "string") {
    throw new Response(
      JSON.stringify({ success: false, error: "Missing Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const match = authHeader.trim().match(/^Bearer\s+(.+)$/i);
  const idToken = match?.[1]?.trim();
  if (!idToken) {
    throw new Response(
      JSON.stringify({ success: false, error: "Invalid Authorization format. Expect: Bearer <idToken>" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded as DecodedIdToken;
  } catch {
    throw new Response(
      JSON.stringify({ success: false, error: "Invalid or expired token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}
