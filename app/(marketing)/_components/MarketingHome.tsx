import "../_styles/marketing.css";

import { AnnouncementBar } from "./AnnouncementBar";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { Hero } from "./sections/Hero";
import { TrustStrip } from "./sections/TrustStrip";
import { ClickToTicket } from "./sections/ClickToTicket";
import { SessionsDetail } from "./sections/SessionsDetail";
import { BuiltForAgencies } from "./sections/BuiltForAgencies";
import { WhoItsFor } from "./sections/WhoItsFor";
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
        <BuiltForAgencies />
        <WhoItsFor />
        <Pricing />
        <FAQ />
        <Editorial />
        <Closing />
      </main>
      <MarketingFooter />
    </div>
  );
}
