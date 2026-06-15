"use client";

import { EvidenceBlock } from "./EvidenceTrust";

/**
 * <BuiltForAgenciesDark />
 *
 * The dark "BUILT FOR AGENCIES" block: a 2x2 lifecycle grid
 * (QA → Team → Review → Ship) plus the full-width EVIDENCE card, all sharing
 * one inset dark .ag-root panel. ("What they see" used to lead this component
 * but now lives in its own <WhatTheySee /> so the two can be ordered
 * independently.) All `.ag-*` styles live in marketing.css scoped under
 * `.marketing-root`.
 */

/**
 * QA voice-memo waveform bars. Each bar is a rounded pill of varied height —
 * heights track a realistic voice envelope (quiet → speech peaks → pauses →
 * peaks → fade) like real voice tools (Voice Memos / Loom / Otter). ~55 bars
 * at 3.5px width. Bars pulse around baseline via CSS animation.
 */
const QA_WAVE_HEIGHTS: number[] = [
  3, 4, 3, 5, 4, 6, 4, 3, 7, 5, 9, 6, 11, 8, 14, 18,
  12, 20, 22, 16, 10, 6, 4, 3, 5, 4, 3, 5, 7, 11, 15, 19,
  24, 21, 17, 13, 9, 6, 4, 3, 5, 4, 7, 5, 10, 14, 18, 23,
  26, 22, 17, 12, 8, 5, 3,
];

type EyebrowProps = { children: React.ReactNode };

function Eyebrow({ children }: EyebrowProps) {
  return <div className="ag-eyebrow">{children}</div>;
}

type AvatarProps = {
  initials: string;
  hue?: number;
  size?: number;
  ring?: boolean;
  src?: string;
};

const PHOTO = {
  maya: "/marketing/people/Maya.jpg",
  daniel: "/marketing/people/Daniel.jpg",
  sarah: "/marketing/people/Sarah.jpg",
  jordan: "/marketing/people/Jordan.jpg",
  anya: "/marketing/people/Anya.jpg",
} as const;

function Avatar({ initials, hue = 280, size = 26, ring = false, src }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className={"ag-av ag-av--photo" + (ring ? " ring" : "")}
        style={{ width: size, height: size }}
      />
    );
  }
  const bg = `radial-gradient(120% 120% at 20% 15%, oklch(72% 0.14 ${hue}) 0%, oklch(46% 0.16 ${hue + 30}) 60%, oklch(28% 0.10 ${hue + 60}) 100%)`;
  return (
    <span
      className={"ag-av" + (ring ? " ring" : "")}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initials}
    </span>
  );
}

function CardQA() {
  return (
    <article className="ag-card ag-card--qa">
      <div className="ag-card-head">
        <Eyebrow>01 · QA</Eyebrow>
        <h3 className="ag-h">
          Walk the build.
          <br />
          Speak the issues.
        </h3>
        <p className="ag-p">
          Click anything that needs work. Annote captures the context — voice
          notes become clean tickets.
        </p>
      </div>

      <div className="ag-stage qa-stage">
        <div className="qa-canvas">
          <div className="qa-canvas-bar">
            <i></i>
            <i></i>
            <i></i>
            <span className="qa-url">aurora.studio/dashboard</span>
          </div>
          <div className="qa-canvas-body">
            <div className="qa-block w70"></div>
            <div className="qa-block w50"></div>
            <div className="qa-grid">
              <div className="qa-card-mock"></div>
              <div className="qa-card-mock target">
                <span className="qa-target-ring"></span>
              </div>
              <div className="qa-card-mock"></div>
            </div>
          </div>
        </div>

        <div className="qa-pin">
          <span className="qa-pin-dot"></span>
          <span className="qa-pin-num">1</span>
        </div>

        <div className="qa-memo">
          <div className="qa-memo-head">
            <Avatar initials="M" hue={310} size={28} src={PHOTO.maya} />
            <div className="qa-memo-meta">
              <div className="qa-memo-name">
                Maya <span className="qa-memo-role">· QA on Aurora build</span>
              </div>
              <div className="qa-memo-sub">
                <span className="qa-rec-dot"></span> Recording ·{" "}
                <span className="qa-timer">00:14</span>
              </div>
            </div>
            <div className="qa-memo-stop">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect
                  x="1.5"
                  y="1.5"
                  width="7"
                  height="7"
                  rx="1.2"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
          <div className="qa-wave">
            {QA_WAVE_HEIGHTS.map((h, i) => (
              <i
                key={i}
                style={
                  {
                    "--h": `${h}px`,
                    animationDelay: `${(i * 0.09) % 2.8}s`,
                  } as React.CSSProperties
                }
              ></i>
            ))}
          </div>
          <div className="qa-transcribe">
            <span className="qa-trans-label">Auto-transcribing</span>
            <span className="qa-trans-text">
              &ldquo;Hover state on the card disappears after the first—&rdquo;
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function CardTeam() {
  const people = [
    { name: "Maya", role: "session host", hue: 310, initials: "M", status: "Listening", src: PHOTO.maya },
    { name: "Daniel", role: "QA review", hue: 200, initials: "D", status: "3 notes", src: PHOTO.daniel },
    { name: "Sarah", role: "design lead", hue: 30, initials: "S", status: "Reviewing", src: PHOTO.sarah },
  ];
  return (
    <article className="ag-card ag-card--team">
      <div className="ag-card-head">
        <Eyebrow>02 · TEAM</Eyebrow>
        <h3 className="ag-h">
          Every feedback
          <br />
          in one place.
        </h3>
        <p className="ag-p">
          Designers, PMs, QA — all feedback into the same session. No more
          collating across five tools.
        </p>
      </div>

      <div className="ag-stage team-stage">
        <div className="team-session">
          <span className="team-session-pulse"></span>
          <span className="team-session-label">LIVE SESSION</span>
          <span className="team-session-name">Aurora · May 18</span>
          <span className="team-session-spacer"></span>
          <span className="team-session-count">
            <span className="team-count-dots">
              <i></i>
              <i></i>
              <i></i>
            </span>
            3
          </span>
        </div>

        <div className="team-list">
          {people.map((p, i) => (
            <div
              key={p.name}
              className="team-row"
              style={{ animationDelay: `${0.15 + i * 0.22}s` }}
            >
              <Avatar initials={p.initials} hue={p.hue} size={32} src={p.src} />
              <div className="team-row-meta">
                <div className="team-row-name">
                  {p.name}{" "}
                  <span className="team-row-role">· {p.role}</span>
                </div>
                <div className="team-row-status">
                  <span
                    className="team-status-dot"
                    style={{ background: `oklch(72% 0.14 ${p.hue})` }}
                  ></span>{" "}
                  {p.status}
                </div>
              </div>
              <div
                className="team-row-cursor"
                style={{ background: `oklch(72% 0.14 ${p.hue})` }}
              >
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                  <path
                    d="M1 1L9 5L5 6.5L4 11L1 1Z"
                    fill="currentColor"
                    stroke="#0a0a0c"
                    strokeWidth="0.7"
                  />
                </svg>
              </div>
            </div>
          ))}
          <div className="team-row team-row--joining">
            <span className="team-row-ghost"></span>
            <span className="team-joining-text">+ 2 more joining…</span>
          </div>
        </div>

        <span className="team-cursor team-cursor--1">
          <svg width="14" height="16" viewBox="0 0 10 12" fill="none">
            <path
              d="M1 1L9 5L5 6.5L4 11L1 1Z"
              fill="oklch(72% 0.14 310)"
              stroke="#0a0a0c"
              strokeWidth="0.7"
            />
          </svg>
        </span>
        <span className="team-cursor team-cursor--2">
          <svg width="14" height="16" viewBox="0 0 10 12" fill="none">
            <path
              d="M1 1L9 5L5 6.5L4 11L1 1Z"
              fill="oklch(72% 0.14 30)"
              stroke="#0a0a0c"
              strokeWidth="0.7"
            />
          </svg>
        </span>
      </div>
    </article>
  );
}

function CardReview() {
  return (
    <article className="ag-card ag-card--review">
      <div className="ag-card-head">
        <Eyebrow>03 · REVIEW</Eyebrow>
        <h3 className="ag-h">
          Share an instant link
          <br />
          with stakeholders.
        </h3>
        <p className="ag-p">
          Send the session link. They see who&apos;s assigned, leave comments,
          follow every ticket&apos;s activity.
        </p>
      </div>

      <div className="ag-stage review-stage">
        <span className="rev-ring rev-ring--1"></span>
        <span className="rev-ring rev-ring--2"></span>
        <span className="rev-ring rev-ring--3"></span>

        <div className="rev-card">
          <div className="rev-card-top">
            <span className="rev-logo">
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                <path
                  d="M10 1.5 L18 6 V16 L10 20.5 L2 16 V6 Z"
                  stroke="oklch(78% 0.16 290)"
                  strokeWidth="1.4"
                  fill="none"
                />
                <circle cx="10" cy="11" r="3" fill="oklch(78% 0.16 290)" />
              </svg>
            </span>
            <div className="rev-card-meta">
              <div className="rev-card-name">Aurora — May 18</div>
              <div className="rev-card-sub">
                <span className="rev-live-dot"></span> 12 tickets · 3 reviewing
                now
              </div>
            </div>
            <span className="rev-card-secure">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 5V3.5C3 2.12 4.12 1 5.5 1H6.5C7.88 1 9 2.12 9 3.5V5"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
                <rect
                  x="2"
                  y="5"
                  width="8"
                  height="6"
                  rx="1.2"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
              </svg>
            </span>
          </div>
          <div className="rev-url">
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              className="rev-link-ic"
            >
              <path
                d="M5.5 7.5L7.5 5.5M4 8.5 L3 9.5 a2 2 0 1 1-2.8-2.8 L1.2 5.7 M8.5 4 L9.5 3 a2 2 0 1 1 2.8 2.8 L11.3 6.8"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </svg>
            <span className="rev-url-text">
              <span className="rev-url-host">annote.app/s/</span>
              <span className="rev-url-slug">aurora-may18</span>
            </span>
            <span className="rev-url-caret"></span>
            <button type="button" className="rev-copy">
              Copy
            </button>
          </div>
          <div className="rev-card-foot">
            <span className="rev-pill">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M5 1L6 4L9 5L6 6L5 9L4 6L1 5L4 4Z"
                  fill="currentColor"
                />
              </svg>
              Custom-branded with your logo
            </span>
            <span className="rev-faces">
              <Avatar initials="M" hue={310} size={18} ring src={PHOTO.maya} />
              <Avatar initials="D" hue={200} size={18} ring src={PHOTO.daniel} />
              <Avatar initials="S" hue={30} size={18} ring src={PHOTO.sarah} />
              <span className="rev-faces-plus">+9</span>
            </span>
          </div>
        </div>

        <div className="rev-ping rev-ping--1">
          <Avatar initials="J" hue={150} size={22} src={PHOTO.jordan} />
          <span>Jordan opened</span>
        </div>
        <div className="rev-ping rev-ping--2">
          <Avatar initials="A" hue={250} size={22} src={PHOTO.anya} />
          <span>Anya replied</span>
        </div>
      </div>
    </article>
  );
}

function CardShip() {
  return (
    <article className="ag-card ag-card--ship">
      <div className="ag-card-head">
        <Eyebrow>04 · SHIP</Eyebrow>
        <h3 className="ag-h">
          Every ticket
          <br />
          is dev-ready.
        </h3>
        <p className="ag-p">
          Page, element, browser, OS — all attached. Plus status, priority,
          assignee. Devs get context, not guesswork.
        </p>
      </div>

      <div className="ag-stage ship-stage">
        <div className="ship-ticket ship-ticket--1">
          <div className="ship-ticket-head">
            <span className="ship-ticket-id">ANT-218</span>
            <span className="ship-prio ship-prio--high">HIGH</span>
            <span className="ship-ticket-status">
              <span className="ship-status-dot"></span> In review
            </span>
          </div>
          <div className="ship-ticket-title">Sidebar collapses on first nav</div>
          <div className="ship-ticket-meta">
            <span className="ship-meta-chip">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect
                  x="1"
                  y="2"
                  width="8"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <path d="M1 4h8" stroke="currentColor" strokeWidth="1" />
              </svg>
              /dashboard
            </span>
            <span className="ship-meta-chip">Chrome 124 · macOS</span>
            <span className="ship-meta-chip">.sidebar-nav</span>
          </div>
          <div className="ship-ticket-foot">
            <span className="ship-assign">
              <Avatar initials="D" hue={200} size={18} src={PHOTO.daniel} /> Daniel
            </span>
            <span className="ship-divider"></span>
            <span className="ship-foot-meta">3 comments · 2 attachments</span>
          </div>
        </div>

        <div className="ship-ticket ship-ticket--2">
          <div className="ship-ticket-head">
            <span className="ship-ticket-id">ANT-217</span>
            <span className="ship-prio ship-prio--med">MED</span>
            <span className="ship-ticket-status">
              <span className="ship-status-dot ship-status-dot--ok"></span> Ready
            </span>
          </div>
          <div className="ship-ticket-title">
            Dashboard legend overlaps data
          </div>
          <div className="ship-ticket-meta">
            <span className="ship-meta-chip">/analytics</span>
            <span className="ship-meta-chip">Safari 17 · iPadOS</span>
          </div>
          <div className="ship-ticket-foot">
            <span className="ship-assign">
              <Avatar initials="S" hue={30} size={18} src={PHOTO.sarah} /> Sarah
            </span>
            <span className="ship-divider"></span>
            <span className="ship-foot-meta">handed off · 12m ago</span>
          </div>
        </div>

        <div className="ship-ticket ship-ticket--3">
          <div className="ship-ticket-head">
            <span className="ship-ticket-id">ANT-216</span>
            <span className="ship-prio ship-prio--low">LOW</span>
          </div>
          <div className="ship-ticket-title-faded">
            Onboarding tooltip clips on resize
          </div>
        </div>

        <div className="ship-ide">
          <span className="ship-ide-dot"></span>
          Shared with teammates · 12 issues this week
        </div>
      </div>
    </article>
  );
}

export function BuiltForAgenciesDark() {
  return (
    <>
      {/* White gutter behind the inset dark panel — the panel is inset from the
         page edges, so this band replaces the grey page background that would
         otherwise show as left/right margins around it. */}
      <div className="ag-gutter">
      <section id="personas" className="ag-root">
        <div className="ag-bg-grain"></div>

        <header className="ag-head">
          <div className="ag-head-left">
            <div className="ag-kicker">
              <span className="ag-kicker-mark">✦</span>
              <span>BUILT FOR AGENCIES</span>
            </div>
            <h2 className="ag-title">
              From client QA to dev handoff, <em>in one place.</em>
            </h2>
          </div>
          <div className="ag-head-right">
            <p className="ag-lede">
              Walk the build, capture every issue, and hand developers tickets
              that are already complete. One session, one link, one workflow.
            </p>
            <div className="ag-head-meta">
              <span className="ag-head-dot"></span>
              Built for studios and in-house teams shipping client work.
            </div>
          </div>
        </header>

        <div className="ag-grid">
          <CardQA />
          <CardTeam />
          <CardReview />
          <CardShip />
        </div>

        {/* THE EVIDENCE — shares this same .ag-root dark background. */}
        <EvidenceBlock />
      </section>
      </div>
    </>
  );
}
