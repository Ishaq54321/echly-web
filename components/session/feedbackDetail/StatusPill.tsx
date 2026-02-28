"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
] as const;

interface StatusPillProps {
  value?: string;
  defaultValue?: string;
  "aria-label"?: string;
}

export function StatusPill({
  value: controlledValue,
  defaultValue = "open",
  "aria-label": ariaLabel = "Status",
}: StatusPillProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const ref = useRef<HTMLDivElement>(null);

  const value = controlledValue ?? internalValue;
  const displayLabel =
    STATUS_OPTIONS.find((o) => o.value === value)?.label ?? "Open";

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const handleSelect = (optionValue: string) => {
    if (controlledValue === undefined) setInternalValue(optionValue);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] hover:bg-[hsl(var(--surface-2))] transition text-[hsl(var(--text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.3)]"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {displayLabel}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 min-w-[7.5rem] rounded-md border border-[hsl(var(--border))] bg-white shadow-sm text-xs py-1 z-10"
          role="listbox"
          aria-label={ariaLabel}
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              className="w-full text-left px-3 py-1.5 hover:bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))]"
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
