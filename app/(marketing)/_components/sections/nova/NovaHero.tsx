"use client";

/**
 * NovaHero — the reference's hero, transposed: a full-viewport, typography-
 * led opening that fits COMPLETELY above the fold. One typed two-line
 * headline with a travelling caret (TypedText v2 — zero layout jump), one
 * quiet sub, two pill CTAs — and behind it a slow brand AURORA (the logo's
 * violet/plum/magenta as large blurred light fields) that breathes on its
 * own and drifts a few px with the cursor, so the surface answers movement
 * the way the reference's hero does.
 *
 * Sizing: min-height fills the viewport under the fixed header, content
 * vertically centered — the next section starts exactly at the fold.
 */

import Link from "next/link";
import { TypedText } from "../../nova/TypedText";
import { Reveal } from "../../nova/Reveal";
import { SparkField } from "../../nova/SparkField";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/annote/bbgkibjfpdpiooneibjmafgiaiilpfhn";

export function NovaHero() {
  return (
    <section id="top" className="nv-hero">
      {/* the Gemini-grade spark: a breathing superellipse point cloud in the
          brand ramp — hover previews the next color, click fires a recolor
          shockwave, press-and-hold puffs it into 3D */}
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
              { text: "and the easiest to fix.", className: "nv-dim", br: true },
            ]}
          />
        </h1>

        <Reveal as="p" className="nv-body nv-hero-sub" delay={700}>
          Click the element, say what&apos;s wrong, and Annote writes the
          polished ticket. Your engineers get the full technical evidence —
          plus an AI that&apos;s already flagged the likely cause.
        </Reveal>

        <Reveal className="nv-hero-ctas" delay={850}>
          <a
            className="nv-btn nv-btn--primary"
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
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
