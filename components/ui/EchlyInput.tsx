"use client";

import React from "react";

export type EchlyInputProps = {
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function EchlyInput({ className = "", ...props }: EchlyInputProps) {
  return <input className={`echly-input ${className}`.trim()} {...props} />;
}
