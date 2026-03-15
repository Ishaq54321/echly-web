import { getAdminAuth } from "@/lib/server/firebaseAdmin";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing token" }), {
      status: 401,
    });
  }

  const idToken = authHeader.split("Bearer ")[1];
  const adminAuth = getAdminAuth();

  try {
    await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 5 * 24 * 60 * 60 * 1000,
    });

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `__session=${sessionCookie}; HttpOnly; Secure; SameSite=None; Path=/`
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
    });
  }
}
