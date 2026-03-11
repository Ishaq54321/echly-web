"use client";

import { forwardRef } from "react";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex shrink-0 items-center rounded-[999px]
          h-[22px] w-[40px] transition-all duration-150 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]/30 focus-visible:ring-offset-2
          disabled:opacity-50
          ${checked ? "bg-[#2563EB]" : "bg-neutral-200"}
          ${className}
        `.trim()}
        {...props}
      >
        <span
          className={`
            pointer-events-none inline-block h-[18px] w-[18px] rounded-[50%]
            transition-[transform,background-color,box-shadow] duration-150 ease-in-out
            ${checked ? "translate-x-[21px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)]" : "translate-x-0.5 bg-neutral-600"}
          `}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";
