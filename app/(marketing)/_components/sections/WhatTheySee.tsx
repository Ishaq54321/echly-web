"use client";

import { useEffect, useRef, useState } from "react";
import { SessionDemoStage } from "../demos/session/SessionDemoStage";

/**
 * <WhatTheySee />
 *
 * "What they see" — the signature session demo (forklifted SessionDemoStage),
 * animated in via IntersectionObserver. Sits on the normal light page
 * background. Extracted from BuiltForAgenciesDark so it can be ordered
 * independently of the dark "BUILT FOR AGENCIES" block.
 */
export function WhatTheySee() {
  const demoRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const node = demoRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="teams" className="signature-session-section--light">
      <header className="signature-session-header">
        <div className="section-eyebrow">
          <span className="section-eyebrow-dash">✦</span>
          <span className="section-eyebrow-text">Your team&apos;s bug workspace</span>
        </div>
        <h2 className="signature-session-headline">
          Every bug your team reports, in
          <br />
          <span className="signature-session-headline-gradient">
            one organized session.
          </span>
        </h2>
        <p className="signature-session-sub">
          Tickets, screenshots, evidence, and AI diagnoses — all collected,
          sorted, and instantly shareable with one link.
        </p>
      </header>

      <div
        ref={demoRef}
        className={`signature-session-demo-wrapper${inView ? " in-view" : ""}`}
      >
        <span className="signature-demo-pill" aria-hidden="true">
          <span className="signature-demo-pill-tag">Demo</span>
          <span className="signature-demo-pill-label">Live session preview</span>
        </span>
        <SessionDemoStage />
      </div>
    </section>
  );
}
