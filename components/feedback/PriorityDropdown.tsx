"use client";

import { useState, useEffect, useRef } from "react";
import { Flag, ArrowUp, ArrowDown, Minus, X, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import type { Priority } from "@/lib/domain/feedback";
import { useToast } from "@/components/dashboard/context/ToastContext";

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
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: <ArrowUp size={14} />,
  },
  {
    value: "medium",
    label: "Medium",
    color: "#C2410C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    icon: <Minus size={14} />,
  },
  {
    value: "low",
    label: "Low",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    icon: <ArrowDown size={14} />,
  },
];

interface PriorityDropdownProps {
  feedbackId: string;
  currentPriority: Priority | null;
  onPriorityChanged: (priority: Priority | null) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function PriorityDropdown({
  feedbackId,
  currentPriority,
  onPriorityChanged,
  disabled = false,
  readOnly = false,
}: PriorityDropdownProps) {
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

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

  const handleSelect = async (priority: Priority | null) => {
    const prev = currentPriority;
    setOpen(false);
    onPriorityChanged(priority);
    setIsSaving(true);
    try {
      const res = await authFetch(`/api/tickets/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      if (!res?.ok) {
        onPriorityChanged(prev);
        showToast("Failed to set priority");
      } else {
        const body = await res.json() as { data?: { ticket?: { priority?: Priority | null } } };
        const serverPriority = body.data?.ticket?.priority ?? null;
        if (serverPriority !== priority) {
          onPriorityChanged(serverPriority);
        }
      }
    } catch {
      onPriorityChanged(prev);
      showToast("Failed to set priority");
    } finally {
      setIsSaving(false);
    }
  };

  // READ-ONLY MODE
  if (readOnly) {
    if (currentPriority) {
      const activePriorityRO = PRIORITIES.find(p => p.value === currentPriority);
      if (!activePriorityRO) return null;
      return (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          height: '34px',
          padding: '0 10px',
          background: activePriorityRO.bg,
          border: `1.5px solid ${activePriorityRO.border}`,
          borderRadius: '9px',
          fontSize: '13px',
          fontWeight: '500',
          color: activePriorityRO.color,
          cursor: 'default',
          flexShrink: 0,
        }}>
          {activePriorityRO.icon}
          {activePriorityRO.label} Priority
        </div>
      );
    }
    return null;
  }

  const activeStyle: React.CSSProperties = activePriority
    ? {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 34,
        padding: "0 10px",
        background: activePriority.bg,
        border: `1.5px solid ${activePriority.border}`,
        borderRadius: 9,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontSize: 13,
        fontWeight: 500,
        color: activePriority.color,
      }
    : {};

  const noPriorityCls = `inline-flex h-9 items-center gap-1.5 px-3.5 rounded-[9px] text-[13px] font-medium border border-[#E7ECF2] bg-[#FAFBFC] text-[#374151] hover:bg-[#F1F4F8] hover:border-[#DCE4EE] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 transition-all duration-150 ease ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        style={activePriority ? activeStyle : undefined}
        className={!activePriority ? noPriorityCls : undefined}
        disabled={disabled || isSaving}
        onClick={() => !disabled && !isSaving && setOpen((o) => !o)}
      >
        {activePriority ? (
          <>
            <span style={{ color: activePriority.color, display: "flex", alignItems: "center", flexShrink: 0 }}>
              {isSaving
                ? <Loader2 size={14} className="animate-spin" aria-hidden />
                : activePriority.icon
              }
            </span>
            {activePriority.label} Priority
          </>
        ) : (
          <>
            {isSaving
              ? <Loader2 size={16} className="animate-spin" aria-hidden />
              : <Flag size={16} style={{ flexShrink: 0 }} />
            }
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
            background: "white",
            border: "1px solid #E8E8E8",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
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
              fontSize: 11,
              fontWeight: 600,
              color: "#AAAAAA",
              letterSpacing: "0.6px",
              textTransform: "uppercase",
            }}
          >
            Set Priority
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
                  fontSize: 13,
                  fontWeight: 500,
                  color: p.color,
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "#F7F8FA";
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
              <div style={{ height: 1, background: "#F0F0F0", margin: "4px 8px" }} />
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
                  fontSize: 13,
                  color: "#888888",
                  textAlign: "left",
                  marginBottom: 4,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F7F8FA"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <X size={13} color="#888888" style={{ flexShrink: 0 }} />
                Clear priority
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
