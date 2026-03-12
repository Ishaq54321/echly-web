"use client";

import React from "react";

const inputClass =
  "w-full bg-white border border-[#E3E6E5] rounded-full py-2.5 px-4 text-body text-[#111111] placeholder:text-[#111111] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#D1D5DB] focus:shadow-[0_0_0_3px_rgba(209,213,219,0.4)] disabled:opacity-60 disabled:cursor-not-allowed";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`${inputClass} ${className}`.trim()}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
