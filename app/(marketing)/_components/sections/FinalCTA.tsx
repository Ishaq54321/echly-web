/**
 * FinalCTA â€” the closing moment of the marketing page.
 *
 * Replaces the previous tagline-repeat ("Feedback at the speed of seeing it.")
 * with a sharper call to action: one headline, one sub, two CTAs (primary +
 * Chrome extension). The headline picks up the same dark-to-violet gradient
 * the rest of the page uses for big type.
 */
import Link from "next/link";
import { ArrowIcon, DownloadIcon } from "../icons";

export function FinalCTA() {
  return (
    <section className="final-cta-section">
      <div className="final-cta-container">
        <h2 className="final-cta-headline">Try it on the next QA pass.</h2>
        <p className="final-cta-sub">
          Free to start. No credit card. Captures load in under a second.
        </p>

        <div className="final-cta-buttons">
          <Link className="mk-hero-cta final-cta-primary" href="/signup">
            <span className="mk-hero-cta-label">Get Annote for free</span>
            <span className="mk-hero-cta-arrow">
              <ArrowIcon size={14} />
            </span>
          </Link>
          <a
            className="final-cta-secondary"
            href="https://chrome.google.com/webstore/detail/annote"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon size={18} />
            <span>Install Chrome Extension</span>
          </a>
        </div>
      </div>
    </section>
  );
}
