"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Wand2,
  SpellCheck,
  BookType,
  ArrowUpWideNarrow,
  ArrowDownNarrowWide,
  BriefcaseBusiness,
  Laugh,
  ChevronUp,
} from "lucide-react";
import type { ImproveAction } from "@/lib/ai/prompts/improveDescription";
import { usePortalHost } from "./PortalHost";

interface ImproveDescriptionPillProps {
  onImprove: (action: ImproveAction) => void | Promise<void>;
  isImproving: boolean;
  /** Container the pill is positioned within and constrained to (the editor shell). */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Dictate pill — used for collision/overlap avoidance during drag. */
  dictateRef: RefObject<HTMLButtonElement | null>;
}

const MENU_WIDTH_EST = 220;
const SUBMENU_WIDTH_EST = 190;
const SUBMENU_HEIGHT_EST = 76;
const DRAG_THRESHOLD = 4;

function MenuItem({
  icon,
  label,
  onClick,
  trailing,
  onMouseEnter,
  onMouseLeave,
  onFocus,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      className="flex items-center gap-2 w-full rounded-[6px] text-left font-normal text-white cursor-pointer transition-colors"
      style={{ height: 30, padding: "4px 10px", fontSize: 12 }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--overlay-dark-inset-hi)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <span className="inline-flex items-center justify-center" style={{ opacity: 0.85 }}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {trailing}
    </button>
  );
}

function Separator() {
  return (
    <div
      aria-hidden
      style={{
        height: 1,
        background: "var(--overlay-dark-inset-hi)",
        margin: "2px 8px",
      }}
    />
  );
}

export function ImproveDescriptionPill({
  onImprove,
  isImproving,
  containerRef,
  dictateRef,
}: ImproveDescriptionPillProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const toneItemRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [toneHover, setToneHover] = useState(false);
  const [submenuPos, setSubmenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const submenuHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const portalHost = usePortalHost();

  // Drag state. `position` is the absolute offset within the container.
  // `null` = use default bottom-left placement (initial render).
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // `expanded` is armed by hovering the left (Sparkles) side. Once armed,
  // moving the cursor onto the chevron keeps the label open. Disarms only
  // when the pointer leaves the entire pill.
  const [expanded, setExpanded] = useState(false);
  // Tracks whether the current pointer interaction crossed the drag threshold,
  // used to suppress the synthetic click that follows a drag.
  const draggedRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pendingDragRef = useRef(false);

  const cancelSubmenuHide = () => {
    if (submenuHideTimeoutRef.current) {
      clearTimeout(submenuHideTimeoutRef.current);
      submenuHideTimeoutRef.current = null;
    }
  };

  const scheduleSubmenuHide = (delay: number) => {
    cancelSubmenuHide();
    submenuHideTimeoutRef.current = setTimeout(() => setToneHover(false), delay);
  };

  useEffect(() => {
    return () => {
      if (submenuHideTimeoutRef.current) clearTimeout(submenuHideTimeoutRef.current);
    };
  }, []);

  // Outside click / Escape dismisses the menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const n = e.target as Node;
      if (wrapperRef.current?.contains(n)) return;
      if (menuRef.current?.contains(n)) return;
      if (submenuRef.current?.contains(n)) return;
      setMenuOpen(false);
      setToneHover(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelSubmenuHide();
        setToneHover(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Position the dropdown above the pill using portal coordinates so it
  // escapes overflow/transform ancestors.
  useEffect(() => {
    if (!menuOpen) return;
    const update = () => {
      const el = pillRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      let left = r.left;
      if (left + MENU_WIDTH_EST > viewportWidth - 8) {
        left = viewportWidth - MENU_WIDTH_EST - 8;
      }
      if (left < 8) left = 8;
      setMenuPos({ top: r.top, left });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [menuOpen]);

  const startPotentialDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isImproving) return;
    if (e.button !== 0) return;
    const pill = pillRef.current;
    const container = containerRef.current;
    if (!pill || !container) return;

    const pillRect = pill.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - pillRect.left,
      y: e.clientY - pillRect.top,
    };
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    pendingDragRef.current = true;
    draggedRef.current = false;

    let dragging = false;

    const onMouseMove = (ev: MouseEvent) => {
      const start = dragStartRef.current;
      if (!start) return;
      const c = containerRef.current;
      const p = pillRef.current;
      if (!c || !p) return;

      // Promote to a real drag once the threshold is crossed.
      if (!dragging) {
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        dragging = true;
        draggedRef.current = true;
        setIsDragging(true);
      }

      const containerRect = c.getBoundingClientRect();
      const pRect = p.getBoundingClientRect();
      const pillW = pRect.width;
      const pillH = pRect.height;

      let newX = ev.clientX - containerRect.left - dragOffsetRef.current.x;
      let newY = ev.clientY - containerRect.top - dragOffsetRef.current.y;

      const margin = 8;
      newX = Math.max(margin, Math.min(newX, containerRect.width - pillW - margin));
      newY = Math.max(margin, Math.min(newY, containerRect.height - pillH - margin));

      const dictateEl = dictateRef.current;
      if (dictateEl) {
        const dr = dictateEl.getBoundingClientRect();
        const dl = {
          left: dr.left - containerRect.left,
          top: dr.top - containerRect.top,
          right: dr.right - containerRect.left,
          bottom: dr.bottom - containerRect.top,
        };
        const overlapX = newX < dl.right && newX + pillW > dl.left;
        const overlapY = newY < dl.bottom && newY + pillH > dl.top;
        if (overlapX && overlapY) {
          const fromLeft = newX + pillW / 2 < (dl.left + dl.right) / 2;
          newX = fromLeft
            ? Math.max(margin, dl.left - pillW - 4)
            : Math.min(containerRect.width - pillW - margin, dl.right + 4);
        }
      }

      setPosition({ left: newX, top: newY });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      pendingDragRef.current = false;
      dragStartRef.current = null;
      setIsDragging(false);
      // Clear the "this was a drag" flag on the next tick so the trailing
      // click handler can read it first and suppress its action.
      setTimeout(() => {
        draggedRef.current = false;
      }, 0);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const trigger = (action: ImproveAction) => {
    if (isImproving) return;
    cancelSubmenuHide();
    setToneHover(false);
    setMenuOpen(false);
    void onImprove(action);
  };

  const handleMainClick = () => {
    if (isImproving) return;
    if (draggedRef.current) return;
    trigger("improve");
  };

  const handleChevronClick = () => {
    if (isImproving) return;
    if (draggedRef.current) return;
    setMenuOpen((v) => !v);
  };

  const openToneSubmenu = () => {
    cancelSubmenuHide();
    const el = toneItemRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    let left = r.right + 4;
    if (left + SUBMENU_WIDTH_EST > viewportWidth - 8) {
      left = r.left - SUBMENU_WIDTH_EST - 4;
    }
    let top = r.top;
    if (top + SUBMENU_HEIGHT_EST > window.innerHeight - 8) {
      top = window.innerHeight - SUBMENU_HEIGHT_EST - 8;
    }
    setSubmenuPos({ top, left });
    setToneHover(true);
  };

  const menuTopFromPos = menuPos
    ? { top: menuPos.top - 4, left: menuPos.left }
    : null;

  // Default placement: bottom-left of the container, mirroring the original
  // in-flex position. Once the user drags, `position` becomes non-null and
  // pins the pill to absolute coordinates.
  const wrapperStyle: React.CSSProperties =
    position === null
      ? {
          position: "absolute",
          left: 18,
          bottom: 12,
          zIndex: 10,
          cursor: isDragging ? "grabbing" : "grab",
          opacity: isImproving ? 0.5 : 1,
          pointerEvents: isImproving ? "none" : undefined,
          userSelect: "none",
        }
      : {
          position: "absolute",
          left: position.left,
          top: position.top,
          zIndex: 10,
          cursor: isDragging ? "grabbing" : "grab",
          opacity: isImproving ? 0.5 : 1,
          pointerEvents: isImproving ? "none" : undefined,
          userSelect: "none",
        };

  return (
    <div
      ref={wrapperRef}
      className="inline-flex"
      aria-disabled={isImproving}
      style={wrapperStyle}
      onMouseDown={startPotentialDrag}
    >
      <motion.div
        ref={pillRef}
        initial={false}
        onMouseLeave={() => setExpanded(false)}
        className="select-none inline-flex items-center overflow-hidden"
        style={{
          height: 34,
          padding: 4,
          borderRadius: 10,
          background: "var(--overlay-dark-bg-strong)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--overlay-dark-border-strong)",
          boxShadow: "var(--overlay-dark-shadow-pill)",
          color: "var(--overlay-dark-text)",
          transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <button
          type="button"
          onClick={handleMainClick}
          disabled={isImproving}
          aria-label={isImproving ? "Improving..." : "Improve description"}
          className="inline-flex items-center cursor-pointer transition-colors disabled:cursor-not-allowed shrink-0"
          style={{
            padding: "6px 6px",
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            background: "transparent",
            color: "var(--overlay-dark-text)",
          }}
          onMouseEnter={(e) => {
            if (isImproving) return;
            setExpanded(true);
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--overlay-dark-hover-bg)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          <Sparkles
            size={13}
            strokeWidth={2}
            className={
              isImproving
                ? "animate-pulse shrink-0"
                : "animate-[shimmer_2s_ease-in-out_infinite] shrink-0"
            }
          />
          <span
            className={
              "whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] " +
              (expanded
                ? "max-w-[160px] opacity-100 ml-1.5"
                : "max-w-0 opacity-0")
            }
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            {isImproving ? "Improving..." : "Improve description"}
          </span>
        </button>
        <div
          aria-hidden
          style={{
            width: 1,
            height: 18,
            background: "var(--overlay-dark-divider)",
            margin: 0,
            flexShrink: 0,
          }}
        />
        <button
          type="button"
          onClick={handleChevronClick}
          disabled={isImproving}
          aria-label="More AI options"
          aria-expanded={menuOpen}
          className="inline-flex items-center justify-center cursor-pointer transition-colors disabled:cursor-not-allowed shrink-0"
          style={{
            padding: "6px 6px",
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            background: "transparent",
            color: "var(--overlay-dark-text)",
          }}
          onMouseEnter={(e) => {
            if (isImproving) return;
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--overlay-dark-hover-bg)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          <ChevronUp size={13} strokeWidth={2} style={{ opacity: 0.7 }} />
        </button>
      </motion.div>

      {portalHost
        ? createPortal(
            <AnimatePresence>
              {menuOpen && menuTopFromPos ? (
                <motion.div
                  ref={menuRef}
                  key="improve-pill-menu"
                  role="menu"
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="description-editor-portal fixed"
                  style={{
                    zIndex: 2147483701,
                    top: menuTopFromPos.top,
                    left: menuTopFromPos.left,
                    transform: "translateY(-100%)",
                    minWidth: MENU_WIDTH_EST,
                    padding: 4,
                    borderRadius: 10,
                    background: "var(--overlay-dark-bg-strong)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid var(--overlay-dark-border-strong)",
                    boxShadow: "var(--overlay-dark-shadow-menu)",
                    color: "var(--overlay-dark-text)",
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <MenuItem
                    icon={<Wand2 size={13} strokeWidth={2} />}
                    label="Add polish"
                    onClick={() => trigger("polish")}
                  />
                  <Separator />
                  <MenuItem
                    icon={<SpellCheck size={13} strokeWidth={2} />}
                    label="Fix spelling & grammar"
                    onClick={() => trigger("spelling")}
                  />
                  <Separator />
                  <div
                    ref={toneItemRef}
                    className="relative"
                    onMouseEnter={openToneSubmenu}
                    onMouseLeave={() => scheduleSubmenuHide(200)}
                  >
                    <MenuItem
                      icon={<BookType size={13} strokeWidth={2} />}
                      label="Change tone"
                      onFocus={openToneSubmenu}
                      trailing={
                        <span
                          style={{
                            color: "var(--overlay-dark-text-muted)",
                            fontSize: 12,
                            marginLeft: "auto",
                          }}
                        >
                          ›
                        </span>
                      }
                    />
                    {toneHover ? (
                      <div
                        aria-hidden
                        className="absolute"
                        style={{
                          left: "100%",
                          top: 0,
                          width: 12,
                          height: "100%",
                        }}
                        onMouseEnter={cancelSubmenuHide}
                      />
                    ) : null}
                    {toneHover && submenuPos
                      ? createPortal(
                          <div
                            ref={submenuRef}
                            role="menu"
                            className="description-editor-portal fixed"
                            style={{
                              zIndex: 2147483702,
                              top: submenuPos.top,
                              left: submenuPos.left,
                              minWidth: SUBMENU_WIDTH_EST,
                              padding: 4,
                              borderRadius: 10,
                              background: "var(--overlay-dark-bg-strong)",
                              backdropFilter: "blur(12px)",
                              WebkitBackdropFilter: "blur(12px)",
                              border: "1px solid var(--overlay-dark-border-strong)",
                              boxShadow: "var(--overlay-dark-shadow-menu)",
                              color: "var(--overlay-dark-text)",
                            }}
                            onMouseEnter={cancelSubmenuHide}
                            onMouseLeave={() => scheduleSubmenuHide(150)}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <MenuItem
                              icon={<BriefcaseBusiness size={13} strokeWidth={2} />}
                              label="More professional"
                              onClick={() => trigger("tone-professional")}
                            />
                            <MenuItem
                              icon={<Laugh size={13} strokeWidth={2} />}
                              label="More casual"
                              onClick={() => trigger("tone-casual")}
                            />
                          </div>,
                          portalHost,
                        )
                      : null}
                  </div>
                  <Separator />
                  <MenuItem
                    icon={<ArrowUpWideNarrow size={13} strokeWidth={2} />}
                    label="Make shorter"
                    onClick={() => trigger("shorter")}
                  />
                  <MenuItem
                    icon={<ArrowDownNarrowWide size={13} strokeWidth={2} />}
                    label="Make longer"
                    onClick={() => trigger("longer")}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>,
            portalHost,
          )
        : null}
    </div>
  );
}
