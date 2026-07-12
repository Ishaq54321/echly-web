"use client";

/**
 * NovaShowcase — the second section as a premium INSET PANEL: a near-black
 * rounded band with left/right page margins (not full-bleed), carrying the
 * code-rain + star ambience, a centered header, and the SessionDemoStage in
 * a dark-elevated frame.
 *
 * The scroll animation belongs to the WHOLE PANEL: as it enters the viewport
 * it zooms in (scale 0.9 → 1) and fades up, scrubbed against scroll — the
 * premium-Webflow / reference-video entrance.
 *
 * NB: this page scrolls on <body> and `scroll` doesn't bubble, so the scrub
 * listens in the CAPTURE phase on document (sees every scroller).
 */

import { useEffect, useRef } from "react";
import { SessionDemoStage } from "../../demos/session/SessionDemoStage";
import { CursorTip } from "../../nova/CursorTip";

export function NovaShowcase() {
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = bandRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.setProperty("--nv-band-scale", "1");
      node.style.setProperty("--nv-band-in", "1");
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the band's top crosses the bottom of the viewport → 1 once it
      // has risen ~38% of the way up.
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.55)));
      const eased = 1 - Math.pow(1 - p, 3);
      node.style.setProperty(
        "--nv-band-scale",
        (0.82 + eased * 0.18).toFixed(4),
      );
      node.style.setProperty("--nv-band-in", eased.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="teams" className="nv-showcase">
      <div className="nv-showcase-band" ref={bandRef}>
        <div className="nv-showcase-inner">
          <div className="nv-showcase-head">
            <p className="nv-eyebrow nv-eyebrow--center nv-eyebrow--inverse">
              Sessions
            </p>
            <h2 className="nv-h2 nv-showcase-title">
              Every bug, in one
              <br />
              <span className="nv-dim-inverse">organized session.</span>
            </h2>
            <p className="nv-body nv-showcase-sub">
              Tickets, screenshots, evidence, and AI diagnoses — collected,
              sorted, and shareable with one link.
            </p>
          </div>

          <div className="nv-showcase-frame">
            <SessionDemoStage />
            <CursorTip label="Click to interact" />
          </div>
        </div>
      </div>
    </section>
  );
}
