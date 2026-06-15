import "../_styles/marketing.css";

import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { Hero } from "./sections/Hero";
import { WhatTheySee } from "./sections/WhatTheySee";
import { ClickToTicket } from "./sections/ClickToTicket";
import { BuiltForAgenciesDark } from "./sections/BuiltForAgenciesDark";
import { EvidenceTrust, AiDiagnosisCard } from "./sections/EvidenceTrust";
import { Pricing } from "./sections/Pricing";
import { FAQ } from "./sections/FAQ";
import { FinalCTA } from "./sections/FinalCTA";

export function MarketingHome() {
  return (
    <div className="marketing-root">
      <MarketingHeader />
      <main>
        <Hero />
        <WhatTheySee />
        <AiDiagnosisCard />
        <ClickToTicket />
        <BuiltForAgenciesDark />
        <EvidenceTrust />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
