"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { SessionsTimeRange } from "@/lib/utils/sessionTimeRange";

const OPTIONS: { id: SessionsTimeRange; label: string }[] = [
  { id: "month", label: "This Month" },
  { id: "3m", label: "Last 3 Months" },
  { id: "6m", label: "Last 6 Months" },
  { id: "year", label: "Last Year" },
  { id: "all", label: "All Time" },
];

export type { SessionsTimeRange };

export function SessionsTimeRangeFilter({
  value,
  onChange,
}: {
  value: SessionsTimeRange;
  onChange: (next: SessionsTimeRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const label = OPTIONS.find((o) => o.id === value)?.label ?? "All Time";

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-gray-50"
      >
        <span>{label}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <ul
          className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-neutral-200 bg-white py-1 shadow-md"
          role="listbox"
        >
          {OPTIONS.map((o) => (
            <li key={o.id} role="option" aria-selected={value === o.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
