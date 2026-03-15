import { cookies } from "next/headers";
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

  if (authHeader && authHeader.startsWith("Bearer ")) {
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

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (sessionCookie) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(
        sessionCookie,
        true
      );
      return { ...decoded, uid: decoded.uid } as DecodedIdToken;
    } catch (error) {
      console.error("Session cookie verification failed:", error);
      throw new Response(
        JSON.stringify({ error: "Unauthorized - Invalid session" }),
        { status: 401 }
      );
    }
  }

  throw new Response(
    JSON.stringify({ error: "Unauthorized - Missing token or session" }),
    { status: 401 }
  );
}
