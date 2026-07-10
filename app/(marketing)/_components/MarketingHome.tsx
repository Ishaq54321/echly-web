// The redesigned marketing homepage — one coherent, typography-led system in
// the antigravity.google mold (near-monochrome cool greys, Google Sans Flex,
// typed headlines, quiet rounded surfaces, expo-eased entrances).
//
// marketing.css still loads first: the forklifted product demos (extension
// tray, session stage, edit modal) keep their rules there. nova.css follows
// and owns every .nv-* rule plus the .marketing-root.nv-root overrides.
//
// Previous sections (ClickToTicket, BuiltForAgenciesDark, EvidenceTrust,
// AiDiagnosisCard, FinalCTA, Hero/WhatTheySee) are parked, not deleted —
// their files remain under _components/sections/.

import "../_styles";

import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { NovaHero } from "./sections/nova/NovaHero";
import { NovaShowcase } from "./sections/nova/NovaShowcase";
import { NovaDiagnosis } from "./sections/nova/NovaDiagnosis";
import { NovaWorkflow } from "./sections/nova/NovaWorkflow";
import { NovaUseCases } from "./sections/nova/NovaUseCases";
import { NovaSolutions } from "./sections/nova/NovaSolutions";
import { NovaPricing } from "./sections/nova/NovaPricing";
import { NovaFAQ } from "./sections/nova/NovaFAQ";
import { NovaCTA } from "./sections/nova/NovaCTA";

export function MarketingHome() {
  return (
    <div className="marketing-root nv-root">
      <MarketingHeader />
      <main>
        <NovaHero />
        <NovaShowcase />
        <NovaDiagnosis />
        <NovaWorkflow />
        <NovaUseCases />
        <NovaSolutions />
        <NovaPricing />
        <NovaFAQ />
        <NovaCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
