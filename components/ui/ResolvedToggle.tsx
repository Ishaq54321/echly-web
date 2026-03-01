"use client";

import { Check } from "lucide-react";

interface ResolvedToggleProps {
  isResolved: boolean;
  onChange: (value: boolean) => void;
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function ResolvedToggle({
  isResolved,
  onChange,
}: ResolvedToggleProps) {
  return (
    <button
      onClick={() => onChange(!isResolved)}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-1.5 text-[14px] transition-all duration-150",
        isResolved
          ? "border-semantic-success bg-semantic-success/10 text-semantic-success"
          : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-sm border transition-all duration-150",
          isResolved
            ? "border-semantic-success bg-semantic-success text-white"
            : "border-neutral-400 bg-white"
        )}
      >
        {isResolved && <Check className="h-3 w-3 stroke-[3]" />}
      </span>

      <span className="font-medium">
        Resolved
      </span>
    </button>
  );
}
