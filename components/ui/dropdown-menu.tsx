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
  const [rect, setRect] = useState<{ top: number; left: number; minWidth: number; clientWidth: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dropdownHeight = 120;
    const viewportHeight = window.innerHeight;
    const fitsBelow = r.bottom + 4 + dropdownHeight <= viewportHeight;

    setRect({
      top: fitsBelow ? r.bottom + 4 : r.top - 4 - dropdownHeight,
      left: align === "end" ? r.right : r.left,
      minWidth: r.width,
      clientWidth: document.documentElement.clientWidth,
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
      className={`fixed rounded-lg border border-border bg-background shadow-md py-1 ${className}`}
      style={{
        zIndex: PORTAL_DROPDOWN_Z_INDEX,
        top: rect.top,
        ...(align === "end"
          ? { right: `calc(${rect.clientWidth}px - ${rect.left}px)` }
          : { left: rect.left }),
        minWidth: rect.minWidth,
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
      className={`px-3 py-1.5 text-[13px] cursor-pointer hover:bg-muted/50 transition-colors text-foreground ${className}`}
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
