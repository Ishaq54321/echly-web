import "../_styles/marketing.css";

import { AnnouncementBar } from "./AnnouncementBar";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { Hero } from "./sections/Hero";
import { TrustStrip } from "./sections/TrustStrip";
import { Suite } from "./sections/Suite";
import { Workflow } from "./sections/Workflow";
import { SessionsDetail } from "./sections/SessionsDetail";
import { Context } from "./sections/Context";
import { Agencies } from "./sections/Agencies";
import { Personas } from "./sections/Personas";
import { Integrations } from "./sections/Integrations";
import { Pricing } from "./sections/Pricing";
import { FAQ } from "./sections/FAQ";
import { Editorial } from "./sections/Editorial";
import { Closing } from "./sections/Closing";

export function MarketingHome() {
  return (
    <div className="marketing-root">
      <AnnouncementBar />
      <MarketingHeader />
      <main>
        <Hero />
        <TrustStrip />
        <Suite />
        <Workflow />
        <SessionsDetail />
        <Context />
        <Agencies />
        <Personas />
        <Integrations />
        <Pricing />
        <FAQ />
        <Editorial />
        <Closing />
      </main>
      <MarketingFooter />
    </div>
  );
}
