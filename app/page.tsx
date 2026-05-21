import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/server/session";
import { MarketingHome } from "./(marketing)/_components/MarketingHome";

export default async function Home() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  // Smart root: authed users always go to /dashboard. Middleware (steps 6/7)
  // catches verified/onboarded gate failures and re-redirects to
  // /check-email or /onboarding. Phase 1 deliberately accepts that double
  // redirect for unverified-but-authed users rather than duplicating the
  // gate logic here.
  if (session) redirect("/dashboard");
  return <MarketingHome />;
}
