"use client";

/**
 * NovaCTA — the closing band: an inverse near-black rounded panel with
 * ghosted capture-telemetry code rain drifting behind (masked away from the
 * center so the copy stays clean — the reference decorates its dark bands the
 * same way), a typed two-line headline, and inverted pill actions.
 */

import Link from "next/link";
import { TypedText } from "../../nova/TypedText";
import { Reveal } from "../../nova/Reveal";
import { CodeRain } from "../../nova/CodeRain";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/annote/bbgkibjfpdpiooneibjmafgiaiilpfhn";

export function NovaCTA() {
  return (
    <section id="contact" className="nv-cta">
      <div className="nv-container">
        <div className="nv-cta-panel">
          <CodeRain cols={6} rows={20} />
          <div className="nv-cta-content">
            <h2 className="nv-h2 nv-cta-title">
              <TypedText
                speed={42}
                caret="hide"
                segments={[
                  { text: "Try it on your" },
                  { text: "next QA pass", br: true },
                ]}
              />
            </h2>
            <Reveal as="p" className="nv-body nv-cta-sub" delay={200}>
              Free to start. Your first organized session is one capture away.
            </Reveal>
            <Reveal className="nv-cta-actions" delay={320}>
              <Link className="nv-btn nv-btn--primary-inverse" href="/signup">
                Get Annote free
              </Link>
              <a
                className="nv-btn nv-btn--ghost-inverse"
                href={CHROME_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Install the extension
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
