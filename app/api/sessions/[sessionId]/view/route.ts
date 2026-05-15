import { recordSessionViewIfNewRepo } from "@/lib/repositories/sessionsRepository.server";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rateLimit";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { composeFullName } from "@/lib/utils/nameSplit";

async function loadViewerProfile(
  uid: string
): Promise<{ displayName: string | null; avatarUrl: string | null }> {
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  let email: string | null = null;
  try {
    const snap = await adminDb.doc(`users/${uid}`).get();
    if (snap.exists) {
      const d = snap.data() ?? {};
      const composed = composeFullName(
        typeof d.firstName === "string" ? d.firstName : null,
        typeof d.lastName === "string" ? d.lastName : null
      );
      displayName =
        composed ||
        (typeof d.authDisplayName === "string" && d.authDisplayName.trim()
          ? d.authDisplayName.trim()
          : null);
      avatarUrl =
        typeof d.photoURL === "string" && d.photoURL.trim()
          ? d.photoURL.trim()
          : typeof d.avatarUrl === "string" && d.avatarUrl.trim()
            ? d.avatarUrl.trim()
            : null;
      if (typeof d.email === "string" && d.email.trim()) {
        email = d.email.trim();
      }
    }
  } catch {
    // Firestore read failed — fall through to Auth lookup
  }

  if (!displayName || !avatarUrl) {
    try {
      const { getAuth } = await import("firebase-admin/auth");
      const authUser = await getAuth().getUser(uid);
      if (!displayName) {
        const fallbackEmail = email ?? authUser?.email ?? null;
        if (fallbackEmail) {
          displayName = fallbackEmail.split("@")[0] ?? null;
        }
      }
      if (!avatarUrl && authUser?.photoURL) {
        avatarUrl = authUser.photoURL;
      }
    } catch {
      // Auth lookup failed — continue with whatever we have
    }
  }

  return { displayName, avatarUrl };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  if (!sessionId) {
    return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
  }
  const rateKey = `session-view:${sessionId}:${clientKeyFromRequest(req)}`;
  const rate = checkRateLimit({ key: rateKey, max: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return apiError({
      code: "FORBIDDEN",
      message: "Too Many Requests",
      status: 429,
    });
  }

  let body: { viewerId?: unknown } = {};
  try {
    body = (await req.json()) as {
      viewerId?: unknown;
    };
  } catch {
    body = {};
  }

  const anonViewerIdFromBody =
    typeof body.viewerId === "string" && body.viewerId.startsWith("anon_")
      ? body.viewerId.trim()
      : "";

  const built = await tryBuildRequestContext({
    req,
    sessionId,
    optionalAuth: true,
  });
  if (!built.ok) {
    return built.response;
  }
  const context = built.ctx;

  if (!context.access?.capabilities.canView) {
    return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
  }

  try {
    if (context.userId) {
      const profile = await loadViewerProfile(context.userId);
      await recordSessionViewIfNewRepo(sessionId, context.userId, profile);
    } else if (anonViewerIdFromBody !== "") {
      await recordSessionViewIfNewRepo(sessionId, anonViewerIdFromBody);
    }
    return apiSuccess({});
  } catch (err) {
    console.error("POST /api/sessions/[sessionId]/view:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
  }
}
