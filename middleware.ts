import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsHeaders } from "@/lib/server/cors";
import { verifySessionToken } from "@/lib/server/session";
import {
  verifyOnboardedToken,
  ONBOARDED_COOKIE_NAME,
} from "@/lib/server/onboardingCookie";
import {
  verifyEmailVerifiedToken,
  EMAIL_VERIFIED_COOKIE_NAME,
} from "@/lib/server/emailVerifiedCookie";

const PASS_THROUGH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/check-email",
  "/reset-password",
  "/auth/action",
  "/onboarding",
  "/invite/",
  "/extension-auth",
  "/session/",
  "/_next/",
  "/favicon",
  "/manifest",
  "/robots",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PASS_THROUGH_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // STEP 1 — preserved: /dashboard/[id] → /session/[id]
  if (pathname.startsWith("/dashboard/") && pathname !== "/dashboard") {
    const sessionId = pathname.slice("/dashboard/".length);
    const redirectUrl = new URL(request.nextUrl);
    redirectUrl.pathname = `/session/${sessionId}`;
    return NextResponse.redirect(redirectUrl);
  }

  // STEP 2 — preserved: admin pass-through (auth in app/admin/layout.tsx)
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // STEP 3 — preserved: /api/* CORS handling (handlers do their own auth)
  if (pathname.startsWith("/api/")) {
    if (
      pathname === "/api/transcribe-audio" ||
      pathname.startsWith("/api/ai/improve") ||
      pathname === "/api/upload-attachment"
    ) {
      return NextResponse.next();
    }
    const headers = corsHeaders(request);
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: { ...headers, "Access-Control-Max-Age": "86400" },
      });
    }
    const response = NextResponse.next();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // STEP 4 — public allowlist (no auth required)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // STEP 5 — auth gate
  const sessionCookie = request.cookies.get("annote_session")?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // STEP 6 — email verification gate (uid-match prevents cookie leak across users)
  const verifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE_NAME)?.value;
  const verifiedPayload = await verifyEmailVerifiedToken(verifiedCookie);
  const isVerified =
    !!verifiedPayload && verifiedPayload.uid === session.uid;
  if (!isVerified) {
    const url = new URL("/check-email", request.url);
    url.searchParams.set("type", "verification");
    if (session.email) url.searchParams.set("email", session.email);
    return NextResponse.redirect(url);
  }

  // STEP 7 — onboarding gate (uid-match prevents user-A-cookie-leak-to-user-B)
  const onboardedCookie = request.cookies.get(ONBOARDED_COOKIE_NAME)?.value;
  const onboardedPayload = await verifyOnboardedToken(onboardedCookie);
  const isOnboarded =
    !!onboardedPayload && onboardedPayload.uid === session.uid;
  if (!isOnboarded) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin",
    "/admin/:path*",
    "/dashboard/:path*",
    "/dashboard",
    "/settings/:path*",
    "/settings",
    "/activity/:path*",
    "/activity",
    "/shared/:path*",
    "/shared",
    "/discussion/:path*",
    "/discussion",
    "/folders/:path*",
    "/folders",
    "/no-workspace",
  ],
};
