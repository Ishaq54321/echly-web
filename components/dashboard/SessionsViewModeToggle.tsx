"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

export function SessionsViewModeToggle({
  value,
  onChange,
}: {
  value: "list" | "grid";
  onChange: (next: "list" | "grid") => void;
}) {
  const isList = value === "list";
  const nextMode = isList ? "grid" : "list";
  const Icon = isList ? LayoutGrid : LayoutList;
  const label = isList ? "Switch to card view" : "Switch to list view";

  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        onClick={() => onChange(nextMode)}
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--border)] bg-white p-2 transition-colors hover:bg-[var(--surface-hover)]"
      >
        <Icon
          size={20}
          strokeWidth={2.1}
          className="[shape-rendering:geometricPrecision]"
          aria-hidden="true"
        />
      </button>
    </Tooltip>
  );
}
