"use client";

/**
 * NovaUseCases — the dark lifecycle chart, rebuilt from scratch to the
 * Linear-dark standard: near-black cards with white-alpha hairlines, mono
 * eyebrows in one lavender accent, initial-dot avatars (no photography),
 * and small purpose-built stage graphics per card — QA (capture + recorder),
 * Team (live presence), Review (share link + toast), Ship (dev-ready
 * tickets) — plus a full-width evidence strip. Header lives inside the
 * panel: kicker + title left, lede + meta right.
 */

import Link from "next/link";
import { Check, ChevronRight, Copy, Link2, Terminal } from "lucide-react";
import { useAnimationPause } from "../../useAnimationPause";

const CASE_LINKS = [
  { label: "QA testing", href: "/use-cases/qa-testing" },
  { label: "Design review", href: "/use-cases/design-review" },
  { label: "Client feedback", href: "/use-cases/client-feedback" },
  { label: "Agencies", href: "/use-cases/agencies" },
  { label: "Teams", href: "/use-cases/teams" },
] as const;

const QA_EQ = [3, 5, 8, 12, 9, 6, 4, 7, 11, 15, 12, 8, 5, 3, 6, 10, 13, 9, 6, 4];

function CardQA() {
  return (
    <article className="nv-uc-card">
      <p className="nv-uc-eyebrow">01 · QA</p>
      <h3 className="nv-uc-h">
        Walk the build.
        <br />
        Speak the issues.
      </h3>
      <p className="nv-uc-p">
        Click anything that needs work. Annote captures the context — voice
        notes become clean tickets.
      </p>

      <div className="nv-uc-stage">
        <div className="nv-uc-browser">
          <div className="nv-uc-browser-bar">
            <span className="nv-uc-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="nv-uc-url">aurora.studio/dashboard</span>
          </div>
          <div className="nv-uc-browser-body">
            <span className="nv-uc-sk" style={{ width: "58%" }} />
            <span className="nv-uc-sk" style={{ width: "38%" }} />
            <div className="nv-uc-tiles" aria-hidden="true">
              <i />
              <i className="is-target">
                <span className="nv-uc-ring" />
              </i>
              <i />
            </div>
          </div>
        </div>
        <div className="nv-uc-recorder">
          <div className="nv-uc-recorder-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="nv-photo nv-photo--dark"
              src="/marketing/people/Maya.jpg"
              alt=""
              width={24}
              height={24}
            />
            <span className="nv-uc-recorder-meta">
              <b>Maya</b>
              <em>· QA on Aurora build</em>
            </span>
            <span className="nv-uc-recpill">
              <i />
              REC <u>0:14</u>
            </span>
          </div>
          <span className="nv-uc-eq" aria-hidden="true">
            {QA_EQ.map((h, i) => (
              <i
                key={i}
                style={
                  {
                    "--h": `${h}px`,
                    "--d": `${(i * 0.09) % 1.2}s`,
                    "--dur": `${0.9 + ((i * 7) % 5) * 0.11}s`,
                    "--o": (0.5 + ((i * 3) % 5) * 0.1).toFixed(2),
                  } as React.CSSProperties
                }
              />
            ))}
          </span>
          <p className="nv-uc-transcript">
            <span>Auto-transcribing</span>
            &ldquo;Hover state on the card disappears after the first—&rdquo;
          </p>
        </div>
      </div>
    </article>
  );
}

function CardTeam() {
  const people = [
    { photo: "Maya", name: "Maya", role: "session host", status: "Listening" },
    { photo: "Daniel", name: "Daniel", role: "QA review", status: "3 notes" },
    { photo: "Sarah", name: "Sarah", role: "design lead", status: "Reviewing" },
  ];
  return (
    <article className="nv-uc-card">
      <p className="nv-uc-eyebrow">02 · Team</p>
      <h3 className="nv-uc-h">
        Every feedback
        <br />
        in one place.
      </h3>
      <p className="nv-uc-p">
        Designers, PMs, QA — all feedback into the same session. No more
        collating across five tools.
      </p>

      <div className="nv-uc-stage">
        <div className="nv-uc-session">
          <span className="nv-uc-live-dot" aria-hidden="true" />
          <b>Live session</b>
          <em>Aurora · May 18</em>
          <u>3</u>
        </div>
        {people.map((p) => (
          <div className="nv-uc-row" key={p.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="nv-photo nv-photo--dark"
              src={`/marketing/people/${p.photo}.jpg`}
              alt=""
              width={26}
              height={26}
            />
            <span className="nv-uc-row-meta">
              <b>{p.name}</b>
              <em>· {p.role}</em>
            </span>
            <span className="nv-uc-status">{p.status}</span>
          </div>
        ))}
        <div className="nv-uc-row nv-uc-row--ghost">+ 2 more joining…</div>
      </div>
    </article>
  );
}

function CardReview() {
  return (
    <article className="nv-uc-card">
      <p className="nv-uc-eyebrow">03 · Review</p>
      <h3 className="nv-uc-h">
        Share an instant link
        <br />
        with stakeholders.
      </h3>
      <p className="nv-uc-p">
        Send the session link. They see who&rsquo;s assigned, leave comments,
        follow every ticket&rsquo;s activity.
      </p>

      <div className="nv-uc-stage">
        <div className="nv-uc-link">
          <Link2 size={12} strokeWidth={2} />
          <span className="nv-uc-link-url">
            <em>annote.ai/s/</em>aurora-may18
          </span>
          <span className="nv-uc-copy">
            <Copy size={9} strokeWidth={2.2} />
            Copy
          </span>
        </div>
        <div className="nv-uc-facerow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nv-photo nv-photo--dark nv-photo--stack" src="/marketing/people/Maya.jpg" alt="" width={24} height={24} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nv-photo nv-photo--dark nv-photo--stack" src="/marketing/people/Daniel.jpg" alt="" width={24} height={24} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nv-photo nv-photo--dark nv-photo--stack" src="/marketing/people/Sarah.jpg" alt="" width={24} height={24} />
          <span className="nv-av nv-av--ghost">+9</span>
          <em>12 tickets · 3 reviewing now</em>
        </div>
        <div className="nv-uc-toast">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nv-photo nv-photo--dark" src="/marketing/people/Jordan.jpg" alt="" width={18} height={18} />
          Jordan opened <em>· just now</em>
        </div>
      </div>
    </article>
  );
}

function CardShip() {
  return (
    <article className="nv-uc-card">
      <p className="nv-uc-eyebrow">04 · Ship</p>
      <h3 className="nv-uc-h">
        Every ticket
        <br />
        is dev-ready.
      </h3>
      <p className="nv-uc-p">
        Page, element, browser, OS — all attached. Plus status, priority,
        assignee. Devs get context, not guesswork.
      </p>

      <div className="nv-uc-stage">
        <div className="nv-uc-ticket">
          <div className="nv-uc-ticket-top">
            <b>ANT-218</b>
            <span className="nv-uc-prio nv-uc-prio--hi">High</span>
            <em>In review</em>
          </div>
          <p>Sidebar collapses on first nav</p>
          <div className="nv-uc-ticket-chips">
            <span>/dashboard</span>
            <span>Chrome 124 · macOS</span>
            <span>.sidebar-nav</span>
          </div>
          <div className="nv-uc-assignee">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="nv-photo nv-photo--dark" src="/marketing/people/Daniel.jpg" alt="" width={18} height={18} />
            <b>Daniel</b>
            <em>3 comments · 2 attachments</em>
          </div>
        </div>
        <div className="nv-uc-ticket nv-uc-ticket--dim">
          <div className="nv-uc-ticket-top">
            <b>ANT-217</b>
            <span className="nv-uc-prio">Med</span>
            <em className="ok">
              <Check size={9} strokeWidth={3} /> Ready
            </em>
          </div>
          <p>Dashboard legend overlaps data</p>
        </div>
      </div>
    </article>
  );
}

function EvidenceStrip() {
  return (
    <article className="nv-uc-card nv-uc-card--wide">
      <div className="nv-uc-wide-copy">
        <p className="nv-uc-eyebrow">05 · Evidence</p>
        <h3 className="nv-uc-h">The AI already read the logs.</h3>
        <p className="nv-uc-p">
          Console, network, and actions are captured on one clock — and the AI
          flags the likely cause before a dev opens the ticket.
        </p>
      </div>
      <div className="nv-uc-wide-stage">
        <div className="nv-uc-logrow">
          <span className="nv-uc-logtag">
            <Terminal size={10} strokeWidth={2.2} />
            console
          </span>
          <span className="nv-uc-logtxt is-warn">
            stale cache read · /api/me
          </span>
          <em>09:41:04</em>
        </div>
        <div className="nv-uc-logrow is-hot">
          <span className="nv-uc-logtag">network</span>
          <span className="nv-uc-logtxt">
            GET /api/me → 200 · userId mismatch
          </span>
          <em>38ms</em>
        </div>
        <div className="nv-uc-logrow">
          <span className="nv-uc-logtag">action</span>
          <span className="nv-uc-logtxt">clicked &ldquo;Account&rdquo;</span>
          <em>00:12</em>
        </div>
        <div className="nv-uc-curl">
          <Copy size={9} strokeWidth={2.2} />
          every request copies as cURL
        </div>
      </div>
    </article>
  );
}

export function NovaUseCases() {
  const ref = useAnimationPause<HTMLElement>();

  return (
    <section id="personas" className="nv-cases">
      <section
        ref={ref}
        className="nv-uc-panel"
        aria-label="Product lifecycle demos"
      >
        <header className="nv-uc-head">
          <div>
            <p className="nv-uc-kicker">✦ Use cases</p>
            <h2 className="nv-uc-title">
              From client QA to dev handoff,{" "}
              <span>in one place.</span>
            </h2>
          </div>
          <div className="nv-uc-head-right">
            <p>
              Walk the build, capture every issue, and hand developers tickets
              that are already complete. One session, one link, one workflow.
            </p>
            <p className="nv-uc-head-meta">
              <i />
              Built for studios and in-house teams shipping client work.
            </p>
          </div>
        </header>

        <div className="nv-uc-grid">
          <CardQA />
          <CardTeam />
          <CardReview />
          <CardShip />
        </div>
        <EvidenceStrip />
      </section>

      <div className="nv-container">
        <nav className="nv-cases-links" aria-label="Use cases">
          {CASE_LINKS.map((c) => (
            <Link key={c.href} className="nv-arrow-link" href={c.href}>
              {c.label}
              <ChevronRight size={16} strokeWidth={2} />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
