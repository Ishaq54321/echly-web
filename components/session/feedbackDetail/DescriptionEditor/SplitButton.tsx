"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { ToolbarMenu } from "./ToolbarMenu";

interface SplitButtonProps {
  /** Main button content (icon, or icon + label for labelled variant). */
  icon: ReactNode;
  /** Tooltip for the main button. */
  tooltip?: string;
  /** Tooltip for the chevron. */
  chevronTooltip?: string;
  /** Main button click — default action (e.g. toggle bold). */
  onMainClick: () => void;
  /** Whether main button is in active state. */
  isActive?: boolean;
  /** Whether main button is disabled. */
  disabled?: boolean;
  /** Whether chevron button is disabled (defaults to `disabled`). */
  chevronDisabled?: boolean;
  /** Dropdown contents — function receives `close` callback. */
  menu: (close: () => void) => ReactNode;
  /** Min width of the dropdown panel. */
  menuMinWidth?: number;
  /** AI variant — purple accent on both halves. */
  isAi?: boolean;
  /** Render with auto width (for labelled variants) instead of fixed icon width. */
  labelled?: boolean;
}

export function SplitButton({
  icon,
  tooltip,
  chevronTooltip,
  onMainClick,
  isActive,
  disabled,
  chevronDisabled,
  menu,
  menuMinWidth = 220,
  isAi,
  labelled,
}: SplitButtonProps) {
  const sharedBase =
    "h-[30px] inline-flex items-center justify-center " +
    "transition-colors duration-[120ms] cursor-pointer " +
    "disabled:opacity-40 disabled:cursor-not-allowed";

  const mainSizing = labelled
    ? "pl-[16px] pr-[10px] gap-1.5"
    : "pl-[14px] pr-[10px]";
  const mainBase = `${sharedBase} ${mainSizing} rounded-l-md`;

  const aiTone =
    "text-[var(--brand)] hover:bg-[var(--brand-subtle)] hover:text-[var(--brand)] active:bg-[var(--brand-muted)]";
  const standardActiveTone =
    "bg-[var(--surface-active)] text-[var(--text-heading)]";
  const standardTone =
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)]";

  const mainTone = isAi
    ? aiTone
    : isActive
      ? standardActiveTone
      : standardTone;

  const chevTone = isAi ? aiTone : standardTone;
  const chevBase = `${sharedBase} w-[26px] rounded-r-md ${chevTone}`;

  // Subtle divider between the two halves — uses brand tint in AI mode.
  const divider = (
    <div
      aria-hidden
      className={`self-stretch w-px my-[5px] ${
        isAi ? "bg-[var(--brand)]/20" : "bg-[var(--border)]"
      }`}
    />
  );

  const main = (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onMainClick();
      }}
      onMouseDown={(e) => e.preventDefault()}
      className={`${mainBase} ${mainTone} text-[13px] font-medium`}
      aria-pressed={isActive}
    >
      {icon}
    </button>
  );

  const mainWithTooltip = tooltip ? (
    <Tooltip content={tooltip} delay={400}>
      {main}
    </Tooltip>
  ) : (
    main
  );

  const isChevronDisabled = chevronDisabled ?? disabled;
  const chevronButton = (
    <button
      type="button"
      disabled={isChevronDisabled}
      onMouseDown={(e) => e.preventDefault()}
      className={chevBase}
      aria-label={chevronTooltip ?? "More options"}
    >
      <ChevronDown size={12} strokeWidth={2} />
    </button>
  );

  const chevronWithTooltip = chevronTooltip ? (
    <Tooltip content={chevronTooltip} delay={400}>
      {chevronButton}
    </Tooltip>
  ) : (
    chevronButton
  );

  return (
    <div className="inline-flex items-center">
      {mainWithTooltip}
      {divider}
      <ToolbarMenu
        align="start"
        minWidth={menuMinWidth}
        trigger={chevronWithTooltip}
      >
        {(close) => menu(close)}
      </ToolbarMenu>
    </div>
  );
}
