import { getAdminAuth } from "@/lib/server/firebaseAdmin";

export interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  return { ...decoded, uid: decoded.uid } as DecodedIdToken;
}

export async function requireAuth(request: Request): Promise<DecodedIdToken> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Missing token" }),
      { status: 401 }
    );
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    return await verifyIdToken(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Invalid token" }),
      { status: 401 }
    );
  }
}
