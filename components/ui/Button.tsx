"use client";

import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "pill";

const baseClass =
  "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 transition-[transform,background-color,border-color,color] duration-200 rounded-full font-medium inline-flex items-center justify-center";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "primary-cta py-2.5 px-[18px]",
  secondary:
    "bg-[#DDF3C8] text-[#111111] py-2.5 px-[18px] hover:bg-[#cceeb8] active:bg-[#bce9a8]",
  ghost:
    "bg-transparent text-[#111111] hover:bg-[#E9ECEB] hover:text-[#111111]",
  danger:
    "bg-[#DC2626] text-white py-2.5 px-[18px] hover:opacity-95 active:opacity-90",
  pill:
    "bg-[#DDF3C8] text-[#111111] font-medium py-2 px-4 hover:bg-[#cceeb8]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${baseClass} ${variantClasses[variant]} ${className}`.trim()}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
