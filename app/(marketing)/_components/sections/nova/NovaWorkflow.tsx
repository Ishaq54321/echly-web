"use client";

/**
 * NovaWorkflow — "Explore the main features" as a sticky-stacking deck of
 * three steps, graphics built to the Linear/Stripe/Raycast standard and
 * HUMANIZED: real (colored) teammate photos, a premium voice recorder
 * (photo header, center-mirrored waveform, live transcript with a shimmer
 * caret), capture choreography synced on one timeline (cursor travels →
 * ripple fires → toast pops), and soft brand glows layering each scene.
 *
 * Deck mechanics: each card pins (position: sticky); as the next card rises
 * over it, a scroll-driven --nv-recede scales/dims the card behind. The page
 * scrolls on <body> (scroll doesn't bubble) → capture-phase listener.
 */

import { useEffect, useRef } from "react";
import {
  ArrowUp,
  Check,
  Copy,
  CornerDownLeft,
  Link2,
  Sparkles,
} from "lucide-react";
import { Reveal } from "../../nova/Reveal";

/* ── step graphics ────────────────────────────────────────────────────── */

function CaptureGraphic() {
  return (
    <div className="nv-wf-scene nv-wf-scene--glow">
      <div className="nv-wf-browser">
        <div className="nv-wf-browser-bar">
          <span className="nv-wf-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="nv-wf-url">
            northwind.co<em>/pricing</em>
          </span>
        </div>
        <div className="nv-wf-browser-body">
          <span className="nv-sk nv-sk--head" style={{ width: "52%" }} />
          <span className="nv-sk" style={{ width: "36%" }} />
          <div className="nv-wf-tiles" aria-hidden="true">
            <i />
            <i className="is-target">
              <span className="nv-wf-ring" />
              <span className="nv-wf-ripple" />
            </i>
            <i />
          </div>
          <span className="nv-sk" style={{ width: "64%" }} />
          <span className="nv-sk" style={{ width: "44%" }} />
        </div>
        <span className="nv-wf-cursor" aria-hidden="true" />
      </div>

      <div className="nv-wf-toast nv-wf-toast--sync">
        <span className="nv-wf-toast-ic">
          <Check size={11} strokeWidth={3} />
        </span>
        <span className="nv-wf-toast-txt">
          <b>Captured</b>
          <em>.pricing › .cta-primary</em>
        </span>
      </div>
    </div>
  );
}

// organic center-mirrored envelope: quiet → speech peaks → pause → speech
const EQ_HEIGHTS = [
  3, 4, 6, 5, 8, 12, 16, 13, 9, 6, 4, 3, 5, 8, 13, 18, 22, 19, 14, 10, 7, 5,
  3, 4, 6, 10, 15, 20, 17, 12, 8, 5, 4, 6, 9, 13, 10, 7, 5, 3,
];

function VoiceGraphic() {
  return (
    <div className="nv-wf-scene nv-wf-scene--glow">
      <div className="nv-wf-voice">
        <div className="nv-wf-voice-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="nv-photo"
            src="/marketing/people/Maya.jpg"
            alt=""
            width={28}
            height={28}
          />
          <span className="nv-wf-voice-meta">
            <b>Maya Chen</b>
            <em>session #q2-launch</em>
          </span>
          <span className="nv-wf-recpill">
            <i />
            REC <u>0:18</u>
          </span>
        </div>

        <div className="nv-wf-eq" aria-hidden="true">
          {EQ_HEIGHTS.map((h, i) => (
            <i
              key={i}
              style={
                {
                  "--h": `${h}px`,
                  "--d": `${(i * 0.07) % 1.1}s`,
                  "--dur": `${0.9 + ((i * 7) % 5) * 0.12}s`,
                  "--o": (0.55 + ((i * 3) % 5) * 0.09).toFixed(2),
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="nv-wf-transcript">
          <span className="nv-wf-transcript-label">Live transcript</span>
          <p>
            The free trial button overlaps the footer on tablet, so it&rsquo;s
            hard to click either
            <i className="nv-wf-tcaret" aria-hidden="true" />
          </p>
        </div>

        <span className="nv-wf-sendfab" aria-hidden="true">
          <ArrowUp size={13} strokeWidth={2.5} />
        </span>
      </div>

      <div className="nv-wf-bridge" aria-hidden="true">
        <Sparkles size={11} strokeWidth={2} />
        AI drafting
        <span className="nv-wf-tdots">
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="nv-wf-ticket">
        <span className="nv-wf-ticket-tag">AI draft</span>
        <b className="nv-wf-ticket-title">
          CTA &ldquo;Start free trial&rdquo; overlaps footer at md
        </b>
        <span className="nv-sk" style={{ width: "88%" }} />
        <span className="nv-sk" style={{ width: "64%" }} />
        <div className="nv-wf-ticket-foot">
          <span className="nv-wf-chip nv-wf-chip--accent">High</span>
          <span className="nv-wf-chip">responsive</span>
          <span className="nv-wf-chip">pricing</span>
          <span className="nv-wf-key">
            <CornerDownLeft size={10} strokeWidth={2.2} />
            send
          </span>
        </div>
      </div>
    </div>
  );
}

function ShareGraphic() {
  return (
    <div className="nv-wf-scene nv-wf-scene--glow">
      <div className="nv-wf-share">
        <div className="nv-wf-link">
          <Link2 size={13} strokeWidth={2} />
          <span className="nv-wf-link-url">
            <em>annote.ai/s/</em>q2-qa
          </span>
          <span className="nv-wf-copybtn">
            <Copy size={10} strokeWidth={2.2} />
            Copy
          </span>
        </div>
        <div className="nv-wf-presence">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nv-photo nv-photo--stack" src="/marketing/people/Maya.jpg" alt="" width={24} height={24} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nv-photo nv-photo--stack" src="/marketing/people/Daniel.jpg" alt="" width={24} height={24} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nv-photo nv-photo--stack" src="/marketing/people/Sarah.jpg" alt="" width={24} height={24} />
          <em>
            <b>3 viewing</b> · live now
          </em>
          <span className="nv-wf-live" aria-hidden="true" />
        </div>
      </div>

      <div className="nv-wf-diagmini">
        <div className="nv-wf-diagmini-head">
          <span className="nv-wf-spark">
            <Sparkles size={12} strokeWidth={2} />
          </span>
          <b>Likely cause identified</b>
          <span className="nv-wf-conf">High confidence</span>
        </div>
        <p>
          <code>GET /api/me</code> returned a cached response for a different{" "}
          <code>userId</code> — the stale payload is the bug.
        </p>
        <div className="nv-wf-evrow">
          <span className="nv-wf-ev">GET /api/me · 200 · 38ms</span>
          <span className="nv-wf-ev">response: userId mismatch</span>
        </div>
      </div>

      <div className="nv-wf-comment">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nv-photo" src="/marketing/people/Jordan.jpg" alt="" width={22} height={22} />
        <span>
          <b>Jordan</b> assigned this to <b>Daniel</b>
        </span>
        <em>just now</em>
      </div>
    </div>
  );
}

/* ── the deck ─────────────────────────────────────────────────────────── */

const STEPS = [
  {
    num: "01",
    label: "Capture",
    title: "Capture anything in one click.",
    sub: "Annote grabs the element, the page, and the live console and network behind it. No selection tool, no cropping.",
    bullets: [
      "Element, page, viewport — all captured",
      "Console, network, and clicks, automatically",
      "Works on any URL, live or staging",
    ],
    graphic: <CaptureGraphic />,
  },
  {
    num: "02",
    label: "Speak",
    title: "Talk through it. Send a ticket.",
    sub: "Speak in your own words. The AI turns rough notes into a structured ticket — title, description, and tags — grounded in what you clicked.",
    bullets: [
      "One-tap recording in the extension",
      "Rough notes become a polished ticket",
      "Edit, rewrite, or send as-is",
    ],
    graphic: <VoiceGraphic />,
  },
  {
    num: "03",
    label: "Share",
    title: "One link. Already diagnosed.",
    sub: "Every capture lands in one session, and the AI flags the likely cause before anyone opens it. Share the link — everyone sees the same thing.",
    bullets: [
      "One URL, no signup required",
      "AI cites real evidence, honestly",
      "Open → in progress → resolved",
    ],
    graphic: <ShareGraphic />,
  },
];

export function NovaWorkflow() {
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const cards = Array.from(
      deck.querySelectorAll<HTMLElement>(".nv-wf-card"),
    );
    if (cards.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((c) => c.classList.add("is-in"));
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rects = cards.map((c) => c.getBoundingClientRect());
      for (let i = 0; i < cards.length; i++) {
        const rect = rects[i];
        if (rect.top < vh * 0.85 && rect.bottom > 0) {
          cards[i].classList.add("is-in");
        }
        const next = rects[i + 1];
        if (!next) {
          cards[i].style.setProperty("--nv-recede", "0");
          continue;
        }
        const p = Math.min(
          Math.max(1 - (next.top - rect.top) / Math.max(rect.height, 1), 0),
          1,
        );
        cards[i].style.setProperty("--nv-recede", p.toFixed(4));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="product" className="nv-workflow">
      <div className="nv-container">
        <Reveal className="nv-workflow-head">
          <p className="nv-eyebrow nv-eyebrow--center">The workflow</p>
          <h2 className="nv-h2">
            Explore the
            <br />
            <span className="nv-dim">main features</span>
          </h2>
        </Reveal>

        <div className="nv-wf-deck" ref={deckRef}>
          {STEPS.map((step, i) => (
            <article
              key={step.num}
              className="nv-wf-card"
              style={{ "--nv-i": i } as React.CSSProperties}
            >
              <div className="nv-wf-card-head">
                <span className="nv-wf-step">{step.num}</span>
                <span className="nv-wf-step-label">{step.label}</span>
              </div>
              <div
                className={`nv-wf-card-body${
                  i === 1 ? " nv-wf-card-body--flip" : ""
                }`}
              >
                <div className="nv-wf-copy">
                  <h3 className="nv-h4">{step.title}</h3>
                  <p className="nv-body">{step.sub}</p>
                  <ul className="nv-wf-bullets">
                    {step.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div className="nv-wf-stage">{step.graphic}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
