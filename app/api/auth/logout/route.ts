import { requireAuth } from "@/lib/server/auth";
import { getAdminAuth } from "@/lib/server/firebaseAdmin";

const clearSessionCookie =
  "__session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None";

export async function POST(req: Request) {
  const headers = new Headers();
  headers.append("Set-Cookie", clearSessionCookie);

  try {
    const user = await requireAuth(req);
    await getAdminAuth().revokeRefreshTokens(user.uid);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), {
      status: 401,
      headers,
    });
  }
}
