// Blog section chrome. Every /blog route renders inside the nova marketing
// shell (fixed header + footer) plus the blog's own editorial stylesheet.
//
// <SanityLive /> keeps these pages in sync with Sanity: when an editor hits
// Publish in the Studio, the live connection tells the page to revalidate and
// the new post shows up on the live site automatically — no redeploy needed.

import "../_styles";

import { SanityLive } from "@/sanity/lib/live";
import { MarketingHeader } from "../_components/MarketingHeader";
import { MarketingFooter } from "../_components/MarketingFooter";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-root nv-root blg-root">
      <MarketingHeader variant="solid" />
      {children}
      <MarketingFooter />
      <SanityLive />
    </div>
  );
}
