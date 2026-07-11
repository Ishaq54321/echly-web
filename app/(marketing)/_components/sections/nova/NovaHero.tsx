"use client";

/**
 * NovaHero — the reference's hero: a full-viewport, typography-led opening
 * that fits COMPLETELY above the fold. One typed two-line headline (all ink,
 * TypedText v2 — zero layout jump) and two pill CTAs over the living spark —
 * the breathing superellipse point cloud in the brand ramp (hover previews
 * the next color, click fires a recolor shockwave, press-and-hold puffs it
 * into 3D).
 *
 * Sizing: min-height fills the viewport under the fixed header, content
 * vertically centered — the next section starts exactly at the fold.
 */

import Link from "next/link";
import { Chrome } from "lucide-react";
import { TypedText } from "../../nova/TypedText";
import { Reveal } from "../../nova/Reveal";
import { SparkField } from "../../nova/SparkField";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/annote/bbgkibjfpdpiooneibjmafgiaiilpfhn";

export function NovaHero() {
  return (
    <section id="top" className="nv-hero">
      <SparkField />
      {/* soft white veil so the copy stays legible over the spark's core */}
      <div className="nv-hero-veil" aria-hidden="true" />

      <div className="nv-container nv-hero-content">
        <Reveal as="p" className="nv-hero-pill-row" delay={100}>
          <Link href="/blog" className="nv-hero-pill">
            <span className="nv-hero-pill-badge">New</span>
            Voice-to-ticket with full page context
            <span className="nv-hero-pill-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </Reveal>

        <h1 className="nv-hero-title">
          <TypedText
            startDelay={350}
            speed={38}
            caret="hide"
            segments={[
              { text: "The fastest way to report a bug" },
              { text: "and the easiest to fix.", br: true },
            ]}
          />
        </h1>

        <Reveal className="nv-hero-ctas" delay={700}>
          <a
            className="nv-btn nv-btn--primary"
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Chrome size={18} strokeWidth={2} aria-hidden="true" />
            Install the extension
          </a>
          <Link className="nv-btn nv-btn--tonal" href="/signup">
            Get Annote free
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
