"use client";

/**
 * NovaUseCases — the use-cases section, now carrying the lifecycle demos the
 * previous homepage shipped (per feedback): the QA → Team → Review → Ship
 * 2×2 grid from BuiltForAgenciesDark (voice-memo waveform, live-session
 * presence, share-link card, dev-ready tickets) plus the full-width EVIDENCE
 * block, all inside the dark inset `.ag-root` panel.
 *
 * The new system supplies the chrome: a nova header above the panel, the
 * panel realigned to the nv container with the system's near-black surface
 * and 48px radius (`.nv-root .ag-root` overrides in nova.css), and a row of
 * arrow-links into the use-case pages below.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAnimationPause } from "../../useAnimationPause";
import {
  CardQA,
  CardTeam,
  CardReview,
  CardShip,
} from "../BuiltForAgenciesDark";
import { EvidenceBlock } from "../EvidenceTrust";

const CASE_LINKS = [
  { label: "QA testing", href: "/use-cases/qa-testing" },
  { label: "Design review", href: "/use-cases/design-review" },
  { label: "Client feedback", href: "/use-cases/client-feedback" },
  { label: "Agencies", href: "/use-cases/agencies" },
  { label: "Teams", href: "/use-cases/teams" },
] as const;

export function NovaUseCases() {
  // Pause the panel's infinite CSS animations (waveform bars, presence pulses,
  // review rings, evidence loops) while it's scrolled out of view.
  const ref = useAnimationPause<HTMLElement>();

  return (
    <section id="personas" className="nv-cases">
      <section
        ref={ref}
        className="ag-root nv-agency"
        aria-label="Product lifecycle demos"
      >
        <div className="ag-bg-grain"></div>

        {/* header lives INSIDE the dark panel (per the reference layout):
            kicker + title left, lede + meta right */}
        <header className="ag-head">
          <div className="ag-head-left">
            <div className="ag-kicker">
              <span className="ag-kicker-mark">✦</span>
              <span>USE CASES</span>
            </div>
            <h2 className="ag-title">
              From client QA to dev handoff, <em>in one place.</em>
            </h2>
          </div>
          <div className="ag-head-right">
            <p className="ag-lede">
              Walk the build, capture every issue, and hand developers tickets
              that are already complete. One session, one link, one workflow.
            </p>
            <div className="ag-head-meta">
              <span className="ag-head-dot"></span>
              Built for studios and in-house teams shipping client work.
            </div>
          </div>
        </header>

        <div className="ag-grid">
          <CardQA />
          <CardTeam />
          <CardReview />
          <CardShip />
        </div>
        <EvidenceBlock />
      </section>

      <div className="nv-container">
        <nav className="nv-cases-links" aria-label="Use cases">
          {CASE_LINKS.map((c) => (
            <Link key={c.href} className="nv-arrow-link" href={c.href}>
              {c.label}
              <ChevronRight size={16} strokeWidth={2} />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
