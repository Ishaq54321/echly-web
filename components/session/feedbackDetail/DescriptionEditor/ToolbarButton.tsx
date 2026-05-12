"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Tooltip } from "@/components/ui/Tooltip";

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string;
  isActive?: boolean;
  isAi?: boolean;
  icon?: boolean;
  children: ReactNode;
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(
    { tooltip, isActive, isAi, icon, className = "", children, ...rest },
    ref,
  ) {
    const base =
      "h-[30px] inline-flex items-center justify-center gap-1 rounded-md " +
      "font-medium text-[13px] font-inherit transition-colors duration-[120ms] " +
      "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent " +
      "outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 cursor-pointer";
    const sizing = icon ? "w-[30px] p-0" : "px-2";
    const tone = isAi
      ? "text-[var(--brand)] hover:bg-[var(--brand-subtle)] hover:text-[var(--brand)] active:bg-[var(--brand-muted)]"
      : isActive
        ? "bg-[var(--surface-active)] text-[var(--text-heading)] hover:bg-[var(--surface-active)]"
        : "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] active:bg-[var(--surface-subtle)]";

    const btn = (
      <button
        ref={ref}
        type="button"
        className={`${base} ${sizing} ${tone} ${className}`}
        {...rest}
      >
        {children}
      </button>
    );

    if (!tooltip) return btn;
    return (
      <Tooltip content={tooltip} delay={400}>
        {btn}
      </Tooltip>
    );
  },
);
