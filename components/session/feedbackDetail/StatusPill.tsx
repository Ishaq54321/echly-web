"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
  { value: "archived", label: "Archived" },
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
    STATUS_OPTIONS.find((o) => o.value === value)?.label ??
    (value === "done" ? "Resolved" : value === "in_progress" ? "In Review" : "Open");
  const statusColorMap: Record<string, string> = {
    resolved: "text-semantic-success",
    done: "text-semantic-success",
    in_review: "text-semantic-attention",
    in_progress: "text-semantic-attention",
    archived: "text-neutral-400",
    open: "text-semantic-system",
  };
  const statusTextClass = statusColorMap[value] ?? "text-semantic-system";

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
        className={`flex items-center gap-2 px-3 py-2 text-[13px] font-medium rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-all duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:ring-offset-1 ${statusTextClass}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {displayLabel}
        <ChevronDown className="h-3.5 w-3.5 opacity-80" />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 min-w-[7.5rem] rounded-lg border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] text-xs py-1 z-10"
          role="listbox"
          aria-label={ariaLabel}
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-neutral-800 transition-all duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:ring-offset-1"
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
