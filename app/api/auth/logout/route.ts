import { requireAuth } from "@/lib/server/auth";
import { getAdminAuth } from "@/lib/server/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    await getAdminAuth().revokeRefreshTokens(user.uid);
    return Response.json({ success: true });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 401 });
  }
}
