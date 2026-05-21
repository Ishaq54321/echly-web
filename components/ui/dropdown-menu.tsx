"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { PORTAL_DROPDOWN_Z_INDEX } from "@/lib/ui/zIndex";

type DropdownCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  align: "start" | "end";
};

const Ctx = createContext<DropdownCtx | null>(null);

function useCtx() {
  const c = useContext(Ctx);
  if (!c) throw new Error("DropdownMenu context missing");
  return c;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  return (
    <Ctx.Provider value={{ open, setOpen, triggerRef, align: "end" }}>
      <div className="relative inline-block">{children}</div>
    </Ctx.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  const { open, setOpen, triggerRef } = useCtx();
  if (asChild) {
    return (
      <span
        onClick={() => setOpen(!open)}
        ref={(el) => {
          if (triggerRef && el) {
            (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current =
              el.querySelector("button") ?? (el as unknown as HTMLButtonElement);
          }
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <button ref={triggerRef} type="button" onClick={() => setOpen(!open)}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  align = "end",
  className = "",
}: {
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const { open, setOpen, triggerRef } = useCtx();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<{ top: number; left: number; minWidth: number; clientWidth: number; maxWidth: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dropdownHeight = 120;
    const viewportHeight = window.innerHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const margin = 8;
    const fitsBelow = r.bottom + 4 + dropdownHeight <= viewportHeight;

    // Clamp top to viewport
    let top = fitsBelow ? r.bottom + 4 : r.top - 4 - dropdownHeight;
    if (top < margin) top = margin;
    if (top + dropdownHeight > viewportHeight - margin) {
      top = Math.max(margin, viewportHeight - dropdownHeight - margin);
    }

    setRect({
      top,
      left: align === "end" ? r.right : r.left,
      minWidth: r.width,
      clientWidth: viewportWidth,
      maxWidth: viewportWidth - margin * 2,
    });
  }, [open, triggerRef, align]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const n = e.target as Node;
      if (triggerRef.current?.contains(n)) return;
      if (menuRef.current?.contains(n)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen, triggerRef]);

  if (!open || !rect) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`fixed rounded-lg border border-[var(--border)] bg-[var(--surface-page)] shadow-md py-1 ${className}`}
      style={{
        zIndex: PORTAL_DROPDOWN_Z_INDEX,
        top: rect.top,
        ...(align === "end"
          ? { right: `max(8px, calc(${rect.clientWidth}px - ${rect.left}px))` }
          : { left: Math.max(8, Math.min(rect.left, rect.clientWidth - rect.minWidth - 8)) }),
        minWidth: rect.minWidth,
        maxWidth: rect.maxWidth,
        backgroundColor: 'var(--color-background)',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const { setOpen } = useCtx();
  return (
    <div
      className={`px-3 py-1.5 text-[14px] cursor-pointer hover:bg-[var(--surface-hover)]/50 transition-colors text-[var(--text-heading)] ${className}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </div>
  );
}
