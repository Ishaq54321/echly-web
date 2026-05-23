"use client";

import { useEffect, useRef, useState } from "react";
import { SessionDemoStage } from "../demos/session/SessionDemoStage";

/**
 * SessionsDetail â€” the SIGNATURE moment of the marketing page.
 *
 * Headline + sub sit ABOVE the demo, centered, narrow. The interactive session
 * view (forklift of the production route via <SessionDemoStage>) owns the
 * entire viewport-width canvas below, framed by an atmospheric light wash.
 *
 * The demo card animates in on scroll (translateY + scale + fade) via a single
 * IntersectionObserver â€” the section is meant to LAND rather than appear.
 */
export function SessionsDetail() {
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
    <section id="teams" className="signature-session-section">
      <header className="signature-session-header">
        <div className="section-eyebrow">
          <span className="section-eyebrow-dash">—</span>
          <span className="section-eyebrow-text">One place for everything</span>
        </div>
        <h2 className="signature-session-headline">
          Stop chasing feedback across
          <br />
          <span className="signature-session-headline-gradient">
            five different tools.
          </span>
        </h2>
        <p className="signature-session-sub">
          Email threads, Slack DMs, scattered Looms — replaced by one workflow.
          Click on the thing, say what&apos;s wrong, send the link.
        </p>
      </header>

      <div
        ref={demoRef}
        className={`signature-session-demo-wrapper${inView ? " in-view" : ""}`}
      >
        <SessionDemoStage />
      </div>
    </section>
  );
}
