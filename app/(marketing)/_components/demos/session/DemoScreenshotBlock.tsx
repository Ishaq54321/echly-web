/**
 * DemoScreenshotBlock — marketing adaptation of
 * components/session/feedbackDetail/ScreenshotBlock.tsx (read-only variant).
 *
 * Modifications from source:
 * - Renders a real <img> (screenshot.src under /marketing/screenshots/) using
 *   object-fit: contain over a soft-gray backdrop so both landscape and portrait
 *   captures show fully without cropping. The frame geometry, hover scrim, corner
 *   Expand/Edit buttons, and the Info-badge tooltip are copied verbatim from
 *   ScreenshotBlock so the chrome is pixel-identical.
 * - Stripped useScreenshotUrl plumbing (screenshotUrl/loading/error props),
 *   the decode blur-up state, the loading spinner, and the NoScreenshot empty
 *   state — none apply to an inline SVG that's always present.
 * - Uses captureInfo utils (parseDeviceInfo / formatLocalDateTime are pure) to
 *   build the Info tooltip, same as source. Wait — the demo passes a pre-built
 *   metadata string instead, since the mock UA strings are synthetic.
 * - Adds a single static <StaticPin> overlay (the captured-element marker).
 * - onExpand / onEdit are no-ops in the demo.
 * - embeddedInCard branch kept (FeedbackContent always passes embeddedInCard).
 */
"use client";

import { Info } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { StaticPin } from "./screenshots/StaticPin";
import type { MockScreenshot } from "./sessionMockData";

interface DemoScreenshotBlockProps {
  screenshot: MockScreenshot;
  /** Alt text for the screenshot image (the ticket title). */
  alt: string;
  /** Pre-composed tooltip lines (page area · device · date). */
  infoTooltip: string;
  /** Optional pin note shown on hover. */
  pinTooltip?: string;
  onExpand?: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function DemoScreenshotBlock({
  screenshot,
  alt,
  infoTooltip,
  pinTooltip,
  onExpand,
  onEdit,
  canEdit = true,
}: DemoScreenshotBlockProps) {
  const outerFrame =
    "rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.005] group";
  const innerRadius = "rounded-lg";

  return (
    <div className={outerFrame}>
      <div
        className={`relative overflow-hidden ${innerRadius} bg-[var(--layer-2-bg)] w-full`}
        style={{ height: "clamp(220px, 38vw, 317px)" }}
      >
        {/* Real screenshot — `cover` fills the wide frame edge-to-edge with no
            gaps left/right (matches the original SVG `slice` behavior). The
            backdrop only shows during load. Placeholders are authored at the
            frame's ~2.64:1 ratio so nothing is cropped until real images land. */}
        <div className="absolute inset-0 bg-[#F4F4F2]">
          <img
            src={screenshot.src}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover object-center block"
          />
        </div>

        {/* Static pin marker — the captured-element marker (pins, not a rect). */}
        <StaticPin
          x={screenshot.pin.x}
          y={screenshot.pin.y}
          number={screenshot.pin.number}
          tooltip={pinTooltip}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none" />

        {infoTooltip ? (
          <div className="absolute top-3 left-3">
            <Tooltip content={infoTooltip} position="right">
              <span
                aria-label="Device info"
                className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-black/55 text-white backdrop-blur-sm shadow-[var(--shadow-level-1)]"
              >
                <Info className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
              </span>
            </Tooltip>
          </div>
        ) : null}
      </div>
    </div>
  );
}
