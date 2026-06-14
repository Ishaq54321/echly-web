"use client";

/**
 * <ClickToTicket />
 *
 * The page's signature interaction: a "sticky stacking cards on scroll" deck.
 * As you scroll, each step-card pins to the viewport (position: sticky) and the
 * next card rises up and STACKS on top of it. The card now behind scales down
 * (1.0 → ~0.88) and dims, so the stack physically recedes in depth — like
 * thumbing through a deck of the three steps of the flow.
 *
 *   1. Capture   (copy left / visual right) — portrait photo + browser mockup
 *                                              with highlight + capture pill
 *   2. Voice     (visual left / copy right) — landscape photo + voice note +
 *                                              AI-drafted ticket card
 *   3. Sessions  (copy left / visual right) — landscape photo + ticket stack +
 *                                              session URL card + comment
 *
 * Mechanics (see .ctt-deck / .ctt-card rules in marketing.css):
 *   - .ctt-deck is the tall scroll container; each .ctt-card is position: sticky
 *     with a top offset, so it pins as it reaches the top and the next card
 *     stacks over it (newer cards carry higher z-index).
 *   - A rAF-throttled scroll handler (below) measures how far the NEXT card has
 *     risen over each card and writes that 0→1 progress to a `--ctt-recede`
 *     custom property. CSS turns it into scale-down + dim + a small downward
 *     peek so stacked cards read as a layered deck.
 *   - It also flips `.ctt-in-view` on each card as it enters the viewport, which
 *     still gates the internal mockup animations (cursor, waveform, pulses).
 *   - prefers-reduced-motion users get a plain stacked vertical list (handled in
 *     CSS): no sticky, no transforms, cards simply shown in order.
 */

import { useEffect } from "react";
import {
  MousePointerClick,
  AudioLines,
  Share,
  Check,
  Lock,
  Send,
  Link2,
} from "lucide-react";

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
  number,
  title,
  sub,
  bullets,
}: {
  number: string;
  title: string;
  sub: string;
  bullets: string[];
}) {
  return (
    <div className="ctt-card-copy">
      <span className="ctt-card-num" aria-hidden="true">{number}</span>
      <h3 className="ctt-card-title">{title}</h3>
      <p className="ctt-card-sub">{sub}</p>
      <ul className="ctt-card-bullets">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
}

export function ClickToTicket() {
  // Sticky-stacking deck driver.
  //
  // Two jobs, both keyed off scroll position:
  //   1. Reveal — add `.ctt-in-view` the first time a card enters the viewport,
  //      which un-pauses its internal mockup animations (cursor, waveform, …).
  //   2. Recede — for every card, measure how far the NEXT card has risen over
  //      it (0 = next card still fully below, 1 = next card fully covering it)
  //      and write that to `--ctt-recede`. CSS maps it to scale-down + dim, so
  //      the card sinks behind the one stacking on top of it.
  //
  // We bail out entirely when prefers-reduced-motion is set: no transforms, the
  // CSS fallback renders a plain stacked list, and we just reveal every card.
  useEffect(() => {
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".ctt-deck .ctt-card"),
    );
    if (cards.length === 0) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      cards.forEach((card) => card.classList.add("ctt-in-view"));
      return;
    }

    // The marketing shell scrolls inside .marketing-root (html/body are pinned
    // to 100% height), so window 'scroll' events don't bubble from it by
    // default. Listen on the deck's actual scrollable ancestor; fall back to
    // window for layouts where the document itself scrolls.
    const findScroller = (el: HTMLElement | null): HTMLElement | Window => {
      let node = el?.parentElement ?? null;
      while (node) {
        const oy = getComputedStyle(node).overflowY;
        if (
          (oy === "auto" || oy === "scroll") &&
          node.scrollHeight - node.clientHeight > 4
        ) {
          return node;
        }
        node = node.parentElement;
      }
      return window;
    };
    const scroller = findScroller(cards[0]);

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        // Reveal once the card is meaningfully on screen.
        if (rect.top < vh * 0.8 && rect.bottom > 0) {
          card.classList.add("ctt-in-view");
        }

        const next = cards[i + 1];
        if (!next) {
          card.style.setProperty("--ctt-recede", "0");
          return;
        }
        // This card pins at rect.top (≈ the sticky offset). The next card rises
        // up toward that same line. `gap` is how far the next card still has to
        // travel before it fully overlaps this one:
        //   gap ≈ cardHeight  → next card is one card-height below → recede 0
        //   gap ≈ 0           → next card has reached the pin line → recede 1
        // We spread the motion over one card-height so the recede tracks the
        // approach smoothly rather than snapping at the very end.
        const span = Math.max(rect.height, 1);
        const gap = next.getBoundingClientRect().top - rect.top;
        const progress = Math.min(Math.max(1 - gap / span, 0), 1);
        card.style.setProperty("--ctt-recede", progress.toFixed(4));
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    // Window scroll too, in case the page also scrolls at the document level.
    if (scroller !== window) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="product" className="ctt-root">
      <div className="section-eyebrow ctt-section-eyebrow">
        <span className="section-eyebrow-dash">✦</span>
        <span className="section-eyebrow-text">The workflow</span>
      </div>
      <h2 className="ctt-headline">From click to ticket.</h2>
      <p className="ctt-sub">
        Three beats: capture, voice, sessions. One uninterrupted motion from
        &ldquo;I see something wrong&rdquo; to &ldquo;everyone&rsquo;s
        looking at it.&rdquo;
      </p>

      {/* Sticky-stacking deck: each card pins, the next rises and stacks over
          it, cards behind scale down + dim (driven by --ctt-recede above). */}
      <div className="ctt-deck">
      {/* Section 1: Capture (copy left / visual right) */}
      <div className="ctt-card" style={{ "--ctt-i": 0 } as React.CSSProperties}>
        <CardHeader icon={<MousePointerClick size={17} strokeWidth={2} />} label="Capture" />
        <div className="ctt-card-body">
          <CardCopy
            number="01"
            title="Capture anything in one click."
            sub="Annote grabs the element, the page, and the context. No selection tool, no cropping."
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
      <div className="ctt-card" style={{ "--ctt-i": 1 } as React.CSSProperties}>
        <CardHeader icon={<AudioLines size={17} strokeWidth={2} />} label="Speak" />
        <div className="ctt-card-body ctt-card-body--visual-left">
          <div className="ctt-card-visual ctt-card-visual--voice">
<VoiceMockup />
          </div>
          <CardCopy
            number="02"
            title="Talk through it. Send a ticket."
            sub="Speak in your own words. AI turns the recording into a structured ticket — title, description, severity, tags."
            bullets={[
              "One-tap recording in the extension",
              "Rough notes become a polished ticket",
              "Edit, rewrite, or send as-is",
            ]}
          />
        </div>
      </div>

      {/* Section 3: Sessions (copy left / visual right) */}
      <div className="ctt-card" style={{ "--ctt-i": 2 } as React.CSSProperties}>
        <CardHeader icon={<Share size={17} strokeWidth={2} />} label="Share" />
        <div className="ctt-card-body">
          <CardCopy
            number="03"
            title="Auto-grouped. Share the whole session."
            sub="Every capture from your session lives in one place. Send the link — clients, teammates, anyone sees the same thing."
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
      </div>{/* /.ctt-deck */}
    </section>
  );
}

/* ============================================================
   CARD 1 — CAPTURE
   Portrait photo placeholder + browser mockup with highlight,
   target CTA, capture pill, and a floating "Captured" toast.
   ============================================================ */

function CaptureMockup() {
  return (
    <div className="ctt-cap">
      {/* Pointer cursor — pointing-hand silhouette (provided SVG). Slides
          in, presses on the CTA, then stays put. */}
      <span className="ctt-cap-cursor" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="32" height="32">
          <path
            fill="#fff"
            d="M11.3,20.4c-0.3-0.4-0.6-1.1-1.2-2c-0.3-0.5-1.2-1.5-1.5-1.9c-0.2-0.4-0.2-0.6-0.1-1c0.1-0.6,0.7-1.1,1.4-1.1c0.5,0,1,0.4,1.4,0.7c0.2,0.2,0.5,0.6,0.7,0.8c0.2,0.2,0.2,0.3,0.4,0.5c0.2,0.3,0.3,0.5,0.2,0.1c-0.1-0.5-0.2-1.3-0.4-2.1c-0.1-0.6-0.2-0.7-0.3-1.1c-0.1-0.5-0.2-0.8-0.3-1.3c-0.1-0.3-0.2-1.1-0.3-1.5c-0.1-0.5-0.1-1.4,0.3-1.8c0.3-0.3,0.9-0.4,1.3-0.2c0.5,0.3,0.8,1,0.9,1.3c0.2,0.5,0.4,1.2,0.5,2c0.2,1,0.5,2.5,0.5,2.8c0-0.4-0.1-1.1,0-1.5c0.1-0.3,0.3-0.7,0.7-0.8c0.3-0.1,0.6-0.1,0.9-0.1c0.3,0.1,0.6,0.3,0.8,0.5c0.4,0.6,0.4,1.9,0.4,1.8c0.1-0.4,0.1-1.2,0.3-1.6c0.1-0.2,0.5-0.4,0.7-0.5c0.3-0.1,0.7-0.1,1,0c0.2,0,0.6,0.3,0.7,0.5c0.2,0.3,0.3,1.3,0.4,1.7c0,0.1,0.1-0.4,0.3-0.7c0.4-0.6,1.8-0.8,1.9,0.6c0,0.7,0,0.6,0,1.1c0,0.5,0,0.8,0,1.2c0,0.4-0.1,1.3-0.2,1.7c-0.1,0.3-0.4,1-0.7,1.4c0,0-1.1,1.2-1.2,1.8c-0.1,0.6-0.1,0.6-0.1,1c0,0.4,0.1,0.9,0.1,0.9s-0.8,0.1-1.2,0c-0.4-0.1-0.9-0.8-1-1.1c-0.2-0.3-0.5-0.3-0.7,0c-0.2,0.4-0.7,1.1-1.1,1.1c-0.7,0.1-2.1,0-3.1,0c0,0,0.2-1-0.2-1.4c-0.3-0.3-0.8-0.8-1.1-1.1L11.3,20.4z"
          />
          <path
            fill="none"
            stroke="#000"
            strokeWidth="0.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.3,20.4c-0.3-0.4-0.6-1.1-1.2-2c-0.3-0.5-1.2-1.5-1.5-1.9c-0.2-0.4-0.2-0.6-0.1-1c0.1-0.6,0.7-1.1,1.4-1.1c0.5,0,1,0.4,1.4,0.7c0.2,0.2,0.5,0.6,0.7,0.8c0.2,0.2,0.2,0.3,0.4,0.5c0.2,0.3,0.3,0.5,0.2,0.1c-0.1-0.5-0.2-1.3-0.4-2.1c-0.1-0.6-0.2-0.7-0.3-1.1c-0.1-0.5-0.2-0.8-0.3-1.3c-0.1-0.3-0.2-1.1-0.3-1.5c-0.1-0.5-0.1-1.4,0.3-1.8c0.3-0.3,0.9-0.4,1.3-0.2c0.5,0.3,0.8,1,0.9,1.3c0.2,0.5,0.4,1.2,0.5,2c0.2,1,0.5,2.5,0.5,2.8c0-0.4-0.1-1.1,0-1.5c0.1-0.3,0.3-0.7,0.7-0.8c0.3-0.1,0.6-0.1,0.9-0.1c0.3,0.1,0.6,0.3,0.8,0.5c0.4,0.6,0.4,1.9,0.4,1.8c0.1-0.4,0.1-1.2,0.3-1.6c0.1-0.2,0.5-0.4,0.7-0.5c0.3-0.1,0.7-0.1,1,0c0.2,0,0.6,0.3,0.7,0.5c0.2,0.3,0.3,1.3,0.4,1.7c0,0.1,0.1-0.4,0.3-0.7c0.4-0.6,1.8-0.8,1.9,0.6c0,0.7,0,0.6,0,1.1c0,0.5,0,0.8,0,1.2c0,0.4-0.1,1.3-0.2,1.7c-0.1,0.3-0.4,1-0.7,1.4c0,0-1.1,1.2-1.2,1.8c-0.1,0.6-0.1,0.6-0.1,1c0,0.4,0.1,0.9,0.1,0.9s-0.8,0.1-1.2,0c-0.4-0.1-0.9-0.8-1-1.1c-0.2-0.3-0.5-0.3-0.7,0c-0.2,0.4-0.7,1.1-1.1,1.1c-0.7,0.1-2.1,0-3.1,0c0,0,0.2-1-0.2-1.4c-0.3-0.3-0.8-0.8-1.1-1.1L11.3,20.4z"
          />
          <line x1="19.6" y1="20.7" x2="19.6" y2="17.3" stroke="#000" strokeWidth="0.75" strokeLinecap="round" />
          <line x1="17.6" y1="20.7" x2="17.5" y2="17.3" stroke="#000" strokeWidth="0.75" strokeLinecap="round" />
          <line x1="15.6" y1="17.3" x2="15.6" y2="20.7" stroke="#000" strokeWidth="0.75" strokeLinecap="round" />
        </svg>
      </span>

      <div className="ctt-cap-browser">
        <div className="ctt-cap-bar">
          <span className="ctt-cap-dots"><i /><i /><i /></span>
          <span className="ctt-cap-url">
            <span className="ctt-cap-lock" aria-hidden="true">
              <Lock size={9} strokeWidth={2.4} />
            </span>
            <b>northwind.co</b>/pricing
            <span className="ctt-cap-url-dim">&nbsp;·&nbsp;preflight</span>
          </span>
        </div>

        <div className="ctt-cap-body">
          <div className="ctt-cap-form" aria-hidden="true">
            <div className="ctt-cap-form-headlines">
              <span className="ctt-cap-form-h1" />
              <span className="ctt-cap-form-h2" />
            </div>
            <div className="ctt-cap-form-squares">
              <i /><i /><i />
            </div>
            <div className="ctt-cap-form-divider" />

            <span className="ctt-cap-form-label" />

            <div className="ctt-cap-form-row">
              <div className="ctt-cap-form-input"><span /></div>
              <div className="ctt-cap-form-input"><span /></div>
            </div>

            <div className="ctt-cap-form-select">
              <span />
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="ctt-cap-form-action">
              <div className="ctt-cap-form-stepper">
                <span className="ctt-cap-form-step-btn">−</span>
                <span className="ctt-cap-form-step-val" />
                <span className="ctt-cap-form-step-btn">+</span>
              </div>
              <div className="ctt-cap-select ctt-cap-select--inline">
                <div className="ctt-cap-form-cta" />
              </div>
            </div>

            <span className="ctt-cap-form-foot" />
          </div>
        </div>
      </div>

      <div className="ctt-cap-toast">
        <span className="ctt-cap-toast-ic">
          <Check size={14} strokeWidth={2.4} />
        </span>
        <span className="ctt-cap-toast-txt">
          <span className="ctt-cap-toast-t1">Captured · CTA button</span>
          <span className="ctt-cap-toast-t2">+ DOM · viewport · build</span>
        </span>
      </div>

      <div className="ctt-cap-chip ctt-cap-chip--sel">
        <span className="ctt-cap-chip-dot" />
        body &gt; main &gt; <b>.pricing</b> &gt; .cta-primary
      </div>

      <div className="ctt-cap-chip ctt-cap-chip--meta">
        1440×900 · Chrome 124 · macOS · northwind
      </div>

      <div className="ctt-cap-toast ctt-cap-toast--share">
        <span className="ctt-cap-toast-ic ctt-cap-toast-ic--share">
          <Link2 size={14} strokeWidth={2} />
        </span>
        <span className="ctt-cap-toast-txt">
          <span className="ctt-cap-toast-t1">Captured 0:02 ago</span>
          <span className="ctt-cap-toast-t2">annote.ai/s/q2-qa</span>
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   CARD 2 — VOICE
   Landscape photo placeholder + faint screenshot behind a
   voice-note card with animated waveform + AI-drafted ticket.
   ============================================================ */

function VoiceMockup() {
  return (
    <div className="ctt-voice">
      <div className="ctt-voice-note">
        <div className="ctt-voice-note-head">
          <span
            className="ctt-voice-note-av"
            style={{ backgroundImage: "url(/marketing/people/Maya.jpg)" }}
            aria-label="Maya Chen"
          />

          <span className="ctt-voice-note-who">
            <span className="ctt-voice-note-n">Maya Chen</span>
            <span className="ctt-voice-note-t">just now · session #q2-launch</span>
          </span>
          <span className="ctt-voice-note-live"><i />Rec</span>
        </div>
        <div className="ctt-voice-note-body">
          <div className="ctt-voice-note-row">
            <span className="ctt-voice-note-timer">0:18</span>
            <div className="ctt-voice-wave">
              {Array.from({ length: 48 }).map((_, i) => (
                <i key={i} />
              ))}
            </div>
            <button type="button" className="ctt-voice-note-send" aria-label="Send recording">
              <Send size={16} strokeWidth={2} fill="currentColor" stroke="none" />
            </button>
          </div>
          <p className="ctt-voice-note-tx">
            <span className="ctt-voice-note-tx-q">&ldquo;</span>
            The free trial button overlaps the footer on tablet screens, so it&rsquo;s
            hard to click either properly.
          </p>
        </div>
      </div>

      <div className="ctt-voice-bridge" aria-hidden="true">
        <span className="ctt-voice-bridge-pill">
          <span className="ctt-voice-bridge-spark">✦</span>
          AI transcribing&hellip;
        </span>
        <svg
          className="ctt-voice-bridge-arrow"
          viewBox="0 0 24 32"
          width="14"
          height="18"
          aria-hidden="true"
        >
          <path
            d="M12 2 V26 M5 19 L12 26 L19 19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="ctt-voice-draft">
        <span className="ctt-voice-draft-tag"><i />AI Draft</span>
        <div className="ctt-voice-draft-title">
          CTA &ldquo;Start free trial&rdquo; overlaps footer at md
        </div>
        <p className="ctt-voice-draft-sub">
          At 768px the primary CTA collides with the footer link row, making
          both untappable on tablet portrait.
        </p>
        <div className="ctt-voice-draft-meta">
          <span className="ctt-voice-draft-chip sev">High</span>
          <span className="ctt-voice-draft-chip tag">responsive</span>
          <span className="ctt-voice-draft-chip tag">pricing</span>
          <span className="ctt-voice-draft-ex">↵ send</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CARD 3 — SESSIONS
   Landscape photo placeholder + stack of capture tiles + the
   shareable session URL card with presence + a floating comment.
   ============================================================ */

function SessionsMockup() {
  return (
    <div className="ctt-sess">
      <div className="ctt-sess-stack">
        <div className="ctt-sess-tile">
          <div className="ctt-sess-thumb" />
          <div className="ctt-sess-tinfo">
            <span className="ctt-sess-tt">CTA overlaps footer at md</span>
            <span className="ctt-sess-tmeta">capture · 0:54 · maya</span>
          </div>
          <span className="ctt-sess-status open">Open</span>
        </div>
        <div className="ctt-sess-tile t-voice">
          <div className="ctt-sess-thumb" />
          <div className="ctt-sess-tinfo">
            <span className="ctt-sess-tt">Pricing copy reads as $9 not $90</span>
            <span className="ctt-sess-tmeta">voice · 0:31 · sam</span>
          </div>
          <span className="ctt-sess-status prog">In progress</span>
        </div>
        <div className="ctt-sess-tile t-sess">
          <div className="ctt-sess-thumb" />
          <div className="ctt-sess-tinfo">
            <span className="ctt-sess-tt">FAQ accordion stuck open on mobile</span>
            <span className="ctt-sess-tmeta">capture · maya</span>
          </div>
          <span className="ctt-sess-status resv">Resolved</span>
        </div>
      </div>

      <div className="ctt-sess-url">
        <div className="ctt-sess-url-h">
          <span className="ctt-sess-url-ic">
            <Share size={15} strokeWidth={1.8} />
          </span>
          <span className="ctt-sess-url-title">
            <span className="ctt-sess-url-n">Q2 launch · preflight</span>
            <span className="ctt-sess-url-t">7 captures · 2 unread</span>
          </span>
          <span className="ctt-sess-url-live"><i />Live</span>
        </div>
        <div className="ctt-sess-url-body">
          <div className="ctt-sess-url-pill">
            <Link2 className="ctt-sess-url-lk" size={14} strokeWidth={1.8} />
            <span className="ctt-sess-url-u">
              <span className="ctt-sess-url-dim">annote.app/s/</span>
              q2-launch-preflight
            </span>
            <span className="ctt-sess-url-copy">Copy</span>
          </div>
        </div>
        <div className="ctt-sess-url-foot">
          <span className="ctt-sess-presence">
            <span
              className="ctt-sess-av a1 live-now"
              style={{ backgroundImage: "url(/marketing/people/Daniel.jpg)" }}
              aria-label="Daniel"
            />
            <span
              className="ctt-sess-av a2"
              style={{ backgroundImage: "url(/marketing/people/Maya.jpg)" }}
              aria-label="Maya"
            />
            <span
              className="ctt-sess-av a3"
              style={{ backgroundImage: "url(/marketing/people/Sarah.jpg)" }}
              aria-label="Sarah"
            />
            <span className="ctt-sess-av a4">+4</span>
          </span>
          <span className="ctt-sess-who">
            <b>Maya</b>, Sam &amp; 5 others viewing
          </span>
          <a className="ctt-sess-share" href="#share">
            Share <span style={{ opacity: 0.8 }}>→</span>
          </a>
        </div>
      </div>

      <div className="ctt-sess-comment">
        <div className="ctt-sess-comment-h">
          <span
            className="ctt-sess-comment-av"
            style={{ backgroundImage: "url(/marketing/people/Jordan.jpg)" }}
            aria-label="Sam"
          />

          <span className="ctt-sess-comment-n">Sam</span>
          <span className="ctt-sess-comment-t">2m</span>
        </div>
        <p className="ctt-sess-comment-c">
          Got it — this is the same as the bug from Friday. Reopening.
        </p>
      </div>
    </div>
  );
}
