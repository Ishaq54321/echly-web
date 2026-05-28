"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface TabsItem {
  id: string;
  label: string;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabsItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  size?: "sm" | "md";
  variant?: "underline" | "pill";
  className?: string;
  ariaLabel?: string;
}

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function isBadgeVisible(value: TabsItem["badge"]): boolean {
  if (value == null) return false;
  if (typeof value === "number") return value > 0;
  return value.trim().length > 0;
}

export function Tabs({
  tabs,
  activeTabId,
  onChange,
  size = "md",
  variant = "underline",
  className = "",
  ariaLabel,
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const list = listRef.current;
    const btn = buttonRefs.current[activeTabId];
    if (!list || !btn) {
      setIndicator(null);
      return;
    }
    const listRect = list.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicator({ left: btnRect.left - listRect.left, width: btnRect.width });
  }, [activeTabId]);

  useLayoutEffect(() => {
    measure();
  }, [measure, tabs.length]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !listRef.current) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const focusableIds = tabs.filter((t) => !t.disabled).map((t) => t.id);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (focusableIds.length === 0) return;
      const idx = focusableIds.indexOf(activeTabId);
      let nextId: string | null = null;
      if (e.key === "ArrowRight") {
        nextId = focusableIds[(idx + 1) % focusableIds.length] ?? null;
      } else if (e.key === "ArrowLeft") {
        nextId = focusableIds[(idx - 1 + focusableIds.length) % focusableIds.length] ?? null;
      } else if (e.key === "Home") {
        nextId = focusableIds[0] ?? null;
      } else if (e.key === "End") {
        nextId = focusableIds[focusableIds.length - 1] ?? null;
      }
      if (nextId && nextId !== activeTabId) {
        e.preventDefault();
        onChange(nextId);
        requestAnimationFrame(() => buttonRefs.current[nextId!]?.focus());
      }
    },
    [activeTabId, focusableIds, onChange]
  );

  const isUnderline = variant === "underline";
  const heightClass = size === "sm" ? "h-[28px]" : "h-[34px]";
  const padX = size === "sm" ? "px-2.5" : "px-3";
  const textSize = size === "sm" ? "text-[12px]" : "text-[13px]";

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={`relative inline-flex items-center ${
        isUnderline ? "gap-1 border-b border-[var(--border-subtle)]" : "gap-1.5"
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const showBadge = isBadgeVisible(tab.badge);
        const base = `relative inline-flex items-center gap-1.5 ${heightClass} ${padX} ${textSize} font-medium transition-colors duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)] rounded-[6px]`;

        const underlineColors = isActive
          ? "text-[var(--text-heading)]"
          : tab.disabled
          ? "text-[var(--text-placeholder)] cursor-not-allowed"
          : "text-[var(--text-tertiary)] hover:text-[var(--text-heading)] cursor-pointer";

        const pillColors = isActive
          ? "text-[var(--text-heading)] bg-[var(--surface-hover)] border border-[var(--border)]"
          : tab.disabled
          ? "text-[var(--text-placeholder)] cursor-not-allowed border border-transparent"
          : "text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-hover)] border border-transparent cursor-pointer";

        return (
          <button
            key={tab.id}
            ref={(el) => {
              buttonRefs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled || undefined}
            tabIndex={tab.disabled ? -1 : isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => {
              if (tab.disabled || isActive) return;
              onChange(tab.id);
            }}
            className={`${base} ${isUnderline ? underlineColors : pillColors}`}
          >
            <span>{tab.label}</span>
            {showBadge ? (
              <span
                className={`inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[10.5px] font-semibold tabular-nums tracking-[-0.005em] transition-colors duration-150 ${
                  isActive
                    ? "bg-[var(--surface-hover)] text-[var(--text-secondary)]"
                    : "text-[var(--text-tertiary)]"
                }`}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}

      {isUnderline && indicator ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-px h-[2px] rounded-full bg-[var(--text-heading)]"
          style={{
            left: indicator.left,
            width: indicator.width,
            transition: `left 280ms ${SPRING}, width 280ms ${SPRING}`,
          }}
        />
      ) : null}
    </div>
  );
}

export default Tabs;
