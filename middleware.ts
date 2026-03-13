import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

export function middleware(request: NextRequest) {
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

  // Handle OPTIONS preflight: return 200 immediately with CORS headers
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // For GET, POST, PATCH, DELETE: continue to handler and add CORS headers to response
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin", "/admin/:path*"],
};
