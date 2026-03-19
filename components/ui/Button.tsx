"use client";

import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const baseClass =
  "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:ring-offset-2 transition-[transform,box-shadow,background-color,border-color,color] duration-[var(--motion-standard)] [transition-timing-function:var(--ease-premium)] rounded-xl font-medium";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "btn-primary-glow bg-[var(--color-primary)] text-white shadow-[0_2px_8px_rgba(26,86,219,0.28)] hover:bg-[var(--color-primary-hover)] active:scale-[0.98]",
  secondary:
    "bg-[var(--layer-1-bg)] border border-[var(--layer-2-border)] text-[hsl(var(--text-primary-strong))] shadow-[0_1px_0_rgba(255,255,255,0.5)_inset] hover:bg-[var(--layer-2-hover-bg)] hover:border-[var(--layer-2-border)] hover:-translate-y-px active:translate-y-0",
  ghost:
    "bg-transparent text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))]",
  danger:
    "bg-[var(--color-danger)] text-white shadow-[0_2px_8px_rgba(185,28,28,0.25)] hover:opacity-95 active:scale-[0.998]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      className = "",
      disabled,
      onMouseDown: onMouseDownProp,
      onMouseUp: onMouseUpProp,
      onMouseLeave: onMouseLeaveProp,
      ...props
    },
    ref
  ) => {
    const isPrimary = variant === "primary";

    const handlePressDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseDownProp?.(e);
      if (!isPrimary || disabled) return;

      const el = e.currentTarget;
      // Instant tactile press feedback (80ms transform only).
      el.style.transition = "transform 80ms ease";
      el.style.transform = "scale(0.97)";
    };

    const handlePressUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseUpProp?.(e);
      if (!isPrimary || disabled) return;

      const el = e.currentTarget;
      el.style.transition = "transform 80ms ease";
      el.style.transform = "scale(1)";

      // Restore class-driven transforms on the next frame.
      requestAnimationFrame(() => {
        el.style.transition = "";
        el.style.transform = "";
      });
    };

    const handlePressCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeaveProp?.(e);
      if (!isPrimary || disabled) return;

      const el = e.currentTarget;
      el.style.transition = "";
      el.style.transform = "";
    };

    return (
      <button
        ref={ref}
        className={`${baseClass} ${variantClasses[variant]} ${className}`.trim()}
        onMouseDown={handlePressDown}
        onMouseUp={handlePressUp}
        onMouseLeave={handlePressCancel}
        {...props}
        disabled={disabled}
      />
    );
  }
);
Button.displayName = "Button";
