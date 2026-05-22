"use client";

/**
 * <BuiltForAgencies />
 *
 * Caps the homepage's middle narrative (after Hero → ClickToTicket →
 * SessionsDetail). Four-card horizontal lifecycle — QA → Team → Review → Ship —
 * separated by thin arrow connectors. Each card is a contained, rounded panel
 * with the same vertical anatomy: eyebrow, title, body, divider, visual.
 *
 * Honest to what ships today: no integration logos, no custom-domain claims.
 * Card 3 says "custom-branded with your logo" (what actually ships) and shows a
 * neutral annote.app share URL. Card 4 shows structured ticket output with
 * priority + assignee metadata — proof the tickets are dev-ready.
 *
 * Scroll-reveal: a single IntersectionObserver adds `.in-view` to each card with
 * a 100ms stagger for a cascading fade-rise. Reduced motion is handled in CSS.
 *
 * Colors/tokens follow the existing marketing.css palette (--ink-*, --line-1,
 * --violet, --bg-1) rather than the slate rgba values in the source brief, to
 * stay consistent with Hero and ClickToTicket.
 */

import { useEffect } from "react";
import { Link as LinkIcon, Sparkle as LogoMarkIcon } from "lucide-react";

/** Avatar photography — files live under /public/marketing/people/. */
const PHOTO = {
  maya: "/marketing/people/maya-anand.jpg",
  daniel: "/marketing/people/daniel-torres.jpg",
  sarah: "/marketing/people/sarah-kim.jpg",
} as const;

function ArrowConnector() {
  return (
    <div className="agency-arrow" aria-hidden="true">
      <svg width="24" height="16" viewBox="0 0 24 16">
        <path
          d="M2 8h18m-4-4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function CardOne() {
  return (
    <div className="agency-card">
      <div className="agency-card-eyebrow">01 · QA</div>
      <h3 className="agency-card-title">Walk the build. Speak the issues.</h3>
      <p className="agency-card-body">
        Click anything that needs work. Annote captures the context. Voice notes
        become clean tickets.
      </p>
      <div className="agency-card-divider" />
      <div className="agency-card-visual">
        <div className="agency-avatar-row">
          <img src={PHOTO.maya} alt="" className="agency-avatar" />
          <span className="agency-avatar-label">Maya · QA on Aurora build</span>
        </div>
      </div>
    </div>
  );
}

function CardTwo() {
  return (
    <div className="agency-card">
      <div className="agency-card-eyebrow">02 · TEAM</div>
      <h3 className="agency-card-title">Everyone&apos;s notes in one place.</h3>
      <p className="agency-card-body">
        Designers, PMs, QA — all feedback into the same session. No more
        collating across five tools.
      </p>
      <div className="agency-card-divider" />
      <div className="agency-card-visual">
        <div className="agency-avatar-row">
          <img src={PHOTO.maya} alt="" className="agency-avatar" />
          <span className="agency-avatar-label">Maya · session host</span>
        </div>
        <div className="agency-avatar-row">
          <img src={PHOTO.daniel} alt="" className="agency-avatar" />
          <span className="agency-avatar-label">Daniel · QA review</span>
        </div>
        <div className="agency-avatar-row">
          <img src={PHOTO.sarah} alt="" className="agency-avatar" />
          <span className="agency-avatar-label">Sarah · design lead</span>
        </div>
      </div>
    </div>
  );
}

function CardThree() {
  return (
    <div className="agency-card">
      <div className="agency-card-eyebrow">03 · REVIEW</div>
      <h3 className="agency-card-title">Share an instant link with stakeholders.</h3>
      <p className="agency-card-body">
        Send the session link. They see who&apos;s assigned, leave comments,
        follow every ticket&apos;s activity.
      </p>
      <div className="agency-card-divider" />
      <div className="agency-card-visual">
        <div className="agency-share-url">
          <LinkIcon />
          <span className="agency-share-url-text">annote.app/s/aurora-may18</span>
        </div>
        <div className="agency-brand-chip">
          <LogoMarkIcon />
          <span>Custom-branded with your logo</span>
        </div>
      </div>
    </div>
  );
}

function CardFour() {
  return (
    <div className="agency-card">
      <div className="agency-card-eyebrow">04 · SHIP</div>
      <h3 className="agency-card-title">Every ticket is dev-ready.</h3>
      <p className="agency-card-body">
        Page, element, browser, OS — all attached. Plus status, priority,
        assignee. Devs get context, not guesswork.
      </p>
      <div className="agency-card-divider" />
      <div className="agency-card-visual">
        <div className="agency-ticket-card">
          <div className="agency-ticket-title">Sidebar collapses on first nav</div>
          <div className="agency-ticket-meta">
            <span className="agency-ticket-priority agency-ticket-priority--high">
              High
            </span>
            <span className="agency-ticket-assignee">
              <img src={PHOTO.daniel} alt="" />
              Daniel
            </span>
          </div>
        </div>
        <div className="agency-ticket-card">
          <div className="agency-ticket-title">Dashboard legend overlaps data</div>
          <div className="agency-ticket-meta">
            <span className="agency-ticket-priority agency-ticket-priority--medium">
              Med
            </span>
            <span className="agency-ticket-assignee">
              <img src={PHOTO.sarah} alt="" />
              Sarah
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BuiltForAgencies() {
  // Single observer for all four cards — adds .in-view as each enters the
  // viewport, with a 100ms stagger for a cascading reveal.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".agency-card"),
    );
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const index = els.indexOf(el);
            window.setTimeout(
              () => el.classList.add("in-view"),
              Math.max(0, index) * 100,
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="agencies" className="agency-section">
      <div className="agency-inner">
        <header className="agency-section-header">
          <div className="agency-eyebrow">BUILT FOR AGENCIES</div>
          <h2 className="agency-headline">
            Made for the people who ship work for other people.
          </h2>
          <p className="agency-subheading">
            From the first QA pass to the final dev handoff — Annote keeps every
            piece of feedback in one place, with the context that makes it
            actionable.
          </p>
        </header>

        <div className="agency-cards-row">
          <CardOne />
          <ArrowConnector />
          <CardTwo />
          <ArrowConnector />
          <CardThree />
          <ArrowConnector />
          <CardFour />
        </div>
      </div>
    </section>
  );
}
