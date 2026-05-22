"use client";

/**
 * <ClickToTicket />
 *
 * Replaces the former tabbed "Your Annote suite" section. Three vertically
 * stacked, scroll-revealed cards tell the workflow story — Superhuman's
 * premium contained-card pattern:
 *
 *   Each card = outer container (rounded, soft border, side stripes)
 *     ├─ header bar (brand-colored icon square + eyebrow label, dashed divider)
 *     └─ two-column body
 *          ├─ copy column (title, sub, "Learn more →", open-circle bullets)
 *          └─ visual column (per-section atmospheric gradient + floating mockup)
 *
 *   1. Capture   (copy left / visual right)  — blue→cream sky atmosphere
 *   2. Voice     (visual left / copy right)  — pink→warm energy atmosphere
 *   3. Sessions  (copy left / visual right)  — teal→purple collaboration depth
 *
 * Mockups are COMPOSED from real product styling — browser chrome, capture
 * pill, recording orb, session sidebar, status pills, comment threads — sized
 * down for marketing surface viewing. They float on the visual column's
 * atmospheric backdrop (the polaroid photo overlays of the prior pass are gone;
 * the atmosphere replaces them). Human photography (placeholders under
 * /marketing/people/) stays embedded as avatars inside the mockups.
 *
 * No tabs, no click-to-reveal. Each card fades + rises into view via a single
 * shared IntersectionObserver. Respects prefers-reduced-motion (handled in CSS
 * — the .ctt-card transition is suppressed there).
 */

import { useEffect, useMemo } from "react";
import { VoiceTicketDemo } from "../demos";
import { CapturePill } from "../demos/annote/CapturePill";
import { getTicketIconFromTags } from "@/lib/utils/getTicketIconFromTags";
import {
  Link as LinkIcon,
  UserPlus,
  MousePointerClick,
  AudioLines,
  Share,
} from "lucide-react";

/** Photography placeholders — swap files in /public/marketing/people/. */
const PHOTO = {
  maya: "/marketing/people/maya-anand.jpg",
  daniel: "/marketing/people/daniel-torres.jpg",
  sarah: "/marketing/people/sarah-kim.jpg",
  james: "/marketing/people/james-okafor.jpg",
} as const;

/** Sessions-mock ticket rows. Icons derive from the title via the same
 *  taxonomy the real dashboard ticket list uses (getTicketIconFromTags). */
const SESSION_TICKETS = [
  { title: "Onboarding skips step on back arrow", meta: "Maya · 12m ago" },
  { title: "Dashboard legend overlaps data in dark mode", meta: "Sarah · 34m ago" },
  { title: "Add to cart stays disabled after restock", meta: "Alex · 1h ago" },
  { title: "Settings save fires twice on Enter", meta: "Daniel · 2h ago" },
] as const;

/* ---------------- Icons ---------------- */

function ArrowRightIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M4 12 H20 M14 6 L20 12 L14 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------- Card primitives ---------------- */

function CardHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="ctt-card-header">
      <div className="ctt-card-header-eyebrow">
        <span className="ctt-card-header-icon">{icon}</span>
        <span className="ctt-card-header-label">{label}</span>
      </div>
    </div>
  );
}

function CardCopy({
  title,
  sub,
  learnMoreLabel,
  learnMoreHref,
  bullets,
}: {
  title: string;
  sub: string;
  learnMoreLabel: string;
  learnMoreHref: string;
  bullets: string[];
}) {
  return (
    <div className="ctt-card-copy">
      <h3 className="ctt-card-title">{title}</h3>
      <p className="ctt-card-sub">{sub}</p>
      <a href={learnMoreHref} className="ctt-card-learn-more">
        Learn more about {learnMoreLabel}
        <ArrowRightIcon />
      </a>
      <ul className="ctt-card-bullets">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
}

export function ClickToTicket() {
  // Single observer for all three cards — adds .ctt-in-view as each enters the
  // viewport, driving the fade + rise reveal.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".ctt-card"));
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("ctt-in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="product" className="ctt-root">
      <h2 className="ctt-headline">From click to ticket.</h2>

      {/* Section 1: Capture (copy left / visual right) */}
      <div className="ctt-card">
        <CardHeader icon={<MousePointerClick size={17} strokeWidth={2} />} label="Capture" />
        <div className="ctt-card-body">
          <CardCopy
            title="Capture anything in one click."
            sub="Annote grabs the element, the page, and the context. No selection tool, no cropping."
            learnMoreLabel="Capture"
            learnMoreHref="#capture"
            bullets={[
              "Element, page, viewport — all captured",
              "Works on any URL, live or staging",
              "Browser, OS, screen size attached",
            ]}
          />
          <div className="ctt-card-visual ctt-card-visual--capture">
            <CaptureMockup />
          </div>
        </div>
      </div>

      {/* Section 2: Voice (visual left / copy right) */}
      <div className="ctt-card">
        <CardHeader icon={<AudioLines size={17} strokeWidth={2} />} label="Voice" />
        <div className="ctt-card-body ctt-card-body--visual-left">
          <div className="ctt-card-visual ctt-card-visual--voice">
            <VoiceMockup />
            <ContextChips />
          </div>
          <CardCopy
            title="Talk through it. Send a ticket."
            sub="Speak in your own words. AI turns the recording into a structured ticket — title, description, severity, tags."
            learnMoreLabel="Voice"
            learnMoreHref="#voice"
            bullets={[
              "One-tap recording in the extension",
              "Rough notes become a polished ticket",
              "Edit, rewrite, or send as-is",
            ]}
          />
        </div>
      </div>

      {/* Section 3: Sessions (copy left / visual right) */}
      <div className="ctt-card">
        <CardHeader icon={<Share size={17} strokeWidth={2} />} label="Sessions" />
        <div className="ctt-card-body">
          <CardCopy
            title="Auto-grouped. Share the whole session."
            sub="Every capture from your session lives in one place. Send the link — clients, teammates, anyone sees the same thing."
            learnMoreLabel="Sessions"
            learnMoreHref="#sessions"
            bullets={[
              "One URL, no signup required",
              "Real-time comments and replies",
              "Open → in progress → resolved",
            ]}
          />
          <div className="ctt-card-visual ctt-card-visual--sessions">
            <SessionsMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Capture mockup ---------- */

function CaptureMockup() {
  return (
    <div className="capture-mock">
      <div className="capture-mock-browser">
        <div className="capture-mock-chrome">
          <div className="capture-mock-chrome-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="capture-mock-chrome-url" />
        </div>

        <div className="capture-mock-page">
          <div className="capture-mock-page-header" />
          <div className="capture-mock-page-tiers">
            <div className="capture-mock-tier" />
            <div className="capture-mock-tier capture-mock-tier--featured" />
            <div className="capture-mock-tier" />
          </div>

          <div className="capture-mock-testimonial">
            <div className="capture-mock-testimonial-quote">
              This section looks too crowded compared to the rest of the page near the sidebar.
            </div>
          </div>
        </div>

        <div className="capture-mock-highlight" />

        <div className="capture-mock-pill-anchor">
          <CaptureRecordingPill />
        </div>
      </div>
    </div>
  );
}

/**
 * Static instance of the real extension capture pill (voice mode), reused from
 * the hero demo. Frozen in the "listening" beat — a fixed waveform shape and a
 * 0:04 timer, no orchestrator. Mirrors HeroCaptureDemo's <CapturePill> usage.
 */
function CaptureRecordingPill() {
  // A pleasant fixed waveform silhouette (30 bars, matches the hero's BARS).
  const waveformLevels = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const base = Math.abs(Math.sin(i * 0.7)) * 0.7 + 0.15;
        const swell = Math.sin(i * 0.18 * 3) * 0.18 + 0.5;
        return Math.max(0.1, Math.min(1, base * swell));
      }),
    [],
  );

  return (
    <CapturePill
      targetRect={null}
      isListening={true}
      isFinishing={false}
      mode="voice"
      elapsedFormatted="0:04"
      waveformLevels={waveformLevels}
      hintPhase="listening"
      voiceError={null}
      pillStyle={{ position: "relative", pointerEvents: "none" }}
    />
  );
}

/* ---------- Voice mockup ---------- */

function VoiceMockup() {
  return (
    <div className="voice-mock">
      <div className="voice-mock-demo">
        <VoiceTicketDemo />
      </div>
    </div>
  );
}

/**
 * Floating context chips scattered around the voice card. While you talk, this
 * is the silent context Annote attaches to the ticket — page, element, browser,
 * OS, brand tokens. They're absolutely positioned around the card's edges (not
 * a tidy row) and fade in one by one once the card scrolls into view: the
 * stagger is driven off the parent `.ctt-card.ctt-in-view` class via per-chip
 * --d delays, so nothing animates until the section is seen, and reduced-motion
 * shows them all at rest.
 *
 * Position keys map to corner/edge anchors defined in marketing.css; dot color
 * classes mirror the former Context section's palette (v/b/m/a/t).
 */
const CONTEXT_CHIPS = [
  { pos: "tl", dot: "v", label: "aurora.com/dashboard" },
  { pos: "tr", dot: "m", label: "1440×900 · Chrome 124" },
  { pos: "br", dot: "a", label: "macOS Sequoia" },
  { pos: "bl", dot: "t", label: "Aurora brand tokens" },
] as const;

function ContextChips() {
  return (
    <div className="ctt-ctx" aria-hidden="true">
      {CONTEXT_CHIPS.map((chip, i) => (
        <span
          key={chip.label}
          className={`ctt-ctx-chip ctt-ctx-chip--${chip.pos}`}
          style={{ "--d": `${i * 140}ms` } as React.CSSProperties}
        >
          <i className={`cc-dot ${chip.dot}`} />
          {chip.label}
        </span>
      ))}
    </div>
  );
}

/* ---------- Sessions mockup ---------- */

function SessionsMockup() {
  return (
    <div className="sessions-mock">
      <div className="sessions-mock-topbar">
        <div className="sessions-mock-avatars">
          <img src={PHOTO.maya} alt="" />
          <img src={PHOTO.daniel} alt="" />
          <img src={PHOTO.sarah} alt="" />
        </div>
        {/* Share + Copy link merged pill — matches the SessionTopBar pill in the
            "Stop chasing feedback" section (SessionTopBar.tsx). */}
        <div className="flex items-center bg-[var(--brand)] rounded-[var(--radius-btn)] shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_1px_2px_rgba(90,73,191,0.3)] overflow-hidden">
          <span className="flex items-center gap-1 h-[28px] px-3 text-white text-[12px] font-semibold tracking-[-0.005em]">
            <UserPlus size={13} strokeWidth={2} />
            Share
          </span>
          <span className="w-[1.5px] self-stretch bg-white/50" />
          <span className="flex items-center justify-center h-[28px] w-[30px] text-white">
            <LinkIcon size={13} strokeWidth={2} />
          </span>
        </div>
      </div>

      <div className="sessions-mock-body">
        <div className="sessions-mock-sidebar">
          <div className="sessions-mock-session-header">
            <div className="sessions-mock-session-title">
              Q2 client QA
            </div>
            <div className="sessions-mock-session-meta">6 tickets · May 18</div>
          </div>

          <div className="sessions-mock-ticket-list">
            {SESSION_TICKETS.map((t, i) => {
              const Icon = getTicketIconFromTags(null, t.title);
              return (
                <div
                  key={t.title}
                  className={`sessions-mock-ticket${i === 0 ? " sessions-mock-ticket--active" : ""}`}
                >
                  <span className="sessions-mock-ticket-icon">
                    <Icon size={14} strokeWidth={2} />
                  </span>
                  <div className="sessions-mock-ticket-text">
                    <div className="sessions-mock-ticket-title">{t.title}</div>
                    <div className="sessions-mock-ticket-meta">{t.meta}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sessions-mock-detail">
          <div className="sessions-mock-ticket-header">
            <h4 className="sessions-mock-detail-title">
              Onboarding skips step on back arrow
            </h4>
          </div>

          <div className="sessions-mock-screenshot">
            <div className="sessions-mock-screenshot-phone">
              <div className="sessions-mock-screenshot-ui" />
              <div className="sessions-mock-screenshot-cta" />
            </div>
            <div className="sessions-mock-screenshot-pin">1</div>
          </div>

          <div className="sessions-mock-section">
            <div className="sessions-mock-section-label">Description</div>
            <p className="sessions-mock-description">
              On the back arrow, the onboarding flow skips ahead to step 5
              instead of returning to the previous step. The router push is
              overwriting history.replaceState.
            </p>
          </div>

          <div className="sessions-mock-section">
            <div className="sessions-mock-section-label">Tags</div>
            <div className="sessions-mock-tags">
              <span className="sessions-mock-tag">onboarding</span>
              <span className="sessions-mock-tag">navigation</span>
              <span className="sessions-mock-tag">bug</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
