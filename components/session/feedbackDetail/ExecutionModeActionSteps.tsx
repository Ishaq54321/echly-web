"use client";

import { formatActionStep } from "@/lib/formatters/formatActionStep";

export interface ExecutionModeActionStepsProps {
  actionSteps: string[];
}

/**
 * Read-and-execute display: numbered steps only.
 * No checkboxes, no toggles, no selection state.
 */
export function ExecutionModeActionSteps({
  actionSteps,
}: ExecutionModeActionStepsProps) {
  const items = Array.isArray(actionSteps)
    ? actionSteps.map((s) => (typeof s === "string" ? s : String(s ?? "")))
    : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="list-none p-0 m-0 space-y-4" role="list">
      {items.map((text, i) => (
        <li
          key={`${i}-${text.slice(0, 20)}`}
          className="flex items-baseline"
        >
          <span className="shrink-0 text-[14px] font-semibold tabular-nums text-[#111111] mr-1.5">
            {i + 1}.
          </span>
          <span className="text-[14px] font-medium leading-[1.6] text-[#111111]">
            {formatActionStep(text)}
          </span>
        </li>
      ))}
    </ul>
  );
}
