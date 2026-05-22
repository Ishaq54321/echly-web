/**
 * <TicketCardMock />
 *
 * Pixel-faithful marketing mirror of the real product's ticket detail surface:
 *   - components/session/feedbackDetail/FeedbackDetail.tsx
 *   - components/session/feedbackDetail/FeedbackHeader.tsx
 *   - components/session/feedbackDetail/FeedbackContent.tsx
 *   - components/layout/operating-system/TicketItem.tsx
 *   - components/ui/Tag.tsx
 *
 * No imports from the app tree — this is an independent component sized and
 * tuned for marketing-surface viewing.
 *
 * VISUAL SPECIFICATION carried over from real components:
 *
 *   Container
 *   ────────────────────────────────────────────────────────────────────
 *   - Background          #FFFFFF
 *   - Radius              14px (mirrors --content-card-radius)
 *   - Border              1px solid #E5E7EB (mirrors --border)
 *   - Shadow (floating)   0 24px 48px -16px rgba(20,16,30,0.10),
 *                         0 4px 12px -4px rgba(20,16,30,0.04)
 *                         (mirrors --mk-sh-lg)
 *   - Shadow (detail)     0 8px 24px -8px rgba(20,16,30,0.08),
 *                         0 2px 6px -2px rgba(20,16,30,0.04)
 *                         (mirrors --mk-sh-md)
 *   - Padding             16px (floating) / 18px (detail) / 12px (list/compact)
 *
 *   Eyebrow ("ANNOTE AI · POLISHED")
 *   ────────────────────────────────────────────────────────────────────
 *   - Font size           9px
 *   - Letter spacing      0.12em
 *   - Color               var(--ink-3) #8A8298
 *   - Weight              600
 *   - Spark icon (11×11)  conic-gradient(from 0deg, #5A49BF, #C51A68, #6557CC, #5A49BF)
 *                         3px radius, 4s linear spin
 *
 *   Severity badge
 *   ────────────────────────────────────────────────────────────────────
 *   - High                bg rgba(197,26,104,0.12), color #C51A68,
 *                         border 1px rgba(197,26,104,0.25)
 *   - Medium              bg rgba(201,122,31,0.12), color #B36A18,
 *                         border 1px rgba(201,122,31,0.25)
 *   - Low                 bg rgba(27,22,38,0.06), color var(--ink-2),
 *                         border 1px var(--line-2)
 *   - Geometry            font 9px, padding 3px 7px, radius 4px,
 *                         uppercase, weight 600, letter-spacing 0.04em
 *
 *   Title
 *   ────────────────────────────────────────────────────────────────────
 *   - Font: "DM Sans" 600
 *   - Size 13.5px (floating/list/compact), 16px (detail)
 *   - Color #15101F (var(--ink-1))
 *   - Letter-spacing -0.012em, line-height 1.32
 *
 *   Meta block (Page / Element / Reporter)
 *   ────────────────────────────────────────────────────────────────────
 *   - Wrapper: bg var(--bg-0) #F2F0EB, border 1px var(--line-1),
 *              radius 8px, padding 10px 12px
 *   - Rows: monospace font, 10.5px
 *   - Label column 56px wide, color var(--ink-3)
 *   - Value: var(--ink-1), font-weight 500
 *
 *   Tag pills
 *   ────────────────────────────────────────────────────────────────────
 *   - 9.5px font, 3px 7px padding
 *   - bg var(--bg-0), border 1px var(--line-1)
 *   - color var(--ink-2), letter-spacing 0.02em
 *   - Radius 999px (pill)
 *
 *   Send button
 *   ────────────────────────────────────────────────────────────────────
 *   - Brand purple #5A49BF, white text
 *   - 11px font, weight 500
 *   - Padding 6px 12px, radius 999px
 *   - Shadow 0 3px 10px -2px rgba(90,73,191,0.30)
 *
 * MARKETING ADJUSTMENTS:
 *   - `floating` variant ships with stronger shadow + slightly larger meta
 *     than the real detail surface, to read at hero scale.
 *   - `compact` variant suppresses the tags row (used inside VoiceTicketDemo
 *     where vertical density needs to stay tight).
 *   - `list` variant collapses to a one-line ticket row (mirrors TicketItem.tsx).
 *   - No hover/active states — demo cards are non-interactive.
 */

import type { CSSProperties } from "react";
import { ArrowIcon } from "../icons";

export type TicketCardVariant = "floating" | "detail" | "compact" | "list";

export type TicketCardSeverity = "high" | "medium" | "low";

export interface TicketCardMockProps {
  title: string;
  severity?: TicketCardSeverity;
  page?: string;
  element?: string;
  reporter?: string;
  tags?: ReadonlyArray<string>;
  variant?: TicketCardVariant;
  className?: string;
  style?: CSSProperties;
  /** Used by CaptureDemo for the slide-up animation. */
  "data-state"?: string;
}

const SEVERITY_LABELS: Record<TicketCardSeverity, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function TicketCardMock({
  title,
  severity = "high",
  page,
  element,
  reporter,
  tags,
  variant = "floating",
  className,
  style,
  "data-state": dataState,
}: TicketCardMockProps) {
  if (variant === "list") {
    return (
      <div
        className={`tcm tcm--list${className ? ` ${className}` : ""}`}
        style={style}
        data-state={dataState}
      >
        <span className="tcm-list-ico" aria-hidden="true">
          {/* simple bug-ish icon mirrors getTicketIconFromTags fallback */}
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="4.6"
              stroke="currentColor"
              strokeWidth="1.4"
              fill="none"
            />
            <path
              d="M8 4.4v3.6l2 1.2"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="tcm-list-title">{title}</span>
        <span className={`tcm-sev tcm-sev--${severity}`}>
          {SEVERITY_LABELS[severity]}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`tcm tcm--${variant}${className ? ` ${className}` : ""}`}
      style={style}
      data-state={dataState}
    >
      <div className="tcm-head">
        <span className="tcm-ai">
          <span className="tcm-ai-spark" />
          ANNOTE AI · POLISHED
        </span>
        <span className={`tcm-sev tcm-sev--${severity}`}>
          {SEVERITY_LABELS[severity]}
        </span>
      </div>
      <div className="tcm-title">{title}</div>
      {(page || element || reporter) && (
        <div className="tcm-meta">
          {page && (
            <div className="tcm-meta-row">
              <span>Page</span>
              <b>{page}</b>
            </div>
          )}
          {element && (
            <div className="tcm-meta-row">
              <span>Element</span>
              <b>{element}</b>
            </div>
          )}
          {reporter && (
            <div className="tcm-meta-row">
              <span>Reporter</span>
              <b>{reporter}</b>
            </div>
          )}
        </div>
      )}
      {variant !== "compact" && tags && tags.length > 0 && (
        <div className="tcm-tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      <button type="button" className="tcm-send">
        Send <ArrowIcon size={11} />
      </button>
    </div>
  );
}
