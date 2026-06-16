"use client";

import * as React from "react";
import { ArrowLeft, Copy, Scissors } from "lucide-react";
import type { NetworkRequestEntry } from "@/lib/domain/feedback";
import { Tabs, type TabsItem } from "@/components/ui/Tabs";

export interface NetworkRequestDrawerProps {
  /** Currently displayed entry. May be null when closing — keeps last entry visible during slide-out. */
  entry: NetworkRequestEntry | null;
  isOpen: boolean;
  onClose: () => void;
  /** Optional toast emitter — supplied by parent so copy feedback uses the page-wide toast. */
  onToast?: (message: string) => void;
}

type DrawerTabId = "headers" | "request" | "response";

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

function formatBytes(n: number | null): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function formatDuration(durationMs: number | null): string {
  if (durationMs == null) return "—";
  if (durationMs < 1000) return `${Math.round(durationMs)}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function timeColor(durationMs: number | null): string {
  if (durationMs == null) return "var(--text-tertiary)";
  if (durationMs >= 1000) return "var(--dt-status-err-text)";
  if (durationMs >= 500) return "var(--dt-status-warn-text)";
  return "var(--text-secondary)";
}

/** A pill's foreground + faint tint + border, applied via CSS custom
 *  properties so one .netdrawer-badge rule renders every variant — the same
 *  tinted-chip treatment as the Network list rows. */
interface PillColors {
  color: string;
  bg: string;
  border: string;
}

function badgeVars(p: PillColors): React.CSSProperties {
  return {
    ["--badge-color" as string]: p.color,
    ["--badge-bg" as string]: p.bg,
    ["--badge-border" as string]: p.border,
  };
}

const PILL_OK: PillColors = {
  color: "var(--dt-status-ok-text)",
  bg: "var(--dt-status-ok-bg)",
  border: "var(--dt-status-ok-border)",
};
const PILL_WARN: PillColors = {
  color: "var(--dt-status-warn-text)",
  bg: "var(--dt-status-warn-bg)",
  border: "var(--dt-status-warn-border)",
};
const PILL_ERR: PillColors = {
  color: "var(--dt-status-err-text)",
  bg: "var(--dt-status-err-bg)",
  border: "var(--dt-status-err-border)",
};
const PILL_INFO: PillColors = {
  color: "var(--dt-status-info-text)",
  bg: "var(--dt-status-info-bg)",
  border: "var(--dt-status-info-border)",
};
const PILL_NEUTRAL: PillColors = {
  color: "var(--text-secondary)",
  bg: "var(--surface-subtle)",
  border: "var(--border)",
};

/** Bare foreground colour for the Status Code value in the General kv section
 *  (text, not a pill — keeps the kv grid visually calm). */
function statusColorForCode(status: number | null, errored: boolean): string {
  if (errored) return "var(--dt-status-err-text)";
  if (status == null) return "var(--text-tertiary)";
  if (status >= 500) return "var(--dt-status-err-text)";
  if (status >= 400) return "var(--dt-status-warn-text)";
  if (status >= 300) return "var(--dt-status-info-text)";
  if (status >= 200) return "var(--dt-status-ok-text)";
  return "var(--text-secondary)";
}

function statusPillForCode(status: number | null, errored: boolean): PillColors {
  if (errored) return PILL_ERR;
  if (status == null) return PILL_NEUTRAL;
  if (status >= 500) return PILL_ERR;
  if (status >= 400) return PILL_WARN;
  if (status >= 300) return PILL_INFO;
  if (status >= 200) return PILL_OK;
  return PILL_NEUTRAL;
}

function methodPill(method: string): PillColors {
  const m = method.toUpperCase();
  if (m === "GET") return PILL_INFO;
  if (m === "POST") return PILL_OK;
  if (m === "PUT" || m === "PATCH") return PILL_WARN;
  if (m === "DELETE") return PILL_ERR;
  return PILL_NEUTRAL;
}

function extractHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "—";
  }
}

function isJsonContentType(ct: string | null | undefined): boolean {
  if (!ct) return false;
  const lower = ct.toLowerCase();
  return lower.includes("application/json") || lower.includes("+json");
}

function prettyPrintJson(body: string): string {
  try {
    const parsed = JSON.parse(body);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return body;
  }
}

function isRedactedValue(value: string): boolean {
  if (!value) return false;
  return (
    value === "<REDACTED>" ||
    /<email>/i.test(value) ||
    /<jwt>/i.test(value) ||
    /<key>/i.test(value)
  );
}

function isBinaryPlaceholder(body: string | null | undefined): boolean {
  if (!body) return false;
  return /^<binary content/i.test(body.trim());
}

function formatRelative(ts: number | null): string {
  if (!ts) return "";
  const diffMs = Date.now() - ts;
  const s = Math.max(0, Math.floor(diffMs / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ------------------------------------------------------------------ */
/* cURL / fetch generation                                             */
/* ------------------------------------------------------------------ */

function escapeSingleQuoted(value: string): string {
  // cURL/bash single-quote escape: end quote, escaped quote, reopen.
  return value.replace(/'/g, "'\\''");
}

export function generateCurl(entry: NetworkRequestEntry): string {
  const lines: string[] = [];
  if (entry.requestBodyTruncated && entry.requestBodyOriginalSize != null) {
    lines.push(
      `# Note: request body truncated to 50KB at capture time. Full size was ${entry.requestBodyOriginalSize} bytes.`
    );
  }
  const parts: string[] = [`curl '${escapeSingleQuoted(entry.url)}'`];
  const method = (entry.method || "GET").toUpperCase();
  if (method !== "GET") {
    parts.push(`  -X ${method}`);
  }
  const headerKeys = Object.keys(entry.requestHeaders ?? {}).sort();
  for (const key of headerKeys) {
    const value = entry.requestHeaders[key];
    parts.push(`  -H '${escapeSingleQuoted(key)}: ${escapeSingleQuoted(value)}'`);
  }
  if (entry.requestBody != null && entry.requestBody.length > 0) {
    parts.push(`  -d '${escapeSingleQuoted(entry.requestBody)}'`);
  }
  lines.push(parts.join(" \\\n"));
  return lines.join("\n");
}

export function generateFetch(entry: NetworkRequestEntry): string {
  const lines: string[] = [];
  if (entry.requestBodyTruncated && entry.requestBodyOriginalSize != null) {
    lines.push(
      `// Note: request body truncated to 50KB at capture time. Full size was ${entry.requestBodyOriginalSize} bytes.`
    );
  }
  const method = (entry.method || "GET").toUpperCase();
  const headers = entry.requestHeaders ?? {};
  const headerKeys = Object.keys(headers).sort();

  const optsLines: string[] = [];
  optsLines.push(`  method: ${JSON.stringify(method)},`);

  if (headerKeys.length > 0) {
    optsLines.push(`  headers: {`);
    for (const k of headerKeys) {
      optsLines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(headers[k])},`);
    }
    optsLines.push(`  },`);
  }

  if (entry.requestBody != null && entry.requestBody.length > 0) {
    const ct = entry.requestHeaders?.["content-type"] ?? entry.requestHeaders?.["Content-Type"] ?? "";
    if (isJsonContentType(ct)) {
      try {
        const parsed = JSON.parse(entry.requestBody);
        optsLines.push(`  body: JSON.stringify(${JSON.stringify(parsed)}),`);
      } catch {
        optsLines.push(`  body: ${JSON.stringify(entry.requestBody)},`);
      }
    } else if (/^multipart\//i.test(ct)) {
      optsLines.push(`  // body content type was multipart; raw form data shown`);
      optsLines.push(`  body: ${JSON.stringify(entry.requestBody)},`);
    } else {
      optsLines.push(`  body: ${JSON.stringify(entry.requestBody)},`);
    }
  }

  lines.push(`fetch(${JSON.stringify(entry.url)}, {`);
  lines.push(...optsLines);
  lines.push(`})`);
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */

export function NetworkRequestDrawer({
  entry,
  isOpen,
  onClose,
  onToast,
}: NetworkRequestDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<DrawerTabId>("headers");
  const [copyMenuOpen, setCopyMenuOpen] = React.useState(false);
  const [localToast, setLocalToast] = React.useState<string | null>(null);
  const localToastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawerRef = React.useRef<HTMLDivElement | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const copyMenuRef = React.useRef<HTMLDivElement | null>(null);

  // Keep last-known entry so the drawer renders during the slide-out animation
  // after the parent has cleared `entry` to null.
  const [renderedEntry, setRenderedEntry] = React.useState<NetworkRequestEntry | null>(entry);
  React.useEffect(() => {
    if (entry) setRenderedEntry(entry);
  }, [entry]);

  // Fade content swap when entry changes while drawer is open.
  const [contentKey, setContentKey] = React.useState<string>(entry?.id ?? "");
  React.useEffect(() => {
    if (entry && entry.id !== contentKey) {
      setContentKey(entry.id);
    }
  }, [entry, contentKey]);

  const showToast = React.useCallback(
    (msg: string) => {
      if (onToast) {
        onToast(msg);
        return;
      }
      setLocalToast(msg);
      if (localToastTimer.current) clearTimeout(localToastTimer.current);
      localToastTimer.current = setTimeout(() => setLocalToast(null), 1700);
    },
    [onToast]
  );

  React.useEffect(() => {
    return () => {
      if (localToastTimer.current) clearTimeout(localToastTimer.current);
    };
  }, []);

  // ESC returns to the list. No Tab trap: the detail is a full-width in-flow
  // view (not a modal overlay), so Tab should move naturally between it and
  // the panel's tab bar above.
  React.useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Focus the Back button when the detail opens so keyboard users land on the
  // return affordance.
  React.useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  // Click-outside the copy menu closes it.
  React.useEffect(() => {
    if (!copyMenuOpen) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (copyMenuRef.current && !copyMenuRef.current.contains(t)) {
        setCopyMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", onDocClick);
    return () => window.removeEventListener("mousedown", onDocClick);
  }, [copyMenuOpen]);

  // Reset copy menu when entry swaps.
  React.useEffect(() => {
    setCopyMenuOpen(false);
  }, [entry?.id]);

  const copyToClipboard = React.useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(label);
      } catch {
        showToast("Copy failed");
      }
    },
    [showToast]
  );

  const e = renderedEntry;

  const drawerTabs: TabsItem[] = [
    { id: "headers", label: "Headers" },
    { id: "request", label: "Request" },
    { id: "response", label: "Response" },
  ];

  if (!isOpen && !e) {
    return null;
  }

  return (
    <>
      <style>{`
        /* Full-width, in-flow detail view (not an overlay). Spans the whole
           Dev Tools panel content width at every panel width. A short fade-in
           on entry replaces the old slide-in drawer animation. */
        .netdrawer {
          width: 100%;
          background: var(--surface);
          display: flex;
          flex-direction: column;
          animation: netdrawer-enter 200ms ease both;
        }
        @keyframes netdrawer-enter {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .netdrawer {
            animation: none !important;
          }
        }

        .netdrawer-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 26px;
          padding: 0 10px 0 6px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 500;
          font-family: inherit;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 120ms ease, color 120ms ease;
        }
        .netdrawer-back:hover {
          background: var(--surface-hover);
          color: var(--text-heading);
        }
        .netdrawer-back:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        .netdrawer-header {
          padding: 12px 14px 12px 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .netdrawer-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-height: 24px;
        }
        .netdrawer-timestamp {
          font-size: 10.5px;
          color: var(--text-tertiary);
          font-variant-numeric: tabular-nums;
        }
        .netdrawer-identifier {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 6px;
        }
        .netdrawer-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 21px;
          padding: 0 8px;
          border-radius: 5px;
          font-size: 12px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.01em;
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          line-height: 1;
          flex-shrink: 0;
          color: var(--badge-color, var(--text-secondary));
          background: var(--badge-bg, transparent);
          border: 1px solid var(--badge-border, transparent);
        }
        .netdrawer-url {
          flex: 1;
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
          color: var(--text-heading);
          line-height: 1.5;
          /* Single truncated line — long URLs (e.g. the GA beacon) never wrap
             character-by-character over dozens of lines. Full value is on the
             title tooltip and the adjacent Copy button. */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .netdrawer-icon-btn {
          width: 24px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background-color 120ms ease, color 120ms ease;
        }
        .netdrawer-icon-btn:hover {
          background: var(--surface-hover);
          color: var(--text-heading);
        }
        .netdrawer-icon-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 1px;
        }

        .netdrawer-meta {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0;
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .netdrawer-meta-sep {
          margin: 0 6px;
          color: var(--text-placeholder);
        }
        .netdrawer-meta-truncated {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: var(--color-warning-text);
        }

        .netdrawer-tabs-wrap {
          position: relative;
          padding: 8px 14px 0 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .netdrawer-copy {
          position: relative;
        }
        .netdrawer-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 26px;
          padding: 0 10px;
          border-radius: 6px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease;
        }
        .netdrawer-copy-btn:hover {
          background: var(--surface-hover);
          color: var(--text-heading);
          border-color: var(--border-strong);
        }
        .netdrawer-copy-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
        .netdrawer-copy-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          min-width: 180px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 8px 24px -8px rgba(21, 16, 31, 0.14);
          padding: 4px;
          z-index: 6;
          animation: netdrawer-menu-in 160ms ${SPRING} both;
        }
        @keyframes netdrawer-menu-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .netdrawer-copy-menu button {
          display: block;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          padding: 7px 10px;
          border-radius: 5px;
          font-size: 12.5px;
          color: var(--text-heading);
          cursor: pointer;
          transition: background-color 120ms ease;
        }
        .netdrawer-copy-menu button:hover,
        .netdrawer-copy-menu button:focus-visible {
          background: var(--surface-hover);
          outline: none;
        }

        .netdrawer-body {
          /* In-flow: the Dev Tools panel owns scrolling, so the body grows
             naturally rather than scrolling within a fixed-height drawer. */
          flex: 1 1 auto;
        }
        .netdrawer-body-inner {
          padding: 16px;
          animation: netdrawer-content-in 180ms ease both;
        }
        @keyframes netdrawer-content-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .netdrawer-body-inner,
          .netdrawer-copy-menu {
            animation: none !important;
          }
        }

        .netdrawer-section-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-tertiary);
          margin-bottom: 8px;
        }
        .netdrawer-section + .netdrawer-section {
          margin-top: 22px;
        }

        .netdrawer-kv {
          display: grid;
          grid-template-columns: 140px minmax(0, 1fr) 24px;
          align-items: start;
          gap: 12px;
          padding: 7px 4px;
          border-radius: 4px;
          transition: background-color 120ms ease;
        }
        .netdrawer-kv:hover {
          background: var(--surface-hover);
        }
        .netdrawer-kv-key {
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 11.5px;
          color: var(--text-tertiary);
          word-break: break-word;
        }
        .netdrawer-kv-value {
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 11.5px;
          color: var(--text-heading);
          word-break: break-all;
        }
        .netdrawer-kv-value.redacted {
          color: var(--text-tertiary);
          font-style: italic;
        }
        .netdrawer-kv-copy {
          opacity: 0;
          transition: opacity 120ms ease;
        }
        .netdrawer-kv:hover .netdrawer-kv-copy,
        .netdrawer-kv:focus-within .netdrawer-kv-copy {
          opacity: 1;
        }

        .netdrawer-body-block {
          position: relative;
          background: var(--surface-subtle);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 36px 12px 12px;
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 11.5px;
          color: var(--text-heading);
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 480px;
          overflow: auto;
        }
        .netdrawer-body-copy {
          position: absolute;
          top: 8px;
          right: 8px;
        }

        .netdrawer-truncation {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          margin-bottom: 10px;
          background: rgba(217, 119, 6, 0.06);
          border: 1px solid rgba(217, 119, 6, 0.18);
          border-radius: 6px;
          font-size: 11.5px;
          color: var(--color-warning-text);
        }

        .netdrawer-empty-body {
          text-align: center;
          padding: 24px 12px;
          font-size: 12px;
          color: var(--text-tertiary);
        }
        .netdrawer-binary {
          font-style: italic;
          color: var(--text-tertiary);
          font-size: 12px;
          padding: 16px 12px;
          background: var(--surface-subtle);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .netdrawer-toast {
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
          z-index: 7;
        }
      `}</style>

      <div
        ref={drawerRef}
        className="netdrawer"
        role="region"
        aria-label="Network request details"
      >
        {e ? (
          <>
            <DrawerHeader
              entry={e}
              onClose={onClose}
              closeBtnRef={closeBtnRef}
              onCopyUrl={() => copyToClipboard(e.url, "URL copied")}
            />

            <div className="netdrawer-tabs-wrap">
              <Tabs
                tabs={drawerTabs}
                activeTabId={activeTab}
                onChange={(id) => setActiveTab(id as DrawerTabId)}
                variant="underline"
                size="sm"
                ariaLabel="Request detail sections"
              />
              <div className="netdrawer-copy" ref={copyMenuRef}>
                <button
                  type="button"
                  className="netdrawer-copy-btn"
                  aria-haspopup="menu"
                  aria-expanded={copyMenuOpen}
                  onClick={() => setCopyMenuOpen((v) => !v)}
                >
                  <Copy size={12} strokeWidth={1.75} aria-hidden />
                  <span>Copy</span>
                </button>
                {copyMenuOpen ? (
                  <div className="netdrawer-copy-menu" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        copyToClipboard(generateCurl(e), "cURL copied");
                        setCopyMenuOpen(false);
                      }}
                    >
                      Copy as cURL
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        copyToClipboard(generateFetch(e), "fetch copied");
                        setCopyMenuOpen(false);
                      }}
                    >
                      Copy as fetch
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="netdrawer-body">
              <div className="netdrawer-body-inner" key={contentKey}>
                {activeTab === "headers" ? (
                  <HeadersTab
                    entry={e}
                    onCopy={(text, label) => copyToClipboard(text, label)}
                  />
                ) : null}
                {activeTab === "request" ? (
                  <RequestTab
                    entry={e}
                    onCopy={(text, label) => copyToClipboard(text, label)}
                  />
                ) : null}
                {activeTab === "response" ? (
                  <ResponseTab
                    entry={e}
                    onCopy={(text, label) => copyToClipboard(text, label)}
                  />
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        <div aria-live="polite" aria-atomic="true">
          {localToast ? <div className="netdrawer-toast">{localToast}</div> : null}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function DrawerHeader({
  entry,
  onClose,
  closeBtnRef,
  onCopyUrl,
}: {
  entry: NetworkRequestEntry;
  onClose: () => void;
  closeBtnRef: React.RefObject<HTMLButtonElement | null>;
  onCopyUrl: () => void;
}) {
  const statusPill = statusPillForCode(entry.status, entry.errored);
  const methodPillColors = methodPill(entry.method);
  const time = formatDuration(entry.durationMs);
  const tColor = timeColor(entry.durationMs);
  const size = formatBytes(entry.responseBodyOriginalSize);
  const ct = entry.responseContentType ?? "—";
  const truncated = entry.requestBodyTruncated || entry.responseBodyTruncated;
  const rel = formatRelative(entry.timestamp);

  const statusText =
    entry.status != null ? String(entry.status) : entry.errored ? "ERR" : "—";

  return (
    <div className="netdrawer-header">
      <div className="netdrawer-header-row">
        {/* Back-to-list affordance replaces the old × — the detail is a
            full-width view swapped in over the list, not an overlay. */}
        <button
          ref={closeBtnRef}
          type="button"
          className="netdrawer-back"
          aria-label="Back to request list"
          onClick={onClose}
        >
          <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
          <span>Back</span>
        </button>
        {rel ? <span className="netdrawer-timestamp">captured {rel}</span> : null}
      </div>

      <div className="netdrawer-identifier">
        <span
          className="netdrawer-badge"
          style={{
            ...badgeVars(statusPill),
            textDecoration: entry.errored ? "line-through" : undefined,
          }}
        >
          {statusText}
        </span>
        <span className="netdrawer-badge" style={badgeVars(methodPillColors)}>
          {entry.method.toUpperCase()}
        </span>
        <span className="netdrawer-url" title={entry.url}>{entry.url}</span>
        <button
          type="button"
          className="netdrawer-icon-btn"
          aria-label="Copy URL"
          onClick={onCopyUrl}
          title="Copy URL"
        >
          <Copy size={12} strokeWidth={1.75} />
        </button>
      </div>

      <div className="netdrawer-meta">
        <span style={{ color: tColor }}>{time}</span>
        <span className="netdrawer-meta-sep">·</span>
        <span>{size}</span>
        <span className="netdrawer-meta-sep">·</span>
        <span>{ct}</span>
        {truncated ? (
          <>
            <span className="netdrawer-meta-sep">·</span>
            <span className="netdrawer-meta-truncated">
              <Scissors size={11} strokeWidth={1.75} aria-hidden />
              <span>truncated</span>
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Headers tab                                                         */
/* ------------------------------------------------------------------ */

function HeadersTab({
  entry,
  onCopy,
}: {
  entry: NetworkRequestEntry;
  onCopy: (text: string, label: string) => void;
}) {
  const responseHeaderKeys = Object.keys(entry.responseHeaders ?? {}).sort();
  const requestHeaderKeys = Object.keys(entry.requestHeaders ?? {}).sort();
  const remote = extractHost(entry.url);
  const statusText =
    entry.status != null
      ? `${entry.status}${entry.statusText ? ` ${entry.statusText}` : ""}`
      : entry.errored
      ? "Errored"
      : "Pending";
  const statusColor = statusColorForCode(entry.status, entry.errored);

  // Optional Referrer Policy from response headers.
  const referrerPolicy =
    entry.responseHeaders?.["referrer-policy"] ??
    entry.responseHeaders?.["Referrer-Policy"] ??
    null;

  return (
    <>
      <section className="netdrawer-section">
        <div className="netdrawer-section-label">General</div>
        <KvRow label="Request URL" value={entry.url} onCopy={onCopy} />
        <KvRow label="Request Method" value={entry.method.toUpperCase()} onCopy={onCopy} />
        <KvRow
          label="Status Code"
          value={statusText}
          valueColor={statusColor}
          onCopy={onCopy}
        />
        <KvRow label="Remote Address" value={remote} onCopy={onCopy} />
        {referrerPolicy ? (
          <KvRow label="Referrer Policy" value={referrerPolicy} onCopy={onCopy} />
        ) : null}
      </section>

      {responseHeaderKeys.length > 0 ? (
        <section className="netdrawer-section">
          <div className="netdrawer-section-label">
            <span>Response Headers</span>
            <span style={{ color: "var(--text-placeholder)" }}>
              ({responseHeaderKeys.length})
            </span>
          </div>
          {responseHeaderKeys.map((k) => (
            <KvRow
              key={`res-${k}`}
              label={k}
              value={entry.responseHeaders[k]}
              onCopy={onCopy}
            />
          ))}
        </section>
      ) : null}

      {requestHeaderKeys.length > 0 ? (
        <section className="netdrawer-section">
          <div className="netdrawer-section-label">
            <span>Request Headers</span>
            <span style={{ color: "var(--text-placeholder)" }}>
              ({requestHeaderKeys.length})
            </span>
          </div>
          {requestHeaderKeys.map((k) => (
            <KvRow
              key={`req-${k}`}
              label={k}
              value={entry.requestHeaders[k]}
              onCopy={onCopy}
            />
          ))}
        </section>
      ) : null}
    </>
  );
}

function KvRow({
  label,
  value,
  valueColor,
  onCopy,
}: {
  label: string;
  value: string;
  valueColor?: string;
  onCopy: (text: string, label: string) => void;
}) {
  const redacted = isRedactedValue(value);
  return (
    <div className="netdrawer-kv">
      <div className="netdrawer-kv-key">{label}</div>
      <div
        className={`netdrawer-kv-value${redacted ? " redacted" : ""}`}
        style={!redacted && valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
      <button
        type="button"
        className="netdrawer-icon-btn netdrawer-kv-copy"
        aria-label={`Copy ${label}`}
        onClick={() => onCopy(value, "Copied")}
      >
        <Copy size={11} strokeWidth={1.75} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Request / Response tabs                                             */
/* ------------------------------------------------------------------ */

function RequestTab({
  entry,
  onCopy,
}: {
  entry: NetworkRequestEntry;
  onCopy: (text: string, label: string) => void;
}) {
  if (entry.requestBody == null || entry.requestBody.length === 0) {
    return <div className="netdrawer-empty-body">No request body</div>;
  }
  const ct =
    entry.requestHeaders?.["content-type"] ??
    entry.requestHeaders?.["Content-Type"] ??
    "";
  const shouldPretty = isJsonContentType(ct);
  const displayed = shouldPretty ? prettyPrintJson(entry.requestBody) : entry.requestBody;

  return (
    <BodyBlock
      truncated={entry.requestBodyTruncated}
      originalSize={entry.requestBodyOriginalSize}
      content={displayed}
      onCopy={() => onCopy(displayed, "Request body copied")}
    />
  );
}

function ResponseTab({
  entry,
  onCopy,
}: {
  entry: NetworkRequestEntry;
  onCopy: (text: string, label: string) => void;
}) {
  if (entry.responseBody == null || entry.responseBody.length === 0) {
    return <div className="netdrawer-empty-body">No response body</div>;
  }
  if (isBinaryPlaceholder(entry.responseBody)) {
    const size = formatBytes(entry.responseBodyOriginalSize);
    return (
      <div className="netdrawer-binary">
        Response body is binary content. {size}. Not displayed.
      </div>
    );
  }

  const shouldPretty = isJsonContentType(entry.responseContentType);
  const displayed = shouldPretty
    ? prettyPrintJson(entry.responseBody)
    : entry.responseBody;

  return (
    <BodyBlock
      truncated={entry.responseBodyTruncated}
      originalSize={entry.responseBodyOriginalSize}
      content={displayed}
      onCopy={() => onCopy(displayed, "Response body copied")}
    />
  );
}

function BodyBlock({
  truncated,
  originalSize,
  content,
  onCopy,
}: {
  truncated: boolean;
  originalSize: number | null;
  content: string;
  onCopy: () => void;
}) {
  return (
    <>
      {truncated ? (
        <div className="netdrawer-truncation" role="status">
          <Scissors size={12} strokeWidth={1.75} aria-hidden />
          <span>
            Showing first 50KB of{" "}
            {originalSize != null ? formatBytes(originalSize) : "the original payload"}{" "}
            captured
          </span>
        </div>
      ) : null}
      <div className="netdrawer-body-block">
        <button
          type="button"
          className="netdrawer-icon-btn netdrawer-body-copy"
          aria-label="Copy body"
          onClick={onCopy}
          title="Copy body"
        >
          <Copy size={12} strokeWidth={1.75} />
        </button>
        {content}
      </div>
    </>
  );
}

export default NetworkRequestDrawer;
