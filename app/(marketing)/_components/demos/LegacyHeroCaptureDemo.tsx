"use client";

/**
 * LegacyHeroCaptureDemo — PARKED, not rendered anywhere.
 * ─────────────────────────────────────────────────────
 * This is the FULL interactive "click anywhere to record" hero demo that the
 * marketing homepage used to ship. It was lifted out of HeroCaptureDemo.tsx
 * verbatim so the marketing hero could drop the click-to-capture interaction
 * while keeping the clickable extension tray. Nothing renders this component
 * today; it's exported from demos/index.ts purely so it stays type-checked and
 * easy to revive — swap the import in Hero.tsx back to this and the old
 * behaviour returns wholesale.
 *
 * If you ever want this interaction back: import { LegacyHeroCaptureDemo }
 * from "../demos" in Hero.tsx and render it instead of HeroCaptureDemo.
 *
 * ── Original docs (kept for reference) ──────────────────────────────────────
 * HeroCaptureDemo (v6) — INTERACTIVE showcase of the real capture flow.
 *
 * v5 was an auto-playing 11s loop. v6 turns it into a state machine driven by
 * user input: the demo sits idle until the visitor clicks, then plays one
 * capture sequence anchored to whatever they clicked, and freezes on the
 * EditModal until they dismiss it. Tray tickets are independently clickable and
 * open their own EditModal. See MARKETING_PHASE_2B_v6_SUMMARY.md.
 *
 * State machine
 * ─────────────
 *   idle ──click in demo zone──▶ capturing(phase) ──9s sequence──▶ modal-open(captured)
 *     ▲                                                                   │
 *     └──────────────── modal dismiss (Save / X / backdrop) ─────────────┘
 *
 *   idle ──click a tray ticket──▶ modal-open(thatTicket) ──dismiss──▶ idle
 *
 * Capture phases (v8 timing, ~9.6s to modal-visible):
 *   highlight 600 · pill-in 500 · listening 1500 · transcribing 5000 ·
 *   transcript-hold 1500 · sending 200 · ticket-lands 300
 *
 * v8: longer transcript (~5s typing), then a deliberate `transcript-hold`
 * (1500ms) where the full caption sits still — pill, caption, and the timer
 * (now demo-controlled, no internal timer, no reset flicker) all hold — before
 * the modal opens. Background is lightly softened (no dimming); the modal
 * backdrop is a light frosted-glass scrim.
 *
 * Layering (v14): the FauxSite background and the frosted `.hcd-glass-layer` are
 * gone. Annote is the unambiguous hero — all crisp elements live in
 * `.hcd-annote-layer` directly over the section's natural background. The
 * `<DemoCursor>` overlay (Fix 1) and click-anchored pill/highlight (Fix 4) stay.
 * A click anywhere in the empty stage drops a synthetic 200×40 highlight at the
 * click point and runs one capture sequence.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ArrowIcon, DownloadIcon } from "../icons";
import { CapturePill } from "./annote/CapturePill";
import { ExtensionTray } from "./annote/ExtensionTray";
import { ElementHighlighter } from "./annote/ElementHighlighter";
import { SpeechCaption } from "./annote/SpeechCaption";
import { EditModal } from "./annote/EditModal";
import { DemoCursor } from "./annote/DemoCursor";
import {
  MOCK_DEMO_TICKETS,
  DEMO_CAPTURE_TICKET,
  DEMO_SESSION_TITLE,
  DEMO_TRANSCRIPT,
  type MockTicket,
} from "./annote/mockTickets";

// ─── State machine types ──────────────────────────────────────────────────────

type CapturePhase =
  | "highlight"
  | "pill-in"
  | "listening"
  | "transcribing"
  | "transcript-hold"
  | "sending"
  | "ticket-lands"
  | "modal-opens";

type Rect = { top: number; left: number; width: number; height: number };

type DemoState =
  | { kind: "idle" }
  | { kind: "capturing"; rect: Rect; phase: CapturePhase }
  | { kind: "modal-open"; ticket: MockTicket };

/**
 * Phase → ms-until-next-phase.
 *
 * v9 pacing (Fix 6): compressed and snappy. The old multi-second "listening"
 * beat is gone — highlight settles, the pill animates in, the caption appears
 * with a blinking cursor, and the first transcript word lands, all within
 * ~300ms of the click. The transcript (now ~120 chars, Fix 1) types over 3s,
 * then `transcript-hold` (1500ms) lets the viewer read it, a 200ms `sending`
 * spinner flash, then `ticket-lands` (300ms) opens the modal CONCURRENTLY.
 *
 *   highlight 150 · pill-in 100 · listening 50 (first word at ~300ms) ·
 *   transcribing 3000 · transcript-hold 1500 · sending 200 · ticket-lands 300
 *
 * Click → first word ≈ 300ms · click → modal-visible ≈ 5.3s.
 */
/**
 * Polish pass: slowed for tactile readability. Every beat got more room so
 * viewers see each step land rather than experiencing the sequence as a blur.
 *
 *   highlight 350 (was 150) Â· pill-in 500 (was 100) Â· listening 150 (was 50) Â·
 *   transcribing 3600 (was 3000) Â· transcript-hold 1800 (was 1500) Â·
 *   sending 350 (was 200) Â· ticket-lands 400 (was 300)
 *
 * Click â†’ first word â‰ˆ 1.0s (was 0.3s). Click â†’ modal-visible â‰ˆ 7.0s (was 5.3s).
 */
const PHASE_DURATION: Record<CapturePhase, number> = {
  highlight: 600,
  "pill-in": 700,
  listening: 200,
  transcribing: 4200,
  "transcript-hold": 1800,
  sending: 700,
  "ticket-lands": 500,
  "modal-opens": 0,
};

const PHASE_ORDER: CapturePhase[] = [
  "highlight",
  "pill-in",
  "listening",
  "transcribing",
  "transcript-hold",
  "sending",
  "ticket-lands",
];

// ─── Pill positioning (Fix 4) ───────────────────────────────────────────────────

const PILL_WIDTH = 320;
const PILL_HEIGHT = 56;
const GAP = 12;

/** Mirrors the real extension's computePillPosition: prefer below, flip above. */
function computePillPosition(rect: Rect, stageW: number, stageH: number) {
  let top = rect.top + rect.height + GAP;
  let left = rect.left + rect.width / 2 - PILL_WIDTH / 2;

  // Flip above if the pill (plus its caption headroom) would overflow the stage.
  if (top + PILL_HEIGHT + 120 > stageH) {
    top = rect.top - PILL_HEIGHT - GAP;
  }
  left = Math.max(16, Math.min(left, stageW - PILL_WIDTH - 16));
  top = Math.max(16, top);
  return { top, left };
}

export function LegacyHeroCaptureDemo() {
  const [demo, setDemo] = useState<DemoState>({ kind: "idle" });
  const [reducedMotion, setReducedMotion] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<number[]>([]);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  // Cursor tracking (Fix 1)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [inDemoZone, setInDemoZone] = useState(false);

  // ── prefers-reduced-motion ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ── Track stage size for pill positioning + tooltip edge-flip ──
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const measure = () =>
      setStageSize({ w: node.clientWidth, h: node.clientHeight });
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(node);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // ── Run the chained capture sequence from a clicked rect ──
  const runCaptureSequence = useCallback(
    (rect: Rect) => {
      clearTimers();
      // Phase 0 immediately.
      setDemo({ kind: "capturing", rect, phase: "highlight" });

      let acc = 0;
      // Advance through phases 1..n-1, then open the modal after the last phase.
      for (let i = 0; i < PHASE_ORDER.length; i++) {
        acc += PHASE_DURATION[PHASE_ORDER[i]];
        const next = PHASE_ORDER[i + 1];
        const at = acc;
        if (next) {
          const id = window.setTimeout(() => {
            setDemo({ kind: "capturing", rect, phase: next });
          }, at);
          timeoutsRef.current.push(id);
        } else {
          // After the final phase, freeze on the modal with the captured ticket.
          const id = window.setTimeout(() => {
            setDemo({ kind: "modal-open", ticket: DEMO_CAPTURE_TICKET });
          }, at);
          timeoutsRef.current.push(id);
        }
      }
    },
    [clearTimers],
  );

  // ── Click in the demo zone → capture sequence (Fix 2) ──
  const handleStageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (demo.kind !== "idle") return;
      const stage = stageRef.current;
      if (!stage) return;

      const target = e.target as HTMLElement;
      // Ignore clicks that landed on Annote UI (tray/panel handle their own)…
      if (target.closest("[data-annote-ui]")) return;
      // …and the real CTA button, which must navigate to /signup, not capture.
      if (target.closest(".hcd-hero-cta")) return;
      // …and the "New" feature pill above the headline, which links to #whats-new.
      if (target.closest(".hcd-hero-pill")) return;

      const stageRect = stage.getBoundingClientRect();

      // v15: the hero copy now lives INSIDE the stage, so a click can land on a
      // real text element (headline / sub) — frame that element's own bounds, a
      // self-referential "Annote capturing feedback on its own headline" moment.
      // A click in empty space falls back to a synthetic default-sized rect at
      // the click point.
      const textEl = target.closest<HTMLElement>(".hcd-hero-copy h1, .hcd-hero-copy p");

      let rect: Rect;
      if (textEl) {
        const elRect = textEl.getBoundingClientRect();
        // Clamp the height so a multi-line headline doesn't produce a too-tall
        // frame; cap at 96px and keep the highlight centered on the element.
        const MAX_HEIGHT = 96;
        const height = Math.min(elRect.height, MAX_HEIGHT);
        rect = {
          top: elRect.top - stageRect.top + (elRect.height - height) / 2,
          left: elRect.left - stageRect.left,
          width: elRect.width,
          height,
        };
      } else {
        const HIGHLIGHT_WIDTH = 200;
        const HIGHLIGHT_HEIGHT = 40;
        const cx = e.clientX - stageRect.left;
        const cy = e.clientY - stageRect.top;
        rect = {
          top: cy - HIGHLIGHT_HEIGHT / 2,
          left: cx - HIGHLIGHT_WIDTH / 2,
          width: HIGHLIGHT_WIDTH,
          height: HIGHLIGHT_HEIGHT,
        };
      }
      runCaptureSequence(rect);
    },
    [demo.kind, runCaptureSequence],
  );

  // ── Open a specific tray ticket's modal ──
  const handleTicketClick = useCallback((ticket: MockTicket) => {
    clearTimers();
    setDemo({ kind: "modal-open", ticket });
  }, [clearTimers]);

  // ── Dismiss modal → idle ──
  const handleModalClose = useCallback(() => {
    clearTimers();
    setDemo({ kind: "idle" });
  }, [clearTimers]);

  // ── Cursor tracking over the stage (Fix 1) ──
  const handlePointerMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageRect = stage.getBoundingClientRect();
    const x = e.clientX - stageRect.left;
    const y = e.clientY - stageRect.top;
    setCursorPos({ x, y });
    const target = e.target as HTMLElement;
    // Comment cursor only over the click-target zone — never over annote UI or
    // the real CTA button (which keeps its own pointer cursor).
    const overCarveout =
      !!target.closest("[data-annote-ui]") ||
      !!target.closest(".hcd-hero-cta") ||
      !!target.closest(".hcd-hero-pill");
    setInDemoZone(!overCarveout && demo.kind === "idle");
  }, [demo.kind]);

  const handlePointerLeave = useCallback(() => {
    setCursorPos(null);
    setInDemoZone(false);
  }, []);

  // The comment cursor is only meaningful at idle.
  const cursorActive = inDemoZone && demo.kind === "idle" && !reducedMotion;

  // ── Derived view flags ──
  const phase = demo.kind === "capturing" ? demo.phase : null;

  const isHighlighterVisible =
    demo.kind === "capturing" &&
    phase !== "ticket-lands" &&
    phase !== "modal-opens";

  const isPillVisible =
    demo.kind === "capturing" &&
    (phase === "pill-in" ||
      phase === "listening" ||
      phase === "transcribing" ||
      phase === "transcript-hold" ||
      phase === "sending");

  const isListening = phase === "listening" || phase === "transcribing";
  // Caption appears with the pill (start of pill-in) and persists through
  // listening/transcribing/transcript-hold/sending; it fades out as the modal
  // opens. During transcript-hold the full transcript sits visible with no caret.
  const isCaptionVisible =
    phase === "pill-in" ||
    phase === "listening" ||
    phase === "transcribing" ||
    phase === "transcript-hold" ||
    phase === "sending";

  // Fix 2: the modal opens CONCURRENTLY with ticket-lands. During the 300ms
  // ticket-lands window the ticket slides into the tray with its success glow
  // while the modal fades in over it; the state then flips to modal-open and
  // holds. So the modal is visible from the start of ticket-lands.
  const isModalVisible =
    demo.kind === "modal-open" ||
    (demo.kind === "capturing" && phase === "ticket-lands");

  // The captured ticket the modal shows — during ticket-lands it's the
  // freshly-captured one; once held open it's whatever ticket() resolved to.
  const modalTicket =
    demo.kind === "modal-open" ? demo.ticket : DEMO_CAPTURE_TICKET;

  // The captured ticket sits on top of the tray from the moment it lands and
  // stays there behind the held-open capture modal (Fix 2: "the new ticket is
  // there with a subtle fading green tint"). It's removed only when we return
  // to idle, so repeated capture clicks stay clean.
  const showCaptured =
    (demo.kind === "capturing" && phase === "ticket-lands") ||
    (demo.kind === "modal-open" && demo.ticket.id === DEMO_CAPTURE_TICKET.id);
  const tickets: MockTicket[] = useMemo(
    () => (showCaptured ? [DEMO_CAPTURE_TICKET, ...MOCK_DEMO_TICKETS] : MOCK_DEMO_TICKETS),
    [showCaptured],
  );
  // Trigger the one-shot success glow as the ticket lands; it self-clears after
  // ~1.2s, finishing while the modal is open.
  const highlightTicketId = phase === "ticket-lands" ? DEMO_CAPTURE_TICKET.id : null;

  // Pill + caption anchor (Fix 4)
  const pillAnchor = useMemo(() => {
    if (demo.kind !== "capturing") return null;
    return computePillPosition(demo.rect, stageSize.w || 900, stageSize.h || 720);
  }, [demo, stageSize.w, stageSize.h]);

  // Highlight rect during capture.
  const highlightRect = demo.kind === "capturing" ? demo.rect : null;

  // ── Waveform (recording/transcribing) ──
  const [tick, setTick] = useState(0);
  const waveActive = isListening;
  useEffect(() => {
    if (reducedMotion || !waveActive) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 90);
    return () => window.clearInterval(id);
  }, [reducedMotion, waveActive]);

  const waveformLevels = useMemo(() => {
    const BARS = 30;
    const t = tick * 0.18;
    return Array.from({ length: BARS }, (_, i) => {
      if (!waveActive) return 0.08;
      const offset = i / BARS;
      const base = Math.abs(Math.sin(t + i * 0.7)) * 0.7 + 0.15;
      const swell = Math.sin(t * 0.3 + offset * 3) * 0.18 + 0.5;
      return Math.max(0.1, Math.min(1, base * swell));
    });
  }, [tick, waveActive]);

  // ── Recording timer (visual only) ── (Fix 1, v8)
  //
  // v7 bug: the timer effect re-ran on every phase change and reset to 0,
  // producing the 00:00 → 00:01 → 00:00 flicker as the demo crossed the
  // listening → transcribing boundary. The pill itself is purely
  // presentational (it renders `elapsedFormatted` verbatim, no internal
  // timer), so the fix is entirely here: one interval that starts the instant
  // we ENTER `listening` (the `pillElapsedSec === 0` reset happens once, in the
  // same tick) and keeps ticking through transcribing / transcript-hold /
  // sending without ever resetting. It's torn down only when the recording UI
  // leaves the screen. `phase` drives the effect but the reset is gated on the
  // listening entry, so mid-recording phase changes don't disturb the count.
  const [pillElapsedSec, setPillElapsedSec] = useState(0);
  const timerRunning =
    phase === "listening" ||
    phase === "transcribing" ||
    phase === "transcript-hold" ||
    phase === "sending";

  useEffect(() => {
    if (phase === "listening") setPillElapsedSec(0);
  }, [phase]);

  useEffect(() => {
    if (!timerRunning || reducedMotion) return;
    const id = window.setInterval(() => setPillElapsedSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, reducedMotion]);

  const elapsedFormatted = useMemo(() => {
    const s = timerRunning ? pillElapsedSec : 0;
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }, [pillElapsedSec, timerRunning]);

  // ── Stage modifier classes (drive blur + cursor hiding) ──
  const stageCls = [
    "hcd",
    demo.kind === "idle" ? "is-idle" : "",
    demo.kind === "capturing" ? "is-capturing" : "",
    isModalVisible ? "is-modal" : "",
    cursorActive ? "is-demo-zone" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={stageRef}
      className={stageCls}
      aria-label="Annote interactive capture demo"
      onClick={handleStageClick}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      {/* v14: FauxSite + glass material removed. Annote IS the hero — the tools
          sit directly on the section's natural background. An animated section
          background may be added later at the section level, not here. */}

      {/* v15: the marketing copy is now PART of the capture surface. It sits in
          the upper-middle of the stage; clicking the headline or sub frames that
          element and runs the capture sequence (handled in handleStageClick).
          The only carve-out is the real "Get Annote" CTA. */}
      <div className="hcd-hero-copy">
        <a
          className="hcd-hero-pill"
          href="#whats-new"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="hcd-hero-pill-badge">New</span>
          <span className="hcd-hero-pill-text">
            Voice-to-ticket with full page context
          </span>
          <span className="hcd-hero-pill-arrow">
            <ArrowIcon size={11} />
          </span>
        </a>
        <h1 className="hcd-hero-h1">
          The fastest way to report a bug
          <br />
          and the <span className="hcd-hero-accent">easiest to fix.</span>
        </h1>
        <p className="hcd-hero-sub">
          Click the element, say what&apos;s wrong, and Annote writes the
          polished ticket. Your engineers get the full technical evidence — plus
          an AI that&apos;s already flagged the likely cause.
        </p>
        <div className="hcd-cta-group">
          <Link
            className="mk-hero-cta hcd-hero-cta"
            href="/signup"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mk-hero-cta-label">Get Annote for free</span>
            <span className="mk-hero-cta-arrow">
              <ArrowIcon size={14} />
            </span>
          </Link>
          <a
            className="hcd-hero-cta hcd-hero-cta-secondary"
            href="https://chromewebstore.google.com/detail/annote/bbgkibjfpdpiooneibjmafgiaiilpfhn"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <DownloadIcon size={18} />
            <span>Install Chrome Extension</span>
          </a>
        </div>
      </div>

      {/* Annote elements — sharp, full opacity, no filters */}
      <div className="annote-elements-layer hcd-annote-layer">
        <ElementHighlighter rect={highlightRect} visible={isHighlighterVisible} />

        {isPillVisible && pillAnchor && (
          <div
            className={`hcd-pill-anchor is-visible${phase === "sending" ? " is-structuring" : ""}`}
            style={{ top: pillAnchor.top, left: pillAnchor.left }}
          >
            <CapturePill
              targetRect={null}
              isListening={isListening}
              isFinishing={phase === "sending"}
              mode="voice"
              elapsedFormatted={elapsedFormatted}
              waveformLevels={waveformLevels}
              hintPhase="listening"
              voiceError={null}
              // Fix 5: the demo pill is watched, not used — disable hover.
              pillStyle={{ position: "relative", pointerEvents: "none" }}
            />
            {isCaptionVisible && (
              <SpeechCaption
                state={
                  phase === "transcribing" ||
                  phase === "transcript-hold" ||
                  phase === "sending"
                    ? "transcribing"
                    : "listening"
                }
                transcript={DEMO_TRANSCRIPT}
                // Polish pass: slowed to ~30 chars/sec (human reading speed).
                // ~21 words × 190ms ≈ 4.0s, inside the 4200ms transcribing phase
                // so the last word lands with a small buffer before
                // transcript-hold. The 250ms delay gives the start-of-box cursor
                // a brief blink before the first word.
                wordIntervalMs={190}
                typingDelayMs={250}
              />
            )}
          </div>
        )}

        <div className="hcd-tray-anchor">
          <ExtensionTray
            sessionTitle={DEMO_SESSION_TITLE}
            paused={false}
            tickets={tickets}
            highlightTicketId={highlightTicketId}
            onTicketClick={handleTicketClick}
          />
        </div>

        <div
          className="hcd-modal-anchor"
          style={{ display: isModalVisible ? "block" : "none" }}
        >
          <AnimatePresence>
            {isModalVisible && (
              <EditModal key="edit-modal" ticket={modalTicket} onClose={handleModalClose} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom comment cursor + tooltip (Fix 1) — above everything, click-through */}
      <DemoCursor
        pos={cursorPos}
        inDemoZone={cursorActive}
        stageWidth={stageSize.w || 900}
        stageHeight={stageSize.h || 720}
      />
    </div>
  );
}
