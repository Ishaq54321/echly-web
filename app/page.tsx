import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/server/session";
import { MarketingHome } from "./(marketing)/_components/MarketingHome";

const TITLE = "Annote — Report Bugs Fast, Fix Them Faster";
const DESCRIPTION =
  "Click the element, say what's wrong. Annote writes a diagnosed ticket with console and network evidence — in one shared session your team fixes together.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Annote",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// SoftwareApplication schema — factual fields only (no fabricated ratings).
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Annote",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Chrome",
  description: DESCRIPTION,
  url: "https://annote.ai",
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "0",
      priceCurrency: "USD",
      description: "1 member, 50 tickets total, voice-to-ticket AI.",
    },
    {
      "@type": "Offer",
      name: "Business",
      price: "19",
      priceCurrency: "USD",
      description:
        "Unlimited members, sessions, and tickets, billed per user per month.",
    },
  ],
};

export default async function Home() {
  // PERF (Tier 1, T1.4): this verifySessionToken is NOT redundant with the
  // middleware. `/` is on the middleware's public allowlist (isPublicPath
  // returns true for "/") AND is absent from the middleware matcher, so the
  // STEP-5 auth gate that verifies annote_session never runs for this route.
  // The smart root therefore must verify the cookie itself to decide whether to
  // send an authed user to /dashboard or render marketing for a logged-out
  // visitor. Removing this verify would break that redirect decision.
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  // Smart root: authed users always go to /dashboard. Middleware (steps 6/7)
  // catches verified/onboarded gate failures and re-redirects to
  // /check-email or /onboarding. Phase 1 deliberately accepts that double
  // redirect for unverified-but-authed users rather than duplicating the
  // gate logic here.
  if (session) redirect("/dashboard");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
      <MarketingHome />
    </>
  );
}
