/**
 * Fixed positioning for portaled action menus (e.g. session "more" menus).
 * Uses layout width for collision detection (matches CSS max-width cap ~220px).
 */
export const PORTAL_DROPDOWN_LAYOUT_WIDTH_PX = 220;

/** Used before the menu is measured (list rows flip above/below). */
export const PORTAL_DROPDOWN_HEIGHT_ESTIMATE_PX = 280;

const GAP_PX = 8;
const VIEWPORT_MARGIN_PX = 8;

export type PortalDropdownPlacement = "below" | "above";

export type GetPortalDropdownFixedPositionOptions = {
  /** Measured menu width; defaults to {@link PORTAL_DROPDOWN_LAYOUT_WIDTH_PX}. */
  menuWidthPx?: number;
  /** Measured menu height; used for vertical placement and clamping. */
  menuHeightPx?: number;
  placement?: PortalDropdownPlacement;
};

/**
 * Computes top/left for `position: fixed` so the menu stays inside the viewport.
 * Default: menu is **right-aligned** to the trigger (expands left), like Radix `align="end"`.
 */
export function getPortalDropdownFixedPosition(
  triggerRect: DOMRect,
  options?: GetPortalDropdownFixedPositionOptions
): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const measuredW = options?.menuWidthPx;
  const w = Math.max(
    measuredW != null && measuredW > 0 ? measuredW : PORTAL_DROPDOWN_LAYOUT_WIDTH_PX,
    1
  );
  const hRaw = options?.menuHeightPx ?? 0;
  const h = hRaw > 0 ? hRaw : PORTAL_DROPDOWN_HEIGHT_ESTIMATE_PX;
  const placement = options?.placement ?? "below";

  let top: number;
  if (placement === "above") {
    top = triggerRect.top - GAP_PX - h;
  } else {
    top = triggerRect.bottom + GAP_PX;
  }

  if (hRaw > 0) {
    if (top < VIEWPORT_MARGIN_PX) {
      top = VIEWPORT_MARGIN_PX;
    } else if (top + hRaw > vh - VIEWPORT_MARGIN_PX) {
      top = Math.max(VIEWPORT_MARGIN_PX, vh - VIEWPORT_MARGIN_PX - hRaw);
    }
  }

  let left = triggerRect.right - w;
  left = Math.max(VIEWPORT_MARGIN_PX, Math.min(left, vw - VIEWPORT_MARGIN_PX - w));

  return { top, left };
}
