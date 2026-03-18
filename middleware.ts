import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsHeaders } from "@/lib/server/cors";
import { requireAuth } from "@/lib/server/auth";

function hasAnyAuthCredential(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (authHeader && authHeader.trim().toLowerCase().startsWith("bearer ")) return true;
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return false;
  // We only attempt auth if it looks like a session cookie is present.
  // (Avoids turning "unauthenticated but safe" routes into 401s.)
  return /(?:^|;\s*)echly_session=/.test(cookieHeader);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Admin routes: access control is enforced in app/admin/layout.tsx via /api/admin/me (user.isAdmin).
  // Middleware cannot read Firestore, so we only pass through here.
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Only apply to /api/* routes; leave all other routes unchanged
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const headers = corsHeaders(request);

  // Handle OPTIONS preflight: return 200 immediately with CORS headers (exact origin for credentials: include)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        ...headers,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // If we have credentials, authenticate once here and forward the user id to the route handler.
  // If credentials are missing/invalid, let the route decide how to respond (some routes return safe fallbacks).
  const requestHeaders = new Headers(request.headers);
  if (!requestHeaders.has("x-user-id") && hasAnyAuthCredential(request)) {
    try {
      const user = await requireAuth(request);
      requestHeaders.set("x-user-id", user.uid);
    } catch {
      // Do not block; individual routes can enforce auth or return safe fallbacks.
    }
  }

  // For GET, POST, PATCH, DELETE: continue to handler and add CORS headers to response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin", "/admin/:path*"],
};
