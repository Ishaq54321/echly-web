import "../_styles/marketing.css";

import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { Hero } from "./sections/Hero";
import { ClickToTicket } from "./sections/ClickToTicket";
import { SessionsDetail } from "./sections/SessionsDetail";
import { BuiltForAgenciesDark } from "./sections/BuiltForAgenciesDark";
import { WhoItsFor } from "./sections/WhoItsFor";
import { Pricing } from "./sections/Pricing";
import { FAQ } from "./sections/FAQ";
import { Editorial } from "./sections/Editorial";
import { Closing } from "./sections/Closing";

export function MarketingHome() {
  return (
    <div className="marketing-root">
      <MarketingHeader />
      <main>
        <Hero />
        <SessionsDetail />
        <BuiltForAgenciesDark />
        <ClickToTicket />
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
