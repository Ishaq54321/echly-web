"use client";

import * as React from "react";
import { Copy, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Timestamp } from "firebase/firestore";
import type { DevToolsFeedback } from "@/components/session/feedbackDetail/DevToolsPanel";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoActivityIllu } from "@/components/empty/canvasIllustrations";

export interface MetadataTabContentProps {
  feedback: DevToolsFeedback | null | undefined;
}

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function clientTimestampToDate(
  ts: string | Timestamp | number | null | undefined
): Date | null {
  if (ts == null) return null;
  if (typeof ts === "number") {
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof ts === "string") {
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const t = ts as Timestamp;
  if (typeof t.toDate === "function") return t.toDate();
  if (typeof (t as { seconds?: number }).seconds === "number") {
    return new Date((t as { seconds: number }).seconds * 1000);
  }
  return null;
}

function formatAbsLong(d: Date): string {
  return d.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function useNow(intervalMs = 30_000): number {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function MetadataTabContent({ feedback }: MetadataTabContentProps) {
  const [toast, setToast] = React.useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = React.useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1700);
  }, []);
  React.useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Keeps relative timestamps fresh while the panel stays open.
  useNow();

  const copyToClipboard = React.useCallback(
    async (text: string, label = "Copied") => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(label);
      } catch {
        showToast("Copy failed");
      }
    },
    [showToast]
  );

  const url = feedback?.url?.trim() ?? "";
  const pageArea = feedback?.pageArea?.trim() ?? "";
  const userAgent = feedback?.userAgent?.trim() ?? "";
  const vw = feedback?.viewportWidth ?? null;
  const vh = feedback?.viewportHeight ?? null;
  const sw = feedback?.screenWidth ?? null;
  const sh = feedback?.screenHeight ?? null;
  const dpr = feedback?.devicePixelRatio ?? null;
  const ts = feedback?.clientTimestamp ?? null;

  const tsDate = clientTimestampToDate(ts as never);
  const hasViewport =
    typeof vw === "number" && typeof vh === "number" && vw > 0 && vh > 0;
  const hasScreen =
    typeof sw === "number" && typeof sh === "number" && sw > 0 && sh > 0;
  const hasDpr = typeof dpr === "number" && dpr > 0;

  const rows: React.ReactNode[] = [];

  if (url) {
    rows.push(
      <MetaRow key="url" label="URL">
        <span className="devtools-meta-value devtools-meta-value-mono devtools-meta-wrap">
          {url}
        </span>
        <RowActions>
          {isExternalUrl(url) ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="devtools-meta-icon-btn"
              aria-label="Open URL in new tab"
              title="Open in new tab"
            >
              <ExternalLink size={12} strokeWidth={1.75} />
            </a>
          ) : null}
          <button
            type="button"
            className="devtools-meta-icon-btn"
            aria-label="Copy URL"
            onClick={() => copyToClipboard(url)}
          >
            <Copy size={12} strokeWidth={1.75} />
          </button>
        </RowActions>
      </MetaRow>
    );
  }

  if (pageArea) {
    rows.push(
      <MetaRow key="pageArea" label="Page area">
        <span className="devtools-meta-value">{pageArea}</span>
      </MetaRow>
    );
  }

  if (userAgent) {
    rows.push(
      <MetaRow key="ua" label="User agent">
        <span className="devtools-meta-value devtools-meta-value-mono devtools-meta-wrap">
          {userAgent}
        </span>
        <RowActions>
          <button
            type="button"
            className="devtools-meta-icon-btn"
            aria-label="Copy user agent"
            onClick={() => copyToClipboard(userAgent)}
          >
            <Copy size={12} strokeWidth={1.75} />
          </button>
        </RowActions>
      </MetaRow>
    );
  }

  if (hasViewport) {
    rows.push(
      <MetaRow key="viewport" label="Viewport">
        <span className="devtools-meta-value">
          <span className="devtools-meta-pill">
            {vw} × {vh}
          </span>
        </span>
      </MetaRow>
    );
  }

  if (hasScreen) {
    rows.push(
      <MetaRow key="screen" label="Screen">
        <span className="devtools-meta-value">
          <span className="devtools-meta-pill">
            {sw} × {sh}
          </span>
        </span>
      </MetaRow>
    );
  }

  if (hasDpr) {
    rows.push(
      <MetaRow key="dpr" label="Device pixel ratio">
        <span className="devtools-meta-value">
          <span className="devtools-meta-pill">{dpr}x</span>
        </span>
      </MetaRow>
    );
  }

  if (tsDate) {
    const abs = formatAbsLong(tsDate);
    let rel = "";
    try {
      rel = formatDistanceToNow(tsDate, { addSuffix: true });
    } catch {
      rel = "";
    }
    rows.push(
      <MetaRow key="capturedAt" label="Captured at">
        <span className="devtools-meta-value" title={abs}>
          {rel || abs}
        </span>
      </MetaRow>
    );
  }

  const isEmpty = rows.length === 0;

  return (
    <div className="relative">
      <style>{`
        .devtools-meta-list {
          display: flex;
          flex-direction: column;
        }
        .devtools-meta-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 11px 10px;
          border-radius: 6px;
          min-height: 34px;
          transition: background-color 120ms ease;
        }
        .devtools-meta-row:hover {
          background: var(--surface-hover);
        }
        .devtools-meta-label {
          flex: 0 0 120px;
          padding-top: 2px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          user-select: none;
        }
        .devtools-meta-value {
          flex: 1;
          min-width: 0;
          font-size: 12.5px;
          color: var(--text-heading);
          line-height: 1.5;
          word-break: break-word;
        }
        .devtools-meta-value-mono {
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
        }
        .devtools-meta-wrap {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        /* Short, atomic numeric values (viewport, screen, DPR) get the inline
           monospace code-pill so they read as scannable technical data rather
           than plain text — matching the other tabs' pill treatment. Long
           wrapping strings (URL, user agent) stay as plain dark mono so they
           don't fragment across a chip boundary. */
        .devtools-meta-pill {
          display: inline-flex;
          align-items: center;
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 11.5px;
          font-weight: 500;
          background: var(--dt-code-bg);
          border: 1px solid var(--dt-code-border);
          color: var(--dt-code-text);
          padding: 2px 7px;
          border-radius: 5px;
          letter-spacing: -0.01em;
          line-height: 1.3;
          white-space: nowrap;
        }
        .devtools-meta-actions {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          opacity: 0;
          transition: opacity 120ms ease;
        }
        .devtools-meta-row:hover .devtools-meta-actions,
        .devtools-meta-row:focus-within .devtools-meta-actions {
          opacity: 1;
        }
        .devtools-meta-icon-btn {
          color: var(--text-tertiary);
          background: none;
          border: none;
          padding: 0;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 120ms ease, background-color 120ms ease;
          text-decoration: none;
        }
        .devtools-meta-icon-btn:hover {
          color: var(--text-heading);
          background: var(--surface);
        }
        .devtools-meta-icon-btn:focus-visible {
          opacity: 1;
          outline: 2px solid var(--brand);
          outline-offset: 1px;
        }
        @keyframes devtools-meta-toast-in {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .devtools-meta-toast {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 12px;
          background: var(--text-heading);
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 500;
          border-radius: 999px;
          box-shadow: var(--shadow-md);
          pointer-events: none;
          animation: devtools-meta-toast-in 200ms ${SPRING} both;
          z-index: 5;
        }
        @media (prefers-reduced-motion: reduce) {
          .devtools-meta-row,
          .devtools-meta-actions,
          .devtools-meta-icon-btn,
          .devtools-meta-toast {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="px-4 pt-4 pb-6">
        {isEmpty ? (
          <div className="pt-6 pb-2">
            <CanvasEmptyState
              illustration={<NoActivityIllu />}
              title="No metadata captured for this ticket."
              density="compact"
            />
          </div>
        ) : (
          <div className="devtools-meta-list">{rows}</div>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true">
        {toast ? <div className="devtools-meta-toast">{toast}</div> : null}
      </div>
    </div>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="devtools-meta-row">
      <span className="devtools-meta-label">{label}</span>
      {children}
    </div>
  );
}

function RowActions({ children }: { children: React.ReactNode }) {
  return <span className="devtools-meta-actions">{children}</span>;
}

export default MetadataTabContent;
