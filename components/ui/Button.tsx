"use client";

import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const baseClass =
  "inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/20 focus-visible:outline-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "h-11 md:h-[38px] px-4 rounded-[var(--radius-btn)] border-none bg-[var(--text-heading)] text-white text-[14px] hover:opacity-85",
  secondary:
    "h-11 md:h-[38px] px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]",
  ghost:
    "h-11 md:h-[38px] px-4 rounded-[var(--radius-btn)] bg-transparent text-[var(--text-secondary)] text-[14px] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)]",
  danger:
    "h-11 md:h-[38px] px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/30 hover:bg-[var(--color-danger-bg)]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${baseClass} ${variantClasses[variant]} ${className}`.trim()}
        {...props}
        disabled={disabled}
      />
    );
  }
);
Button.displayName = "Button";
