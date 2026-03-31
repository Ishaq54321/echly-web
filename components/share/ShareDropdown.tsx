"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Globe } from "lucide-react";

export type ShareDropdownOption = {
  value: string;
  label: string;
  dot?: "viewer" | "resolver";
};

export interface ShareDropdownProps {
  value: string;
  options: ShareDropdownOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  variant: "general" | "role-pill";
  ariaLabel?: string;
  id?: string;
}

export function ShareDropdown({
  value,
  options,
  onSelect,
  disabled = false,
  variant,
  ariaLabel = "Choose option",
  id,
}: ShareDropdownProps) {
  const autoId = useId();
  const listboxId = id ?? autoId;
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  const syncMenuRect = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuRect({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    syncMenuRect();
    const ro = new ResizeObserver(syncMenuRect);
    const t = triggerRef.current;
    if (t) ro.observe(t);
    window.addEventListener("scroll", syncMenuRect, true);
    window.addEventListener("resize", syncMenuRect);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", syncMenuRect, true);
      window.removeEventListener("resize", syncMenuRect);
    };
  }, [open, syncMenuRect]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const n = e.target as Node;
      if (triggerRef.current?.contains(n)) return;
      if (menuRef.current?.contains(n)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  const portal =
    open && menuRect
      ? createPortal(
          <div
            ref={menuRef}
            id={`${listboxId}-menu`}
            className="share-dropdown-menu share-dropdown-menu--portal share-dropdown-menu--animate"
            style={{
              top: menuRect.top,
              left: menuRect.left,
              width:
                variant === "role-pill"
                  ? Math.max(menuRect.width, 168)
                  : menuRect.width,
            }}
            role="listbox"
            aria-labelledby={listboxId}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className="share-dropdown-option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
              >
                {opt.dot ? (
                  <span
                    className={`role-dot role-dot--${opt.dot === "viewer" ? "viewer" : "resolver"}`}
                    aria-hidden
                  />
                ) : null}
                <span>{opt.label}</span>
              </div>
            ))}
          </div>,
          document.body
        )
      : null;

  if (variant === "general") {
    return (
      <div className="share-dropdown w-full">
        <button
          ref={triggerRef}
          type="button"
          id={listboxId}
          className="share-dropdown-trigger dropdown-trigger w-full"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? `${listboxId}-menu` : undefined}
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
        >
          <span className="share-dropdown-trigger-start">
            <span className="share-dropdown-trigger-icon">
              <Globe className="share-general-access-globe" size={16} aria-hidden />
            </span>
            <span className="share-dropdown-trigger-label">{selected?.label}</span>
          </span>
          <ChevronDown
            size={18}
            strokeWidth={2}
            className={`shrink-0 transition-transform duration-150 ease-out${open ? " rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {portal}
      </div>
    );
  }

  const dotClass =
    value === "resolve" ? "role-dot role-dot--resolver" : "role-dot role-dot--viewer";

  return (
    <div className="share-dropdown share-dropdown--role-pill">
      <button
        ref={triggerRef}
        type="button"
        id={listboxId}
        className="role-pill"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? `${listboxId}-menu` : undefined}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className={dotClass} aria-hidden />
        <span className="role-label">{selected?.label}</span>
        <ChevronDown
          strokeWidth={2}
          className={`shrink-0 transition-transform duration-150 ease-out${open ? " rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {portal}
    </div>
  );
}
