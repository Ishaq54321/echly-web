"use client";

import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

const baseClass =
  "cursor-pointer transition-colors duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1";

const variantHover: Record<ButtonVariant, string> = {
  primary: "hover:opacity-90",
  secondary: "hover:bg-neutral-100",
  danger: "hover:bg-semantic-danger/10",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => {
    const variantClass = variantHover[variant];
    return (
      <button
        ref={ref}
        className={`${baseClass} ${variantClass} ${className}`.trim()}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
