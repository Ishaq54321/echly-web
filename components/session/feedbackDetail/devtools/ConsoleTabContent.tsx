"use client";

import * as React from "react";
import { Copy } from "lucide-react";
import type { ConsoleLogEntry, ExceptionEntry } from "@/lib/domain/feedback";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoActivityIllu } from "@/components/empty/canvasIllustrations";

export interface ConsoleTabContentProps {
  consoleLogs?: ConsoleLogEntry[] | null;
  exceptions?: ExceptionEntry[] | null;
  consoleLogCount?: number;
  exceptionCount?: number;
  initialFilter?: "errors" | "warnings" | "all";
  /** Phase 5E: when true, scrolls the Exceptions section into view on mount. */
  scrollToExceptions?: boolean;
}

type LevelKey = "error" | "warn" | "info" | "log" | "debug";

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

interface Filters {
  errors: boolean;
  warnings: boolean;
  verbose: boolean;
}

const DEFAULT_FILTERS: Filters = { errors: true, warnings: true, verbose: false };
const ERRORS_ONLY: Filters = { errors: true, warnings: false, verbose: false };

const VERBOSE_LEVELS: LevelKey[] = ["log", "info", "debug"];

function isLogVisible(level: LevelKey, f: Filters): boolean {
  if (level === "error") return f.errors;
  if (level === "warn") return f.warnings;
  return f.verbose;
}

function formatRelShort(ts: number): string {
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
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatAbs(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatExceptionForClipboard(e: ExceptionEntry): string {
  const lines: string[] = [];
  lines.push(`[${formatAbs(e.timestamp)}] ${exceptionTypeLabel(e)}`);
  lines.push(e.message ?? "");
  if (e.source) {
    const loc = [e.source, e.line, e.column].filter((v) => v != null).join(":");
    lines.push(`at ${loc}`);
  }
  if (e.stack) {
    lines.push("");
    lines.push(e.stack);
  }
  return lines.join("\n");
}

function formatLogForClipboard(l: ConsoleLogEntry): string {
  const head = `[${formatAbs(l.timestamp)}] [${l.level}] ${l.message ?? ""}`;
  if (l.args && l.args.length > 0) {
    return `${head}\n${l.args.join("\n")}`;
  }
  return head;
}

function exceptionTypeLabel(e: ExceptionEntry): string {
  return e.type === "unhandledrejection"
    ? "Unhandled promise rejection"
    : "Uncaught error";
}

function levelDotColor(level: LevelKey): string {
  switch (level) {
    case "error":
      return "var(--color-danger)";
    case "warn":
      return "var(--color-warning)";
    case "info":
      return "var(--brand)";
    case "debug":
      return "var(--text-placeholder)";
    case "log":
    default:
      return "var(--text-tertiary)";
  }
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useNow(intervalMs = 30_000): number {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function ConsoleTabContent({
  consoleLogs,
  exceptions,
  consoleLogCount,
  exceptionCount: exceptionCountProp,
  initialFilter,
  scrollToExceptions = false,
}: ConsoleTabContentProps) {
  const logs = consoleLogs ?? [];
  const excs = exceptions ?? [];

  const totalLogCount = consoleLogCount ?? logs.length;
  const totalExceptionCount = exceptionCountProp ?? excs.length;

  const [filters, setFilters] = React.useState<Filters>(() =>
    initialFilter === "errors" ? ERRORS_ONLY : DEFAULT_FILTERS
  );

  const [rawSearch, setRawSearch] = React.useState("");
  const search = useDebounced(rawSearch, 100);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

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

  // re-render every 30s so relative timestamps stay fresh
  useNow();

  // Phase 5E: when the panel was opened by the exception badge, scroll the
  // Exceptions section into view after the tabpanel's entry animation has
  // settled. Double-rAF waits for layout to flush before measuring.
  React.useEffect(() => {
    if (!scrollToExceptions) return;
    if ((exceptions ?? []).length === 0) return;
    const id = "devtools-exceptions-label";
    let cancelled = false;
    const raf1 = requestAnimationFrame(() => {
      if (cancelled) return;
      const raf2 = requestAnimationFrame(() => {
        if (cancelled) return;
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
    };
  }, [scrollToExceptions, exceptions]);

  // Cmd/Ctrl+F focuses search when panel is mounted
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && (e.key === "f" || e.key === "F")) {
        if (!searchInputRef.current) return;
        e.preventDefault();
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const errorLevelCount = React.useMemo(
    () => logs.filter((l) => l.level === "error").length,
    [logs]
  );
  const warnLevelCount = React.useMemo(
    () => logs.filter((l) => l.level === "warn").length,
    [logs]
  );
  const verboseLevelCount = React.useMemo(
    () =>
      logs.filter((l) => VERBOSE_LEVELS.includes(l.level as LevelKey)).length,
    [logs]
  );

  const filteredLogs = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (!isLogVisible(l.level as LevelKey, filters)) return false;
      if (q && !(l.message ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [logs, filters, search]);

  const filteredExceptions = React.useMemo(() => {
    if (!filters.errors) return [];
    const q = search.trim().toLowerCase();
    return excs.filter((e) => {
      if (!q) return true;
      return (
        (e.message ?? "").toLowerCase().includes(q) ||
        (e.stack ?? "").toLowerCase().includes(q)
      );
    });
  }, [excs, filters.errors, search]);

  const hasAnyRawData = logs.length > 0 || excs.length > 0;
  const hasAnyFilteredData =
    filteredLogs.length > 0 || filteredExceptions.length > 0;

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setRawSearch("");
  };

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

  return (
    <div className="relative">
      <style>{`
        .devtools-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 26px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.005em;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease;
          user-select: none;
        }
        .devtools-chip:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
        .devtools-chip-count {
          font-size: 10.5px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          padding: 0 5px;
          border-radius: 999px;
          min-width: 16px;
          text-align: center;
        }
        .devtools-search {
          height: 32px;
          width: 100%;
          padding: 0 28px 0 10px;
          background: var(--surface-subtle);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 12.5px;
          font-family: inherit;
          color: var(--text-heading);
          transition: border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
          outline: none;
        }
        .devtools-search::placeholder { color: var(--text-placeholder); }
        .devtools-search:hover { border-color: var(--border-strong); }
        .devtools-search:focus {
          background: var(--surface);
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(90,73,191,0.10);
        }
        .devtools-search-clear {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background-color 120ms ease, color 120ms ease;
        }
        .devtools-search-clear:hover {
          background: var(--surface-hover);
          color: var(--text-heading);
        }
        .devtools-section-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
        }

        .devtools-exception-card {
          background: rgba(229, 72, 77, 0.04);
          border: 1px solid rgba(229, 72, 77, 0.18);
          border-radius: 10px;
          padding: 14px 14px;
          transition: background-color 150ms ease, border-color 150ms ease;
          cursor: pointer;
        }
        .devtools-exception-card:hover {
          background: rgba(229, 72, 77, 0.06);
          border-color: rgba(229, 72, 77, 0.26);
        }
        .devtools-exception-stack {
          background: var(--surface-subtle);
          border-radius: 6px;
          padding: 8px 10px;
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          line-height: 1.55;
          color: var(--text-secondary);
          white-space: pre;
          overflow-x: auto;
        }
        .devtools-trace-toggle {
          display: inline-flex;
          font-size: 11px;
          color: var(--text-secondary);
          background: none;
          border: none;
          padding: 0;
          margin-top: 8px;
          cursor: pointer;
          font-family: inherit;
        }
        .devtools-trace-toggle:hover {
          color: var(--text-heading);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .devtools-trace-toggle:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
          border-radius: 3px;
        }

        .devtools-log-row {
          display: grid;
          grid-template-columns: 14px 64px 1fr 22px;
          align-items: center;
          gap: 8px;
          height: 26px;
          padding: 0 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 120ms ease;
        }
        .devtools-log-row:hover {
          background: var(--surface-hover);
        }
        .devtools-log-row:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: -2px;
        }
        .devtools-log-row.is-expanded {
          background: var(--surface-hover);
          border-radius: 6px 6px 0 0;
        }
        .devtools-log-row-message {
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 11.5px;
          color: var(--text-heading);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .devtools-log-row-time {
          font-size: 10px;
          font-variant-numeric: tabular-nums;
          color: var(--text-tertiary);
          text-align: right;
          padding-right: 4px;
        }
        .devtools-copy-btn {
          opacity: 0;
          color: var(--text-tertiary);
          background: none;
          border: none;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 120ms ease, color 120ms ease, background-color 120ms ease;
        }
        .devtools-log-row:hover .devtools-copy-btn,
        .devtools-log-row:focus-within .devtools-copy-btn {
          opacity: 1;
        }
        .devtools-copy-btn:hover {
          color: var(--text-heading);
          background: var(--surface);
        }
        .devtools-copy-btn:focus-visible {
          opacity: 1;
          outline: 2px solid var(--brand);
          outline-offset: 1px;
        }

        .devtools-log-args {
          margin-left: 22px;
          padding: 8px 10px;
          background: var(--surface-subtle);
          border-radius: 0 0 6px 6px;
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-break: break-word;
        }

        @keyframes devtools-expand-in {
          from { opacity: 0; transform: translateY(-2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .devtools-expand-in {
          animation: devtools-expand-in 250ms ${SPRING} both;
          overflow: hidden;
        }

        @keyframes devtools-toast-in {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .devtools-toast {
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
          animation: devtools-toast-in 200ms ${SPRING} both;
          z-index: 5;
        }

        .devtools-clear-btn {
          margin-top: 14px;
          display: inline-flex;
          height: 30px;
          align-items: center;
          padding: 0 12px;
          border-radius: 8px;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          color: var(--text-heading);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 150ms ease, border-color 150ms ease;
        }
        .devtools-clear-btn:hover {
          background: var(--surface-subtle);
          border-color: var(--border-strong);
        }
        .devtools-clear-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .devtools-chip,
          .devtools-search,
          .devtools-exception-card,
          .devtools-log-row,
          .devtools-copy-btn,
          .devtools-toast,
          .devtools-expand-in {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="px-4 pt-4 pb-3">
        <FilterChips
          filters={filters}
          setFilters={setFilters}
          errorCount={errorLevelCount + totalExceptionCount}
          warningCount={warnLevelCount}
          verboseCount={verboseLevelCount}
        />

        <div className="relative mt-3">
          <input
            ref={searchInputRef}
            type="text"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder="Search log messages"
            aria-label="Search console log messages"
            className="devtools-search"
            spellCheck={false}
            autoComplete="off"
          />
          {rawSearch ? (
            <button
              type="button"
              className="devtools-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setRawSearch("");
                searchInputRef.current?.focus();
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden
                fill="none"
              >
                <path
                  d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-4 pb-6">
        {!hasAnyRawData ? (
          <div className="pt-6 pb-2">
            <CanvasEmptyState
              illustration={<NoActivityIllu />}
              title="No console activity captured for this ticket."
              description="Console logs and uncaught errors from the page will appear here."
              density="compact"
            />
          </div>
        ) : !hasAnyFilteredData ? (
          <FilterEmptyState onClear={resetFilters} totalLogs={totalLogCount} />
        ) : (
          <>
            {filteredExceptions.length > 0 ? (
              <section aria-labelledby="devtools-exceptions-label" className="mb-5">
                <div
                  id="devtools-exceptions-label"
                  className="devtools-section-label mb-3"
                >
                  <span>Exceptions</span>
                  <span style={{ color: "var(--text-placeholder)" }}>
                    ({filteredExceptions.length})
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {filteredExceptions.map((e, i) => (
                    <ExceptionCard
                      key={`${e.timestamp}-${i}`}
                      entry={e}
                      onCopy={() =>
                        copyToClipboard(
                          formatExceptionForClipboard(e),
                          "Copied"
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {filteredLogs.length > 0 ? (
              <section aria-labelledby="devtools-console-label">
                <div
                  id="devtools-console-label"
                  className="devtools-section-label mb-2"
                >
                  <span>Console</span>
                  <span style={{ color: "var(--text-placeholder)" }}>
                    ({filteredLogs.length})
                  </span>
                </div>
                <div className="flex flex-col">
                  {filteredLogs.map((l, i) => (
                    <LogRow
                      key={`${l.timestamp}-${i}`}
                      entry={l}
                      onCopy={() =>
                        copyToClipboard(formatLogForClipboard(l), "Copied")
                      }
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true">
        {toast ? <div className="devtools-toast">{toast}</div> : null}
      </div>
    </div>
  );
}

function FilterChips({
  filters,
  setFilters,
  errorCount,
  warningCount,
  verboseCount,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  errorCount: number;
  warningCount: number;
  verboseCount: number;
}) {
  const chip = (
    key: keyof Filters,
    label: string,
    count: number,
    dotColor: string
  ) => {
    const active = filters[key];
    return (
      <button
        type="button"
        role="button"
        aria-pressed={active}
        onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
        className="devtools-chip"
        style={{
          background: active ? "var(--surface-hover)" : "transparent",
          borderColor: active ? "var(--border)" : "transparent",
          color: active ? "var(--text-heading)" : "var(--text-tertiary)",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: 999,
            background: active ? dotColor : "var(--text-placeholder)",
            transition: "background-color 180ms ease",
          }}
        />
        <span>{label}</span>
        <span
          className="devtools-chip-count"
          style={{
            color: active ? "var(--text-secondary)" : "var(--text-placeholder)",
          }}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chip("errors", "Errors", errorCount, "var(--color-danger)")}
      {chip("warnings", "Warnings", warningCount, "var(--color-warning)")}
      {chip("verbose", "Verbose", verboseCount, "var(--text-tertiary)")}
    </div>
  );
}

function ExceptionCard({
  entry,
  onCopy,
}: {
  entry: ExceptionEntry;
  onCopy: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const stackLines = React.useMemo(
    () =>
      (entry.stack ?? "")
        .split("\n")
        .map((s) => s.replace(/^\s+/, "  "))
        .filter((s) => s.trim().length > 0),
    [entry.stack]
  );
  const preview = stackLines.slice(0, 2).join("\n");
  const hasMore = stackLines.length > 2;

  return (
    <div
      className="devtools-exception-card"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        // Don't fire copy when clicking the toggle button.
        if ((e.target as HTMLElement).closest(".devtools-trace-toggle")) return;
        onCopy();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCopy();
        }
      }}
      aria-label={`Copy ${exceptionTypeLabel(entry)} to clipboard`}
    >
      <div className="flex items-baseline gap-2">
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "var(--color-danger)",
            transform: "translateY(-1px)",
          }}
        />
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            color: "var(--text-heading)",
          }}
        >
          {exceptionTypeLabel(entry)}
        </span>
        <span className="flex-1" />
        <span
          style={{
            fontSize: 11,
            color: "var(--text-tertiary)",
            fontVariantNumeric: "tabular-nums",
          }}
          title={formatAbs(entry.timestamp)}
        >
          {formatRelShort(entry.timestamp)}
        </span>
      </div>

      <div
        className="mt-1.5"
        style={{
          fontFamily:
            'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.55,
          color: "var(--text-heading)",
          wordBreak: "break-word",
        }}
      >
        {entry.message || "(no message)"}
      </div>

      {stackLines.length > 0 ? (
        <>
          {!expanded ? (
            <pre
              className="devtools-exception-stack mt-2"
              style={{
                whiteSpace: "pre",
                color: "var(--text-tertiary)",
              }}
            >
              {preview}
            </pre>
          ) : (
            <div className="devtools-expand-in mt-2">
              <pre className="devtools-exception-stack">
                {stackLines.join("\n")}
              </pre>
            </div>
          )}

          {hasMore ? (
            <button
              type="button"
              className="devtools-trace-toggle"
              aria-expanded={expanded}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
            >
              {expanded ? "Collapse" : "Show full trace"}
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function LogRow({
  entry,
  onCopy,
}: {
  entry: ConsoleLogEntry;
  onCopy: () => void;
}) {
  const args = entry.args ?? [];
  const hasExpandableArgs =
    args.length > 1 || (args.length === 1 && args[0] !== entry.message);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div>
      <div
        className={`devtools-log-row${expanded ? " is-expanded" : ""}`}
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest(".devtools-copy-btn")) return;
          if (hasExpandableArgs) {
            setExpanded((v) => !v);
          } else {
            onCopy();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (hasExpandableArgs) setExpanded((v) => !v);
            else onCopy();
          }
        }}
        aria-expanded={hasExpandableArgs ? expanded : undefined}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: 999,
            background: levelDotColor(entry.level as LevelKey),
          }}
        />
        <span
          className="devtools-log-row-time"
          title={formatAbs(entry.timestamp)}
        >
          {formatRelShort(entry.timestamp)}
        </span>
        <span className="devtools-log-row-message">{entry.message}</span>
        <button
          type="button"
          className="devtools-copy-btn"
          aria-label="Copy log entry"
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
        >
          <Copy size={12} strokeWidth={1.75} />
        </button>
      </div>

      {hasExpandableArgs && expanded ? (
        <div className="devtools-expand-in">
          <pre className="devtools-log-args">{args.join("\n")}</pre>
        </div>
      ) : null}
    </div>
  );
}

function FilterEmptyState({
  onClear,
  totalLogs,
}: {
  onClear: () => void;
  totalLogs: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-10 pb-8 px-6">
      <h3
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-heading)",
          letterSpacing: "-0.005em",
        }}
      >
        All entries hidden by filters
      </h3>
      <p
        className="mt-1"
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          maxWidth: 260,
        }}
      >
        {totalLogs} {totalLogs === 1 ? "entry is" : "entries are"} available.
        Adjust the filter chips or clear the search to see them.
      </p>
      <button type="button" className="devtools-clear-btn" onClick={onClear}>
        Clear filters
      </button>
    </div>
  );
}

export default ConsoleTabContent;
