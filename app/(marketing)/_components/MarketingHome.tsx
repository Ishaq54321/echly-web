import "../_styles/marketing.css";

import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { Hero } from "./sections/Hero";
import { ClickToTicket } from "./sections/ClickToTicket";
import { BuiltForAgenciesDark } from "./sections/BuiltForAgenciesDark";
import { Pricing } from "./sections/Pricing";
import { FAQ } from "./sections/FAQ";
import { FinalCTA } from "./sections/FinalCTA";

export function MarketingHome() {
  return (
    <div className="marketing-root">
      <MarketingHeader />
      <main>
        <Hero />
        <ClickToTicket />
        <BuiltForAgenciesDark />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
