import { requireAuth } from "@/lib/server/auth";

/**
 * GET /api/auth/session
 * Backend session validation: single source of truth for dashboard and extension.
 * Validates Firebase ID token via existing requireAuth(); returns authenticated user info.
 */
export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    return Response.json({
      authenticated: true,
      user: {
        uid: user.uid,
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ authenticated: false }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}
