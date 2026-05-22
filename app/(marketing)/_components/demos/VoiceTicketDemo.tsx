"use client";

/**
 * <VoiceTicketDemo />
 *
 * Suite-Voice auto-loop: orb + waveform → typewriter rough transcript →
 * Polish button presses itself → transcript transforms into structured ticket.
 *
 * Pixel-faithful marketing mirror of the voice journey:
 *   - components/CaptureWidget/RecordingMicOrb.tsx (the waveform rhythm)
 *   - components/CaptureWidget/ConfirmationCard.tsx (the polished output reveal)
 *
 * No imports from the app tree.
 *
 * VISUAL SPECIFICATION carried over from real components:
 *
 *   Frame
 *   ────────────────────────────────────────────────────────────────────
 *   - White (#FFFFFF) card, 14px radius, --mk-sh-lg shadow
 *   - Padding 22px 22px 18px (mirrors the existing .viz-mic baseline)
 *
 *   Eyebrow
 *   ────────────────────────────────────────────────────────────────────
 *   - "VOICE NOTE" 11px uppercase, letter-spacing 0.14em, weight 600,
 *     color var(--ink-3)
 *
 *   Waveform (mirrors mk-aiwv keyframe from marketing.css)
 *   ────────────────────────────────────────────────────────────────────
 *   - 64px tall, 4px wide bars, 4px gap, 3px radius
 *   - Bars: linear-gradient(180deg, var(--violet-2), var(--violet))
 *   - Every 3rd bar: linear-gradient(180deg, #C51A68, #A23A5A)
 *   - 1.2s ease-in-out infinite, staggered per bar
 *
 *   Rough transcript
 *   ────────────────────────────────────────────────────────────────────
 *   - 13.5px italic, var(--ink-2), line-height 1.5
 *   - Typewriter: characters added at 18-22ms per char until full string is in
 *
 *   Polish button (mirrors ConfirmationCard primary)
 *   ────────────────────────────────────────────────────────────────────
 *   - Bg var(--violet) #5A49BF, white text
 *   - 11px font, weight 500, 6px 12px padding, 999px radius
 *   - Shadow 0 3px 8px rgba(90,73,191,0.30)
 *   - Self-press animation: scale 1 → 0.96 → 1 over 200ms
 *
 *   Polished ticket → TicketCardMock variant="compact"
 *
 * MARKETING ADJUSTMENTS:
 *   - Typewriter cadence is narrative, not actual STT.
 *   - Polish button "presses itself" — never user-interactive.
 *   - prefers-reduced-motion: jumps straight to the polished ticket; transcript
 *     shown in full, no typewriter.
 */

import { useEffect, useReducer, useRef, useState } from "react";
import { TicketCardMock } from "./TicketCardMock";

const ROUGH_TRANSCRIPT =
  "the new project button doesn't show a loading state — feels stuck";

type Phase =
  | "listening"
  | "typing"
  | "ready"
  | "pressing"
  | "polished"
  | "hold";

const PHASE_DURATIONS: Record<Phase, number> = {
  listening: 1000,
  typing: ROUGH_TRANSCRIPT.length * 20 + 200,
  ready: 500,
  pressing: 280,
  polished: 1800,
  hold: 600,
};

const ORDER: Phase[] = ["listening", "typing", "ready", "pressing", "polished", "hold"];

function reducer(state: { phase: Phase }, action: { type: "next" | "reset" }) {
  if (action.type === "reset") return { phase: "listening" as Phase };
  const i = ORDER.indexOf(state.phase);
  return { phase: ORDER[(i + 1) % ORDER.length] };
}

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefers(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return prefers;
}

function useInViewport<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  // Default to true when IntersectionObserver isn't available (SSR, old
  // browsers) so the demo plays instead of sitting frozen.
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

export function VoiceTicketDemo() {
  const [state, dispatch] = useReducer(reducer, { phase: "listening" as Phase });
  const [typedChars, setTypedChars] = useState(0);
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInViewport<HTMLDivElement>();

  // Phase clock
  useEffect(() => {
    if (reduced || !inView) return;
    const dur = PHASE_DURATIONS[state.phase];
    const id = window.setTimeout(() => dispatch({ type: "next" }), dur);
    return () => window.clearTimeout(id);
  }, [state.phase, reduced, inView]);

  // Typewriter for the rough transcript. Only the interval body mutates state;
  // the JSX derives the visible substring from state.phase, so no synchronous
  // reset is needed here.
  useEffect(() => {
    if (reduced) return;
    if (state.phase !== "typing") return;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setTypedChars(n);
      if (n >= ROUGH_TRANSCRIPT.length) window.clearInterval(id);
    }, 20);
    return () => window.clearInterval(id);
  }, [state.phase, reduced]);

  const showPolished = state.phase === "polished" || state.phase === "hold";
  const pressing = state.phase === "pressing";

  // visibleChars derives from state.phase so we don't need a synchronous
  // setState reset every time we cycle the loop.
  let visibleChars: number;
  if (reduced) visibleChars = ROUGH_TRANSCRIPT.length;
  else if (state.phase === "listening") visibleChars = 0;
  else if (state.phase === "typing") visibleChars = typedChars;
  else visibleChars = ROUGH_TRANSCRIPT.length;

  return (
    <div className="vtdemo" ref={ref} data-phase={state.phase}>
      <div className="vtdemo-card">
        <div className="vtdemo-eyebrow">VOICE NOTE</div>
        <div className="vtdemo-wave" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <i key={i} />
          ))}
        </div>
        <div className={`vtdemo-stage${showPolished ? " is-polished" : ""}`}>
          <div className="vtdemo-rough">
            &ldquo;
            {ROUGH_TRANSCRIPT.slice(0, visibleChars)}
            {!reduced && state.phase === "typing" && visibleChars < ROUGH_TRANSCRIPT.length ? (
              <span className="vtdemo-caret" aria-hidden="true" />
            ) : null}
            &rdquo;
          </div>
          <div className="vtdemo-polished">
            <TicketCardMock
              title="New project button missing loading state"
              severity="high"
              page="aurora.com/dashboard"
              element="New project button"
              reporter="Daniel Torres"
              variant="compact"
            />
          </div>
        </div>
        <div className="vtdemo-foot">
          <span className="vtdemo-time">0:11</span>
          <button
            type="button"
            className={`vtdemo-polish${pressing ? " is-pressing" : ""}`}
            aria-hidden="true"
            tabIndex={-1}
          >
            Polish <span className="vtdemo-polish-spark" />
          </button>
        </div>
      </div>
    </div>
  );
}
