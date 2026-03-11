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
      type="button"
      onClick={() => onChange(!isResolved)}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-1.5 text-[14px] transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-success/40",
        isResolved
          ? "border-semantic-success bg-semantic-success/10 text-semantic-success hover:bg-semantic-success/15"
          : "border-neutral-300 text-secondary hover:border-neutral-400 hover:bg-neutral-50"
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
