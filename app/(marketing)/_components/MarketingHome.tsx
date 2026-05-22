import "../_styles/marketing.css";

import { AnnouncementBar } from "./AnnouncementBar";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { Hero } from "./sections/Hero";
import { TrustStrip } from "./sections/TrustStrip";
import { ClickToTicket } from "./sections/ClickToTicket";
import { SessionsDetail } from "./sections/SessionsDetail";
import { Context } from "./sections/Context";
import { Agencies } from "./sections/Agencies";
import { Personas } from "./sections/Personas";
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
        <ClickToTicket />
        <SessionsDetail />
        <Context />
        <Agencies />
        <Personas />
        <Pricing />
        <FAQ />
        <Editorial />
        <Closing />
      </main>
      <MarketingFooter />
    </div>
  );
}
