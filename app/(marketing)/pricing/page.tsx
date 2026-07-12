import type { Metadata } from "next";
import { MarketingHeader } from "../_components/MarketingHeader";
import { MarketingFooter } from "../_components/MarketingFooter";
import { NovaPricing } from "../_components/sections/nova/NovaPricing";
import { NovaCTA } from "../_components/sections/nova/NovaCTA";

const TITLE = "Annote Pricing — Free Plan & Team Plans";
const DESCRIPTION =
  "Start free with 50 tickets a month. Upgrade for unlimited tickets, unlimited members, and custom branding. No credit card required.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/pricing",
    siteName: "Annote",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// NovaPricing renders its own visible heading as an <h2> (correct when it's a
// homepage section under NovaHero's <h1>). As a standalone page it still
// needs exactly one <h1> for correct heading hierarchy — this one is visually
// hidden so it doesn't duplicate NovaPricing's own "Simple pricing" heading.
const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function PricingPage() {
  return (
    <div className="marketing-root nv-root">
      <MarketingHeader />
      <main>
        <h1 style={visuallyHidden}>Annote pricing — free and team plans</h1>
        <NovaPricing />
        <NovaCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
