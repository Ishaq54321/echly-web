import "../../_styles/marketing.css";
import "../../_styles/use-cases.css";

import Link from "next/link";
import { MarketingHeader } from "../MarketingHeader";
import { MarketingFooter } from "../MarketingFooter";

/* Shared chrome for every use-case page: the dark in-flow Annote navbar
   (variant="solid"), the page footer, and the .marketing-root token scope.
   The page body is wrapped in `.uc`, which is where use-cases.css hangs its
   retinted tokens. The dark flagship band is added per-page via <AiDiagnosisCard/>. */
export function UseCaseScaffold({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-root">
      <MarketingHeader variant="solid" />
      <main className="uc">{children}</main>
      <MarketingFooter />
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */
export function UseCaseHero({
  eyebrow,
  title,
  sub,
  micro,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub: React.ReactNode;
  micro: string;
}) {
  return (
    <section className="uc-hero">
      <div className="uc-wrap">
        <span className="uc-eyebrow">{eyebrow}</span>
        <h1 className="uc-hero-h1">{title}</h1>
        <p className="uc-hero-sub">{sub}</p>
        <div className="uc-hero-cta">
          <Link className="btn-primary lg" href="/signup">
            Get Annote for free <span className="arr">→</span>
          </Link>
          <a className="uc-btn-ghost" href="https://chromewebstore.google.com/detail/annote/bbgkibjfpdpiooneibjmafgiaiilpfhn" target="_blank" rel="noopener noreferrer">
            Install Chrome Extension
          </a>
        </div>
        <p className="uc-hero-micro">{micro}</p>
      </div>
    </section>
  );
}

/* ── Alternating feature row (copy + framed product mock) ──────────────────── */
export function FeatureRow({
  reversed = false,
  num,
  kicker,
  title,
  children,
  media,
}: {
  reversed?: boolean;
  num: string;
  kicker: string;
  title: React.ReactNode;
  children: React.ReactNode;
  media: React.ReactNode;
}) {
  return (
    <section className={"uc-feat" + (reversed ? " rev" : "")}>
      <div className="uc-wrap uc-feat-grid">
        <div className="uc-feat-copy">
          <div className="uc-feat-eyebrow">
            <span className="num">{num}</span>
            {kicker}
          </div>
          <h2 className="uc-feat-h">{title}</h2>
          {children}
        </div>
        <div className="uc-feat-media">
          <div className="uc-stage">{media}</div>
        </div>
      </div>
    </section>
  );
}

/* ── Closing CTA ──────────────────────────────────────────────────────────── */
export function ClosingCTA({
  title,
  sub = "Free to start, no credit card.",
}: {
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <section className="uc-closer">
      <div className="uc-wrap">
        <h2>{title}</h2>
        <p>{sub}</p>
        <div className="uc-hero-cta">
          <Link className="btn-primary lg" href="/signup">
            Get Annote for free <span className="arr">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* A small lock glyph reused in mock URL bars. */
export function LockGlyph() {
  return (
    <span className="lock">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    </span>
  );
}

/* The 6-bar recording waveform + REC dot used inside the voice-capture pill. */
export function CaptureWave() {
  return (
    <>
      <span className="rec">
        <i></i>Rec
      </span>
      <span className="wave">
        <i></i>
        <i></i>
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </span>
    </>
  );
}

/* Share (nodes) icon for the session header. */
export function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
    </svg>
  );
}

/* Send (paper-plane) icon for the comment composer. */
export function SendGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4z" />
    </svg>
  );
}
