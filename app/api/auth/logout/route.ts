import { apiSuccess } from "@/lib/server/apiResponse";

export async function POST() {
  const response = apiSuccess({ loggedOut: true });

  response.cookies.set("echly_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
