/**
 * NovaSolutions — the reference's "try solutions" band, matched: two white
 * panels, copy dead-center (badge pill → two-line heading with a dimmed
 * second line → one pill action), and the particle field that condenses on
 * hover into the reference's exact glyphs — curly braces { } flanking the
 * teams panel's copy, a ring of six circles around the agencies panel's.
 */

import Link from "next/link";
import { Reveal } from "../../nova/Reveal";
import { ParticleMorph } from "../../nova/ParticleMorph";

export function NovaSolutions() {
  return (
    <section className="nv-solutions">
      <div className="nv-container">
        <div className="nv-solutions-grid">
          <Reveal as="article" className="nv-solution">
            <ParticleMorph shape="braces" />
            <div className="nv-solution-body">
              <span className="nv-solution-badge">Available at no charge</span>
              <h3 className="nv-h3">
                For teams
                <br />
                <span className="nv-dim">Start free today</span>
              </h3>
              <Link className="nv-btn nv-btn--primary" href="/signup">
                Get Annote
              </Link>
            </div>
          </Reveal>

          <Reveal as="article" className="nv-solution" delay={120}>
            <ParticleMorph shape="rings" />
            <div className="nv-solution-body">
              <span className="nv-solution-badge">Now available!</span>
              <h3 className="nv-h3">
                For agencies
                <br />
                <span className="nv-dim">Built for client work</span>
              </h3>
              <Link className="nv-btn nv-btn--tonal" href="/use-cases/agencies">
                See how agencies use it
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
