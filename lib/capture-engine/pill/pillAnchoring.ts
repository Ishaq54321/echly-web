/**
 * Pill positioning.
 *
 * Phase 22.5: smart anchoring.
 *   - Small element (<= 200px tall) AND room below in the safe area → anchor below.
 *   - Otherwise → center in the safe area (viewport minus right tray + bottom controls).
 *
 * Safe-zone defaults are measured at runtime from the live DOM in CapturePill;
 * the literal fallbacks here match the 440-wide sidebar and 88-tall session
 * controls bar (sc-bar + 32px bottom offset).
 */

export interface PillPosition {
  top: string;
  left: string;
  transform: string;
  /**
   * Numeric left-edge position of the pill, in CSS pixels. For center-mode
   * placements `transform: translate(-50%, -50%)` is applied so the visible
   * left edge is `leftPx - pillSize.width / 2`; `leftPx` here is the
   * pre-transform CSS `left` value the caller would write to the root.
   */
  leftPx: number;
  /**
   * Visible left-edge of the pill in viewport coordinates, AFTER any
   * translate transform. Useful for deriving the right edge (and thus
   * right-anchored positioning for grow-from-left behavior).
   */
  visibleLeftPx: number;
}

interface PillAnchoringInput {
  elementRect: DOMRect | null;
  viewport: { width: number; height: number };
  pillSize: { width: number; height: number };
  rightTrayWidth: number;
  bottomControlsHeight: number;
}

const BREATHING_ROOM = 24;
const ELEMENT_HEIGHT_THRESHOLD = 200;
const PILL_GAP_FROM_ELEMENT = 16;

export function computePillPosition({
  elementRect,
  viewport,
  pillSize,
  rightTrayWidth,
  bottomControlsHeight,
}: PillAnchoringInput): PillPosition {
  const safeArea = {
    left: BREATHING_ROOM,
    right: viewport.width - rightTrayWidth - BREATHING_ROOM,
    top: BREATHING_ROOM,
    bottom: viewport.height - bottomControlsHeight - BREATHING_ROOM,
  };
  const safeCenter = {
    x: (safeArea.left + safeArea.right) / 2,
    y: (safeArea.top + safeArea.bottom) / 2,
  };

  if (elementRect && elementRect.height <= ELEMENT_HEIGHT_THRESHOLD) {
    const belowTop = elementRect.bottom + PILL_GAP_FROM_ELEMENT;
    const belowBottom = belowTop + pillSize.height;

    if (belowBottom <= safeArea.bottom) {
      let leftPx =
        elementRect.left + elementRect.width / 2 - pillSize.width / 2;
      leftPx = Math.max(
        safeArea.left,
        Math.min(leftPx, safeArea.right - pillSize.width)
      );
      return {
        top: `${belowTop}px`,
        left: `${leftPx}px`,
        transform: "none",
        leftPx,
        visibleLeftPx: leftPx,
      };
    }
  }

  return {
    top: `${safeCenter.y}px`,
    left: `${safeCenter.x}px`,
    transform: "translate(-50%, -50%)",
    leftPx: safeCenter.x,
    visibleLeftPx: safeCenter.x - pillSize.width / 2,
  };
}
