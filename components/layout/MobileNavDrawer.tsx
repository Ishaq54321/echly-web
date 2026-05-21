"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import GlobalRailContent from "./GlobalRailContent";

export interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CLOSE_ANIMATION_MS = 250;

export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const [mounted, setMounted] = useState(false);
  // shouldRender stays true while the drawer is open OR animating closed, so
  // we can keep it in the tree long enough to play the slide-out animation.
  // When this is false, GlobalRailContent is unmounted and its hooks don't run.
  const [shouldRender, setShouldRender] = useState(false);
  // visible lags shouldRender by one frame on open so the initial mount paints
  // with the closed transform, then transitions to the open transform. Without
  // this delay, the open transform would be applied on first paint and the
  // slide-in animation would not play.
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Drive shouldRender from open: mount immediately on open; delay unmount
  // by CLOSE_ANIMATION_MS so the slide-out animation can play.
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      return;
    }
    if (!shouldRender) return;
    const t = window.setTimeout(() => setShouldRender(false), CLOSE_ANIMATION_MS);
    return () => window.clearTimeout(t);
  }, [open, shouldRender]);

  // Drive visible from open after shouldRender flips true, so the first paint
  // is with the closed transform and the second paint plays the slide-in.
  useEffect(() => {
    if (!shouldRender) {
      setVisible(false);
      return;
    }
    if (open) {
      const raf = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(raf);
    }
    setVisible(false);
  }, [open, shouldRender]);

  // Auto-close on route change.
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ESC to close + body scroll lock + focus management.
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = (document.activeElement as HTMLElement) ?? null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    // Focus first focusable element in the panel.
    const focusTimer = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;
  if (!shouldRender) return null;

  const drawer = (
    <div
      className="md:hidden fixed inset-0 z-50"
      aria-hidden={!open}
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="absolute left-0 top-0 h-full w-[288px] max-w-[85vw] bg-[var(--surface)] shadow-xl flex flex-col"
        style={{
          transform: visible ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <GlobalRailContent variant="drawer" onItemClick={onClose} />
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}
