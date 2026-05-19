import { apiSuccess } from "@/lib/server/apiResponse";
import { ONBOARDED_COOKIE_NAME } from "@/lib/server/onboardingCookie";

export async function POST() {
  const response = apiSuccess({ loggedOut: true });

  response.cookies.set("annote_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(ONBOARDED_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
