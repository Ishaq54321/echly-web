import Link from "next/link";
import { ArrowIcon } from "../icons";

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-copy">
        <h1 className="hero-h1">
          Feedback at the
          <br />
          speed of seeing it.
        </h1>
        <p className="hero-sub">
          Click. Speak. Send the link. AI turns rough notes into polished
          tickets your team can ship.
        </p>
        <Link className="btn-primary lg" href="/signup">
          Get Annote <ArrowIcon size={13} />
        </Link>
      </div>

      <div className="hero-stage">
        {/* Phase 2B: replace with hero product image or video */}
        <div className="hero-portrait">
          <div className="hero-portrait-placeholder">Hero visual</div>
        </div>

        {/* Phase 2B: replace this static comment card with a real
            <FeedbackComment> demo when wiring the product components in. */}
        <div className="hero-card hero-comment">
          <p className="hc-text">
            Looks like the New project button doesn&apos;t show any loading
            state when clicked — feels like nothing happened.
          </p>
          <div className="hc-actions">
            <button type="button" className="hc-reply">
              Reply
            </button>
          </div>
        </div>

        <div className="hero-card hero-time">
          <div className="ht-row">
            <span className="ht-dot" />
            Captured just now
          </div>
          <div className="ht-row">
            <span className="ht-dot v" />
            aurora.com/dashboard
          </div>
          <div className="ht-row">
            <span className="ht-dot p" />
            Chrome 124 · macOS
          </div>
        </div>

        {/* Phase 2B: replace this static ticket card with a real
            <FeedbackDetail> mounted via next/dynamic, fed mockHeroTicket. */}
        <div className="hero-card hero-ticket">
          <div className="ht-head">
            <span className="ht-ai">
              <span className="ht-ai-spark" />
              ANNOTE AI · POLISHED
            </span>
            <span className="ht-sev">High</span>
          </div>
          <div className="ht-title">
            New project button missing loading state
          </div>
          <div className="ht-meta">
            <div className="ht-meta-row">
              <span>Page</span>
              <b>aurora.com/dashboard</b>
            </div>
            <div className="ht-meta-row">
              <span>Element</span>
              <b>New project button</b>
            </div>
            <div className="ht-meta-row">
              <span>Reporter</span>
              <b>Maya A.</b>
            </div>
          </div>
          <div className="ht-tags">
            <span>bug</span>
            <span>dashboard</span>
            <span>ux</span>
            <span>cta</span>
          </div>
          <button type="button" className="ht-send">
            Send <ArrowIcon size={11} />
          </button>
        </div>

        <div className="hero-card hero-polish">
          <span className="hp-ai-spark" />
          Polish this for engineering
        </div>

        <div className="hero-card hero-voice">
          <span className="hv-pulse" />
          <span className="hv-time">0:08</span>
          <div className="hv-wave" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, i) => (
              <i key={i} />
            ))}
          </div>
          <span className="hv-send">→</span>
        </div>
      </div>
    </section>
  );
}
