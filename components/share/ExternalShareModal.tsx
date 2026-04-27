"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Globe, Info, Link2, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useWorkspace } from "@/lib/client/workspaceContext";

export interface ExternalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionName: string | null;
}

export function ExternalShareModal({
  isOpen,
  onClose,
  sessionName,
}: ExternalShareModalProps) {
  const { authUid } = useWorkspace();
  const isAuthenticated = !!authUid;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const titleId = `ext-share-modal-title-${Math.random().toString(36).slice(2)}`;

  const url = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback: no-op
    }
    setCopied(true);
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2000);
  }, [url]);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const displayName = sessionName?.trim() || "Session";

  return (
    <Modal open={isOpen} onClose={onClose} ariaLabelledBy={titleId}>
      <div
        style={{
          background: "white",
          borderRadius: 20,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.14), 0 4px 14px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
          maxWidth: 440,
          width: "100%",
          padding: 0,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link2 size={15} color="var(--text-tertiary)" aria-hidden />
            <span
              id={titleId}
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-heading)",
                letterSpacing: "-0.1px",
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              background: "none",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-tertiary)",
            }}
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        {/* Copy link section */}
        <div style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <Globe size={14} color="var(--text-tertiary)" aria-hidden />
            <div className="flex items-center gap-1">
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-tertiary)" }}>
                Share link
              </span>
              <div className="relative group">
                <Info className="h-4 w-4 text-[var(--text-secondary)] cursor-default mt-px" />
                <div className="absolute top-full left-0 mt-1.5 hidden group-hover:block z-50 pointer-events-none w-48">
                  <div className="bg-[var(--surface-page)] text-[var(--text-heading)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[12px] leading-snug shadow-md">
                    This link is view-only if the session owner has enabled public viewing.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              readOnly
              value={url}
              style={{
                flex: 1,
                height: 40,
                background: "var(--surface-subtle)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0 12px",
                fontSize: 13,
                color: "var(--text-secondary)",
                fontFamily: "monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "default",
                userSelect: "all",
                outline: "none",
              }}
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={() => void handleCopy()}
              style={{
                height: 40,
                padding: "0 16px",
                background: copied ? "var(--color-success)" : "var(--brand)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: copied
                  ? "0 1px 3px rgba(24,121,78,0.20)"
                  : "0 1px 3px rgba(23,117,224,0.20)",
                transition: "background 0.15s",
              }}
            >
              {copied ? (
                <Check size={14} color="white" aria-hidden />
              ) : (
                <Copy size={14} color="white" aria-hidden />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Info section */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border)",
            width: "100%",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "12px 14px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {isAuthenticated ? (
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-heading)",
                    marginBottom: 2,
                  }}
                >
                  You have shared access to this session
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Only workspace members can control who views or resolves
                  feedback. Reach out to a workspace member to update your
                  permissions.
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-heading)",
                    marginBottom: 2,
                  }}
                >
                  Managed by workspace
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Share settings and access controls are managed by the workspace
                  owner. Contact them to change who can access this session.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
