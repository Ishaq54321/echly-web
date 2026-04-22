"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";

export type ResolveToastState = "saving" | "saved" | "error" | "hidden";

export function ResolveToast({
  state,
  onDismiss,
}: {
  state: ResolveToastState;
  onDismiss: () => void;
}) {
  const [rendered, setRendered] = useState(state !== "hidden");
  const [exiting, setExiting] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state !== "hidden") {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      setExiting(false);
      setRendered(true);
    }
  }, [state]);

  useEffect(() => {
    if (state === "saved" || state === "error") {
      const delay = state === "saved" ? 1800 : 3000;
      dismissTimerRef.current = setTimeout(() => {
        setExiting(true);
        exitTimerRef.current = setTimeout(() => {
          setRendered(false);
          onDismiss();
        }, 140);
      }, delay);
      return () => {
        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      };
    }
  }, [state, onDismiss]);

  if (!rendered) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={
          exiting
            ? {
                opacity: 0,
                transform: "translateY(8px)",
                transition: "opacity 140ms ease-in, transform 140ms ease-in",
              }
            : {
                animation: "resolveToastIn 180ms ease-out forwards",
              }
        }
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 18px",
            background: "#111111",
            color: state === "saving" ? "rgba(255,255,255,0.85)" : "#FFFFFF",
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 500,
            whiteSpace: "nowrap",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)",
          }}
        >
          {state === "saving" && (
            <Loader2
              size={14}
              className="animate-spin"
              color="rgba(255,255,255,0.7)"
            />
          )}
          {state === "saved" && <Check size={14} color="#4ADE80" />}
          {state === "error" && <AlertCircle size={14} color="#F87171" />}
          <span>
            {state === "saving"
              ? "Saving..."
              : state === "saved"
                ? "Resolved"
                : "Failed to resolve"}
          </span>
        </div>
      </div>
    </div>
  );
}
