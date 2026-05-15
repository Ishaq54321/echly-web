"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePortalHost } from "./PortalHost";

interface ToolbarMenuProps {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  /** Min width of the dropdown panel. Default 200px. */
  minWidth?: number;
}

/**
 * Toolbar-styled popover menu. The trigger is rendered inline; the panel is
 * portalled to body with manual positioning. Suitable for toolbar buttons
 * where we want fine control over alignment and width independent of the
 * trigger's width.
 */
export function ToolbarMenu({
  trigger,
  children,
  align = "start",
  minWidth = 200,
}: ToolbarMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const portalHost = usePortalHost();

  useLayoutEffect(() => {
    if (!open) return;
    const trig = wrapRef.current?.firstElementChild as HTMLElement | null;
    if (!trig) return;
    const r = trig.getBoundingClientRect();
    const top = r.bottom + 4;
    const left = align === "end" ? r.right : r.left;
    setPos({ top, left });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const n = e.target as Node;
      if (wrapRef.current?.contains(n)) return;
      if (menuRef.current?.contains(n)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <span
        ref={wrapRef}
        className="inline-flex"
        onClickCapture={(e) => {
          // Toggle on bubble-down click of the trigger element.
          if (e.defaultPrevented) return;
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {trigger}
      </span>
      {open && pos && typeof document !== "undefined" && portalHost
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              className="description-editor-portal fixed rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-1"
              style={{
                zIndex: 2147483700,
                top: pos.top,
                ...(align === "end"
                  ? { right: document.documentElement.clientWidth - pos.left }
                  : { left: pos.left }),
                minWidth,
                boxShadow: "var(--shadow-panel)",
              }}
              /* Inside the extension's shadow DOM, the document-level
                 mousedown handler above sees `e.target` retargeted to the
                 shadow host — so `menuRef.contains(target)` is false and
                 the outside-click logic closes the menu before the swatch
                 click can fire. Stopping mousedown here keeps the event
                 from ever reaching that handler. */
              onMouseDown={(e) => e.stopPropagation()}
            >
              {children(close)}
            </div>,
            portalHost,
          )
        : null}
    </>
  );
}

export function ToolbarMenuItem({
  onClick,
  isActive,
  shortcut,
  children,
  className = "",
}: {
  onClick?: () => void;
  isActive?: boolean;
  shortcut?: string;
  children: ReactNode;
  className?: string;
}) {
  const activeCls = isActive
    ? "bg-[var(--brand-subtle)] text-[var(--brand-text)]"
    : "text-[var(--text-heading)] hover:bg-[var(--surface-hover)]";
  return (
    <button
      type="button"
      role="menuitem"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-2 py-[7px] rounded-[5px] text-left text-[13px] font-normal ${activeCls} ${className}`}
    >
      {children}
      {shortcut ? (
        <span
          className={`ml-auto text-[11px] font-medium px-1.5 py-[2px] rounded-[4px] font-mono ${
            isActive
              ? "bg-[var(--brand-muted)] text-[var(--brand-text)]"
              : "bg-[var(--surface-subtle)] text-[var(--text-tertiary)]"
          }`}
        >
          {shortcut}
        </span>
      ) : null}
    </button>
  );
}

export function ToolbarMenuSeparator() {
  return <div className="h-px bg-[var(--border)] my-1 mx-0" />;
}

export function ToolbarMenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
      {children}
    </div>
  );
}
