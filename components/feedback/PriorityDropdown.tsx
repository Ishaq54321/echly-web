"use client";

import { useState, useEffect, useRef } from "react";
import { Flag, Ban } from "lucide-react";
import type { Priority } from "@/lib/domain/feedback";

interface PriorityConfig {
  value: Priority;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}

const PRIORITIES: PriorityConfig[] = [
  {
    value: "high",
    label: "High",
    color: "var(--color-danger)",
    bg: "var(--color-danger-bg)",
    border: "var(--color-danger-border)",
    icon: <Flag size={14} style={{ fill: "var(--color-danger)", color: "var(--color-danger)" }} />,
  },
  {
    value: "medium",
    label: "Medium",
    color: "var(--color-warning)",
    bg: "var(--color-warning-bg)",
    border: "var(--color-warning-border)",
    icon: <Flag size={14} style={{ fill: "var(--color-warning)", color: "var(--color-warning)" }} />,
  },
  {
    value: "low",
    label: "Low",
    color: "var(--text-secondary)",
    bg: "var(--surface-subtle)",
    border: "var(--border)",
    icon: <Flag size={14} style={{ fill: "var(--text-body)", color: "var(--text-body)" }} />,
  },
];

interface PriorityDropdownProps {
  feedbackId: string;
  currentPriority: Priority | null;
  /**
   * Owns the server PATCH + optimistic state. May be async; when it is, the
   * dropdown awaits it. Read-only call sites pass a no-op.
   */
  onPriorityChanged: (priority: Priority | null) => void | Promise<void>;
  disabled?: boolean;
  readOnly?: boolean;
  iconOnly?: boolean;
  /** Page-level in-flight lock — survives this dropdown's remount. */
  busy?: boolean;
}

export function PriorityDropdown({
  feedbackId: _feedbackId,
  currentPriority,
  onPriorityChanged,
  disabled = false,
  readOnly = false,
  iconOnly = false,
  busy = false,
}: PriorityDropdownProps) {
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePriority = PRIORITIES.find((p) => p.value === currentPriority) ?? null;

  useEffect(() => {
    if (open) {
      const t = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(t);
    }
    const t = requestAnimationFrame(() => setAnimate(false));
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // The page handler (onPriorityChanged) now owns the server PATCH,
  // generation guard, in-flight lock, rollback and error toast. The
  // dropdown just closes and delegates — no second PATCH from here.
  //
  // Phase 28.X — `busy` is kept as a logical double-submit guard (silently
  // ignore a selection while a PATCH is in flight) but is no longer a
  // visual disabled/dimmed state: the optimistic value already shows, so
  // the control should look settled.
  const handleSelect = async (priority: Priority | null) => {
    setOpen(false);
    if (busy) return;
    await onPriorityChanged(priority);
  };

  // READ-ONLY MODE
  if (readOnly) {
    if (currentPriority) {
      const activePriorityRO = PRIORITIES.find(p => p.value === currentPriority);
      if (!activePriorityRO) return null;
      if (iconOnly) {
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              color: activePriorityRO.color,
              cursor: 'default',
              flexShrink: 0,
            }}>
            <Flag size={16} strokeWidth={1.8} style={{ flexShrink: 0, fill: 'currentColor' }} />
          </div>
        );
      }
      return (
        <div className="inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[13px] font-medium" style={{ cursor: 'default', flexShrink: 0 }}>
          {activePriorityRO.icon}
          {activePriorityRO.label}
        </div>
      );
    }
    return null;
  }

  // `busy` is intentionally NOT part of the visual state (Phase 28.X) — only
  // the explicit `disabled` prop dims/locks the control. The in-flight lock
  // is enforced logically in handleSelect instead.
  const baseCls = `inline-flex h-[34px] items-center gap-2 px-3.5 rounded-[7px] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[13px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className={baseCls}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        {activePriority ? (
          <>
            <Flag size={14} strokeWidth={1.7} style={{ flexShrink: 0, fill: activePriority.color, color: activePriority.color }} />
            {activePriority.label}
          </>
        ) : (
          <>
            <Flag size={14} strokeWidth={1.7} style={{ flexShrink: 0 }} aria-hidden />
            Priority
          </>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 50,
            background: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow-lg)",
            width: 180,
            overflow: "hidden",
            opacity: animate ? 1 : 0,
            transform: animate ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity 160ms ease, transform 160ms ease",
          }}
        >
          <div
            style={{
              padding: "10px 12px 6px",
              fontSize: 12,
              fontWeight: '600',
              color: "var(--text-tertiary)",
              letterSpacing: "0.6px",
              textTransform: "uppercase",
            }}
          >
            Priority
          </div>

          {PRIORITIES.map((p) => {
            const isSelected = p.value === currentPriority;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => void handleSelect(p.value)}
                style={{
                  width: "calc(100% - 8px)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                  border: "none",
                  background: isSelected ? p.bg : "transparent",
                  borderRadius: 8,
                  margin: "0 4px",
                  fontSize: 14,
                  fontWeight: '500',
                  color: p.color,
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <span style={{ display: "flex", alignItems: "center", flexShrink: 0, color: p.color }}>{p.icon}</span>
                {p.label}
              </button>
            );
          })}

          {currentPriority !== null && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "4px 8px" }} />
              <button
                type="button"
                onClick={() => void handleSelect(null)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  textAlign: "left",
                  marginBottom: 4,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-hover)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <Ban size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                Clear priority
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
