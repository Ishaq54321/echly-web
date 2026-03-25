"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  FILTER_LABELS,
  FILTER_OPTIONS_ORDER,
  type SessionsTimeRange,
} from "@/lib/utils/sessionTimeRange";

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

  const label = FILTER_LABELS[value];

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex max-w-[220px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-gray-50"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <ul
          className="absolute right-0 top-full z-50 mt-1 max-w-[220px] min-w-[180px] rounded-lg border border-neutral-200 bg-white py-1 shadow-md"
          role="listbox"
        >
          {FILTER_OPTIONS_ORDER.map((id) => (
            <li key={id} role="option" aria-selected={value === id}>
              <button
                type="button"
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 ${
                  value === id
                    ? "font-semibold text-neutral-900"
                    : "font-medium text-neutral-700"
                }`}
                onClick={() => {
                  onChange(id);
                  setOpen(false);
                }}
              >
                {FILTER_LABELS[id]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
