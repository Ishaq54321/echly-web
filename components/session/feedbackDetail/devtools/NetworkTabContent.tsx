"use client";

import * as React from "react";
import type { NetworkRequestEntry } from "@/lib/domain/feedback";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoActivityIllu } from "@/components/empty/canvasIllustrations";
import { NetworkRequestDrawer } from "@/components/session/feedbackDetail/devtools/NetworkRequestDrawer";

export interface NetworkTabContentProps {
  networkRequests?: NetworkRequestEntry[] | null;
  networkRequestCount?: number;
  networkErrorCount?: number;
  /** Optional external filter override for the badge-jump from FeedbackHeader (N5D). */
  initialFilter?: "errors";
}

type SourceFilter = "xhr" | "fetch";

interface Filters {
  errorsOnly: boolean;
  sources: Set<SourceFilter>;
  doc: boolean;
}

function makeDefaultFilters(
  hasErrors: boolean,
  initialFilter?: "errors"
): Filters {
  return {
    errorsOnly: hasErrors || initialFilter === "errors",
    sources: new Set<SourceFilter>(),
    doc: false,
  };
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ------------------------------------------------------------------ */
/* Classification helpers                                              */
/* ------------------------------------------------------------------ */

type Lifecycle = "pending" | "errored" | "success" | "redirect" | "clientError" | "serverError" | "informational";

function classifyLifecycle(entry: NetworkRequestEntry): Lifecycle {
  if (entry.errored) return "errored";
  if (entry.status == null) return "pending";
  if (entry.status >= 500) return "serverError";
  if (entry.status >= 400) return "clientError";
  if (entry.status >= 300) return "redirect";
  if (entry.status >= 200) return "success";
  return "informational";
}

function isErrorish(entry: NetworkRequestEntry): boolean {
  if (entry.errored) return true;
  if (entry.status != null && entry.status >= 400) return true;
  return false;
}

function isPending(entry: NetworkRequestEntry): boolean {
  return !entry.errored && entry.status == null;
}

/** A pill's full colour set — foreground + faint tinted background + border —
 *  applied via CSS custom properties so one .nettab-badge rule renders every
 *  variant. Matches the marketing Network rows' tinted-chip treatment. */
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

function statusBadgeColors(lifecycle: Lifecycle): PillColors {
  switch (lifecycle) {
    case "success":
      return PILL_OK;
    case "redirect":
      return PILL_INFO;
    case "clientError":
      return PILL_WARN;
    case "serverError":
    case "errored":
      return PILL_ERR;
    case "informational":
      return PILL_NEUTRAL;
    case "pending":
    default:
      return PILL_NEUTRAL;
  }
}

function methodColors(method: string): PillColors {
  const m = method.toUpperCase();
  if (m === "GET") return PILL_INFO;
  if (m === "POST") return PILL_OK;
  if (m === "PUT" || m === "PATCH") return PILL_WARN;
  if (m === "DELETE") return PILL_ERR;
  // OPTIONS, HEAD, anything else
  return PILL_NEUTRAL;
}

function timeColor(durationMs: number | null): string {
  if (durationMs == null) return "var(--text-tertiary)";
  if (durationMs >= 1000) return "var(--dt-status-err-text)";
  if (durationMs >= 500) return "var(--dt-status-warn-text)";
  return "var(--text-secondary)";
}

function formatDuration(durationMs: number | null): string {
  if (durationMs == null) return "—";
  if (durationMs < 1000) return `${Math.round(durationMs)}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function extractName(url: string): string {
  try {
    const u = new URL(url);
    const pathParts = u.pathname.split("/").filter(Boolean);
    const last = pathParts[pathParts.length - 1];
    if (!last) return u.pathname || "/";
    return last;
  } catch {
    // Relative URLs or malformed; fall back to a simple split.
    const trimmed = url.split("?")[0].split("#")[0];
    const parts = trimmed.split("/").filter(Boolean);
    return parts[parts.length - 1] || url;
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function compactContentType(contentType: string | null): string {
  if (!contentType) return "—";
  const lower = contentType.toLowerCase();
  if (lower.includes("application/json") || lower.includes("+json")) return "json";
  if (lower.includes("html")) return "html";
  if (lower.includes("xml")) return "xml";
  if (lower.includes("css")) return "css";
  if (lower.includes("javascript") || lower.includes("ecmascript")) return "js";
  if (lower.includes("image/png")) return "png";
  if (lower.includes("image/jpeg") || lower.includes("image/jpg")) return "jpg";
  if (lower.includes("image/gif")) return "gif";
  if (lower.includes("image/webp")) return "webp";
  if (lower.includes("image/svg")) return "svg";
  if (lower.includes("font/") || lower.includes("woff")) return "font";
  if (lower.includes("text/plain")) return "text";
  // Strip parameters and the type/ prefix for anything else.
  const main = lower.split(";")[0].trim();
  const sub = main.split("/")[1] ?? main;
  return sub.slice(0, 6);
}

function isDocLike(entry: NetworkRequestEntry): boolean {
  const ct = (entry.responseContentType ?? "").toLowerCase();
  return ct.includes("html");
}

/** Nearest scrollable ancestor (the panel's overflow-y-auto wrapper). Used to
 *  save/restore list scroll position across the list↔detail swap. */
function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const overflowY = window.getComputedStyle(el).overflowY;
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export function NetworkTabContent({
  networkRequests,
  networkRequestCount,
  networkErrorCount,
  initialFilter,
}: NetworkTabContentProps) {
  const all = React.useMemo<NetworkRequestEntry[]>(
    () => networkRequests ?? [],
    [networkRequests]
  );

  const hasAnyError = (networkErrorCount ?? 0) > 0;
  const totalCount = networkRequestCount ?? all.length;

  const [filters, setFilters] = React.useState<Filters>(() =>
    makeDefaultFilters(hasAnyError, initialFilter)
  );

  // If the caller re-mounts the component with a new initialFilter, honor it.
  // We don't reset on every prop change — only when initialFilter goes from
  // undefined/other → "errors".
  React.useEffect(() => {
    if (initialFilter === "errors") {
      setFilters((f) => ({ ...f, errorsOnly: true }));
    }
  }, [initialFilter]);

  const [rawSearch, setRawSearch] = React.useState("");
  const search = useDebounced(rawSearch, 100);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  // Detail state — owned here per the N5C contract. Selecting a row replaces
  // the list with a full-panel-width detail view (back affordance returns to
  // the list). This is an in-flow swap, not an overlay, so the detail always
  // spans the panel content width across the 360–720px resize range.
  const [selectedEntryId, setSelectedEntryId] = React.useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  // Remembers the row element that opened the detail so focus can be
  // restored on close (a11y polish — N5E).
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);
  // Saved list scroll position so back returns the user to where they were.
  // The scroll owner is the panel's scroll ancestor (DevToolsPanel's
  // overflow-y-auto wrapper), found by walking up from the tab root.
  const savedScrollTopRef = React.useRef(0);

  const selectedEntry = React.useMemo(
    () => all.find((entry) => entry.id === selectedEntryId) ?? null,
    [all, selectedEntryId]
  );
  const selectedRowIndex = React.useMemo(
    () =>
      selectedEntryId
        ? all.findIndex((entry) => entry.id === selectedEntryId)
        : -1,
    [all, selectedEntryId]
  );

  const handleRowSelect = React.useCallback(
    (entry: NetworkRequestEntry) => {
      // Capture the currently focused element so we can restore focus on close.
      // For mouse clicks this is the row itself; for keyboard activation it's
      // already focused — same outcome either way.
      const active = document.activeElement;
      if (active instanceof HTMLElement) {
        lastFocusedRef.current = active;
      }
      // Remember list scroll position so back returns the user to where they
      // were (cheap — single number read here, reapplied on close).
      savedScrollTopRef.current =
        findScrollParent(tabRootRef.current)?.scrollTop ?? 0;
      setSelectedEntryId(entry.id);
      setIsDrawerOpen(true);
    },
    []
  );

  const handleDrawerClose = React.useCallback(() => {
    setIsDrawerOpen(false);
    // Restore focus to the row that opened the detail, and the prior list
    // scroll position. Defer one frame so the list has re-rendered first.
    const el = lastFocusedRef.current;
    const top = savedScrollTopRef.current;
    requestAnimationFrame(() => {
      const scroller = findScrollParent(tabRootRef.current);
      if (scroller) scroller.scrollTop = top;
      if (el && document.body.contains(el)) el.focus();
    });
    // Keep selectedEntryId so reopening keeps the same row marked selected.
  }, []);

  // Shared toast (lifted from Console's pattern). The drawer uses this too
  // so copy feedback shows in a consistent location and click-outside-the-
  // drawer doesn't dismiss while a toast is up.
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

  const tabRootRef = React.useRef<HTMLDivElement | null>(null);

  // Live per-filter counts (computed against ALL entries, not the filtered set,
  // so the badge on each chip reflects the universe — not how the current
  // intersection narrows things).
  const counts = React.useMemo(() => {
    let errors = 0;
    let xhr = 0;
    let fetchN = 0;
    let doc = 0;
    for (const e of all) {
      if (isErrorish(e)) errors += 1;
      if (e.source === "xhr") xhr += 1;
      else if (e.source === "fetch") fetchN += 1;
      if (isDocLike(e)) doc += 1;
    }
    return { errors, xhr, fetch: fetchN, doc, all: all.length };
  }, [all]);

  const anyFilterActive =
    filters.errorsOnly || filters.sources.size > 0 || filters.doc || search.length > 0;

  const resetFilters = () => {
    setFilters({ errorsOnly: false, sources: new Set(), doc: false });
    setRawSearch("");
  };

  const toggleAll = () => {
    if (anyFilterActive) {
      resetFilters();
    }
  };

  const toggleErrors = () =>
    setFilters((f) => ({ ...f, errorsOnly: !f.errorsOnly }));

  const toggleSource = (s: SourceFilter) =>
    setFilters((f) => {
      const next = new Set(f.sources);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return { ...f, sources: next };
    });

  const toggleDoc = () => setFilters((f) => ({ ...f, doc: !f.doc }));

  // Stable index map: ALL entries → original index. Filter ops preserve
  // original index so the row-number column reflects the captured order
  // even when filters hide rows.
  const indexedAll = React.useMemo(
    () => all.map((entry, originalIndex) => ({ entry, originalIndex })),
    [all]
  );
  const indexedFiltered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return indexedAll.filter(({ entry: e }) => {
      if (filters.errorsOnly && !isErrorish(e)) return false;
      // The source filter only exposes "fetch"/"xhr" chips. Entries from the
      // pre-instrumentation recovery layers ("resource-timing", "beacon") have no
      // chip, so they must NOT be excluded by an active fetch/xhr filter — only
      // apply the membership test to the two filterable sources.
      if (
        filters.sources.size > 0 &&
        (e.source === "fetch" || e.source === "xhr") &&
        !filters.sources.has(e.source)
      ) {
        return false;
      }
      if (filters.doc && !isDocLike(e)) return false;
      if (q && !e.url.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [indexedAll, filters, search]);

  return (
    <div className="relative" ref={tabRootRef}>
      <style>{`
        .nettab-chip {
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
          background: transparent;
        }
        .nettab-chip:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
        .nettab-chip-count {
          font-size: 10.5px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          padding: 0 5px;
          border-radius: 999px;
          min-width: 16px;
          text-align: center;
        }
        .nettab-search {
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
        .nettab-search::placeholder { color: var(--text-placeholder); }
        .nettab-search:hover { border-color: var(--border-strong); }
        .nettab-search:focus {
          background: var(--surface);
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(90,73,191,0.10);
        }
        .nettab-search-clear {
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
        .nettab-search-clear:hover {
          background: var(--surface-hover);
          color: var(--text-heading);
        }

        .nettab-list {
          border-top: 1px solid var(--border);
        }
        .nettab-row {
          display: grid;
          grid-template-columns: 28px 52px 56px minmax(0, 1fr) minmax(0, 1fr) 60px 56px;
          align-items: center;
          gap: 8px;
          height: 30px;
          padding: 0 10px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background-color 120ms ease;
          font-size: 11.5px;
          color: var(--text-heading);
          position: relative;
        }
        .nettab-row:hover {
          background: var(--surface-hover);
        }
        .nettab-row:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: -2px;
        }
        .nettab-row.is-selected {
          background: var(--surface-hover);
        }
        .nettab-row.is-selected::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--brand);
        }
        .nettab-row.is-errored {
          background: rgba(229, 72, 77, 0.04);
        }
        .nettab-row.is-errored:hover {
          background: rgba(229, 72, 77, 0.07);
        }

        .nettab-cell-num {
          font-size: 10px;
          font-variant-numeric: tabular-nums;
          color: var(--text-placeholder);
          text-align: right;
          padding-right: 2px;
        }
        /* Status & method badges read as tinted monospace pills (the marketing
           Network rows' treatment): a faint background + hairline border in the
           badge's own colour, so they separate from prose and the status colour
           is instantly scannable. Colour is supplied per-badge via --badge-color
           / --badge-bg / --badge-border so a single rule serves every variant. */
        .nettab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 19px;
          padding: 0 6px;
          border-radius: 5px;
          font-size: 10.5px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.01em;
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          line-height: 1;
          color: var(--badge-color, var(--text-secondary));
          background: var(--badge-bg, transparent);
          border: 1px solid var(--badge-border, transparent);
        }
        .nettab-cell-name {
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-heading);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .nettab-cell-domain {
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 10.5px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .nettab-cell-type {
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 10.5px;
          color: var(--text-secondary);
        }
        .nettab-cell-time {
          font-size: 10.5px;
          font-variant-numeric: tabular-nums;
          text-align: right;
          padding-right: 2px;
        }
        .nettab-status-errored {
          text-decoration: line-through;
          text-decoration-color: currentColor;
          text-decoration-thickness: 1px;
        }

        @keyframes nettab-pulse {
          0%   { opacity: 0.40; }
          50%  { opacity: 0.85; }
          100% { opacity: 0.40; }
        }
        .nettab-pending {
          animation: nettab-pulse 2s ease-in-out infinite;
        }

        .nettab-header-row {
          display: grid;
          grid-template-columns: 28px 52px 56px minmax(0, 1fr) minmax(0, 1fr) 60px 56px;
          gap: 8px;
          padding: 0 10px;
          height: 24px;
          align-items: center;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-tertiary);
          border-bottom: 1px solid var(--border);
          background: var(--surface-subtle);
        }
        .nettab-header-cell-num { text-align: right; padding-right: 2px; }
        .nettab-header-cell-time { text-align: right; padding-right: 2px; }

        .nettab-clear-btn {
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
        .nettab-clear-btn:hover {
          background: var(--surface-subtle);
          border-color: var(--border-strong);
        }
        .nettab-clear-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .nettab-chip,
          .nettab-search,
          .nettab-row,
          .nettab-pending {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* Full-width detail replaces the list when a row is selected (in-flow
          swap, not an overlay) so it spans the panel content width at every
          width in the 360–720px resize range. Back returns to the list. */}
      {isDrawerOpen && selectedEntry ? (
        <NetworkRequestDrawer
          entry={selectedEntry}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          onToast={showToast}
        />
      ) : (
        <>
          <div className="px-4 pt-4 pb-3">
            <FilterBar
              filters={filters}
              counts={counts}
              anyFilterActive={anyFilterActive}
              onToggleAll={toggleAll}
              onToggleErrors={toggleErrors}
              onToggleSource={toggleSource}
              onToggleDoc={toggleDoc}
            />

            <div className="relative mt-3">
              <input
                ref={searchInputRef}
                type="text"
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
                placeholder="Filter URLs"
                aria-label="Filter network requests by URL"
                className="nettab-search"
                spellCheck={false}
                autoComplete="off"
              />
              {rawSearch ? (
                <button
                  type="button"
                  className="nettab-search-clear"
                  aria-label="Clear search"
                  onClick={() => {
                    setRawSearch("");
                    searchInputRef.current?.focus();
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden fill="none">
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

          <div className="pb-6">
            {all.length === 0 ? (
              <div className="px-4 pt-6 pb-2">
                <CanvasEmptyState
                  illustration={<NoActivityIllu />}
                  title="No network activity captured for this ticket."
                  description="Network requests during the page session will appear here."
                  density="compact"
                />
              </div>
            ) : indexedFiltered.length === 0 ? (
              <FilterEmptyState onClear={resetFilters} total={totalCount} />
            ) : (
              <div>
                <div className="nettab-header-row" aria-hidden="true">
                  <div className="nettab-header-cell-num">#</div>
                  <div>Status</div>
                  <div>Method</div>
                  <div>Name</div>
                  <div>Domain</div>
                  <div>Type</div>
                  <div className="nettab-header-cell-time">Time</div>
                </div>
                <div className="nettab-list" role="group" aria-label="Captured network requests">
                  {indexedFiltered.map(({ entry, originalIndex }) => (
                    <RequestRow
                      key={entry.id}
                      entry={entry}
                      rowNumber={originalIndex + 1}
                      isSelected={selectedRowIndex === originalIndex}
                      onSelect={() => handleRowSelect(entry)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div aria-live="polite" aria-atomic="true">
        {toast ? (
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "20%",
              transform: "translateX(-50%)",
              padding: "6px 12px",
              background: "var(--text-heading)",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 999,
              boxShadow: "var(--shadow-md)",
              pointerEvents: "none",
              zIndex: 8,
            }}
          >
            {toast}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponents                                                       */
/* ------------------------------------------------------------------ */

function FilterBar({
  filters,
  counts,
  anyFilterActive,
  onToggleAll,
  onToggleErrors,
  onToggleSource,
  onToggleDoc,
}: {
  filters: Filters;
  counts: { errors: number; xhr: number; fetch: number; doc: number; all: number };
  anyFilterActive: boolean;
  onToggleAll: () => void;
  onToggleErrors: () => void;
  onToggleSource: (s: SourceFilter) => void;
  onToggleDoc: () => void;
}) {
  const allActive = !anyFilterActive;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Chip
        label="All"
        count={counts.all}
        active={allActive}
        dotColor="var(--text-tertiary)"
        onClick={onToggleAll}
      />
      <Chip
        label="Errors only"
        count={counts.errors}
        active={filters.errorsOnly}
        dotColor="var(--color-danger)"
        onClick={onToggleErrors}
      />
      <Chip
        label="XHR"
        count={counts.xhr}
        active={filters.sources.has("xhr")}
        dotColor="var(--brand)"
        onClick={() => onToggleSource("xhr")}
      />
      <Chip
        label="Fetch"
        count={counts.fetch}
        active={filters.sources.has("fetch")}
        dotColor="var(--brand)"
        onClick={() => onToggleSource("fetch")}
      />
      <Chip
        label="Doc"
        count={counts.doc}
        active={filters.doc}
        dotColor="var(--text-tertiary)"
        onClick={onToggleDoc}
      />
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  dotColor,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  dotColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="nettab-chip"
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
        className="nettab-chip-count"
        style={{
          color: active ? "var(--text-secondary)" : "var(--text-placeholder)",
        }}
      >
        {count}
      </span>
    </button>
  );
}

function RequestRow({
  entry,
  rowNumber,
  isSelected,
  onSelect,
}: {
  entry: NetworkRequestEntry;
  rowNumber: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const lifecycle = classifyLifecycle(entry);
  const pending = isPending(entry);
  const errored = entry.errored;
  const statusPill = statusBadgeColors(lifecycle);
  const methodPill = methodColors(entry.method);
  const name = extractName(entry.url);
  const domain = extractDomain(entry.url);
  const type = compactContentType(entry.responseContentType);
  const time = formatDuration(entry.durationMs);
  const timeC = timeColor(entry.durationMs);

  const statusText =
    entry.status != null
      ? String(entry.status)
      : errored
      ? "ERR"
      : "—";

  const className = [
    "nettab-row",
    isSelected ? "is-selected" : "",
    errored ? "is-errored" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`${entry.method} ${entry.url}, status ${statusText}, ${time}. Open details.`}
    >
      <div className="nettab-cell-num">{rowNumber}</div>

      <div>
        <span
          className={`nettab-badge${errored ? " nettab-status-errored" : ""}${
            pending ? " nettab-pending" : ""
          }`}
          style={badgeVars(statusPill)}
          title={
            pending
              ? "Request still pending — page navigated or buffer flushed before response"
              : entry.statusText ?? undefined
          }
        >
          {statusText}
        </span>
      </div>

      <div>
        <span className="nettab-badge" style={badgeVars(methodPill)}>
          {entry.method.toUpperCase()}
        </span>
      </div>

      <div className="nettab-cell-name" title={entry.url}>
        {name}
      </div>

      <div className="nettab-cell-domain" title={domain}>
        {domain}
      </div>

      <div className="nettab-cell-type">{type}</div>

      <div
        className={`nettab-cell-time${pending ? " nettab-pending" : ""}`}
        style={{ color: timeC }}
      >
        {time}
      </div>
    </div>
  );
}

function FilterEmptyState({
  onClear,
  total,
}: {
  onClear: () => void;
  total: number;
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
        No requests match your filters
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
        {total} {total === 1 ? "request is" : "requests are"} available. Adjust
        the filter chips or clear the search to see them.
      </p>
      <button type="button" className="nettab-clear-btn" onClick={onClear}>
        Clear filters
      </button>
    </div>
  );
}

export default NetworkTabContent;
