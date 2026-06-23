"use client";

/**
 * HeroCaptureDemo (v16) — static hero with a CLICKABLE extension tray.
 *
 * v6–v15 wired the entire hero as an interactive "click anywhere to record"
 * surface: clicking the stage dropped a highlight, ran a ~9s capture sequence
 * (pill → listening → transcribing → caption → sending → ticket-lands), then
 * froze on the capture EditModal with a freshly-landed ticket. v16 REMOVES that
 * click-to-capture interaction. The whole capture state machine — cursor
 * tracking, phase timers, the synthetic-highlight pill/caption — has been lifted
 * out verbatim into LegacyHeroCaptureDemo.tsx (parked, not rendered). To revive
 * the old behaviour, swap Hero.tsx's import back to LegacyHeroCaptureDemo.
 *
 * What remains here:
 *   • the hero copy + the real CTAs (unchanged)
 *   • the extension tray, still independently clickable — clicking a tray ticket
 *     opens THAT ticket's EditModal (its description view) and dismissing returns
 *     to idle. This is the only interaction left.
 *
 * State machine
 * ─────────────
 *   idle ──click a tray ticket──▶ modal-open(thatTicket) ──dismiss──▶ idle
 */

import { useCallback, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ArrowIcon, DownloadIcon } from "../icons";
import { HeroCaptureStream } from "../HeroCaptureStream";
import { ExtensionTray } from "./annote/ExtensionTray";
import { EditModal } from "./annote/EditModal";
import {
  MOCK_DEMO_TICKETS,
  DEMO_SESSION_TITLE,
  type MockTicket,
} from "./annote/mockTickets";

// ─── State machine types ──────────────────────────────────────────────────────

type DemoState =
  | { kind: "idle" }
  | { kind: "modal-open"; ticket: MockTicket };

export function HeroCaptureDemo() {
  const [demo, setDemo] = useState<DemoState>({ kind: "idle" });

  // ── Open a specific tray ticket's modal ──
  const handleTicketClick = useCallback((ticket: MockTicket) => {
    setDemo({ kind: "modal-open", ticket });
  }, []);

  // ── Dismiss modal → idle ──
  const handleModalClose = useCallback(() => {
    setDemo({ kind: "idle" });
  }, []);

  // ── Derived view flags ──
  const isModalVisible = demo.kind === "modal-open";
  const modalTicket = demo.kind === "modal-open" ? demo.ticket : null;

  // Stage no longer carries capture/idle/demo-zone modifiers; the only state
  // that matters for styling is whether a tray-ticket modal is open.
  const stageCls = ["hcd", "is-idle", isModalVisible ? "is-modal" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={stageCls} aria-label="Annote hero">
      {/* Decorative "live capture stream" — pinned behind all hero content
          (z-index 0, pointer-events:none). Mounts alongside the copy, never
          gates its paint. See HeroCaptureStream.tsx. */}
      <HeroCaptureStream />

      {/* The marketing copy + the real CTAs. The "click anywhere to record"
          interaction that previously wrapped this whole surface is gone (see
          LegacyHeroCaptureDemo.tsx); the copy is plain content now. */}
      <div className="hcd-hero-copy">
        <a className="hcd-hero-pill" href="#whats-new">
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
          <Link className="mk-hero-cta hcd-hero-cta" href="/signup">
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
          >
            <DownloadIcon size={18} />
            <span>Install Chrome Extension</span>
          </a>
        </div>
      </div>

      {/* Annote elements — sharp, full opacity, no filters */}
      <div className="annote-elements-layer hcd-annote-layer">
        <div className="hcd-tray-anchor">
          <ExtensionTray
            sessionTitle={DEMO_SESSION_TITLE}
            paused={false}
            tickets={MOCK_DEMO_TICKETS}
            highlightTicketId={null}
            onTicketClick={handleTicketClick}
          />
        </div>

        <div
          className="hcd-modal-anchor"
          style={{ display: isModalVisible ? "block" : "none" }}
        >
          <AnimatePresence>
            {isModalVisible && modalTicket && (
              <EditModal key="edit-modal" ticket={modalTicket} onClose={handleModalClose} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
