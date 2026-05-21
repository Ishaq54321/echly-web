"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Download, AlertCircle, Info } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";
import { toDate } from "@/lib/utils/date";
import type { Workspace } from "@/lib/domain/workspace";

/** "June 17, 2026" — matches the cancel-pending banner copy. */
function formatLongDate(
  value: Parameters<typeof toDate>[0]
): string {
  const d = toDate(value);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/** "Jun 17, 2026" — short month, fits inline under the plan name. */
function formatShortDate(
  value: Parameters<typeof toDate>[0]
): string {
  const d = toDate(value);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

const EASE_OUT_200 = "200ms ease-out";

interface TransactionSummary {
  id: string;
  invoiceNumber: string | null;
  billedAt: string;
  total: string;
  status: "completed" | "paid" | "failed" | "refunded" | "pending";
  invoicePdfUrl: string | null;
}

type HistoryState =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "ready"; transactions: TransactionSummary[] };

/**
 * View B — shown to paid (Business or comp'd) owners. Current plan card,
 * payment method card, billing history table, and a subtle cancel link.
 * Comp'd workspaces hide the payment-method and cancel sections.
 */
export function BillingManagementView({
  workspace,
  perSeatPrice,
  portalLoading,
  onManageBilling,
}: {
  workspace: Workspace;
  /** Effective per-seat price for the current cycle, or null if unknown. */
  perSeatPrice: number | null;
  portalLoading: boolean;
  onManageBilling: () => void;
}) {
  const billing = workspace.billing;
  const isComped = billing?.manualOverride === true;
  const isSuspended = billing?.suspended === true;
  // Cancel-pending: a cancel is scheduled but the sub is still active until
  // `cancelAt`. Banner shows the grace period; the Cancellation section is
  // hidden (no point offering to cancel something already canceling).
  const cancelAtDate = formatLongDate(billing?.cancelAt);
  const isCanceling = cancelAtDate !== "";
  const cycle = billing?.billingCycle === "annual" ? "annual" : "monthly";
  const seats = billing?.seats ?? 1;
  const card = billing?.paymentMethod ?? null;

  const fmt = (n: number) =>
    `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;

  const [history, setHistory] = useState<HistoryState>({ phase: "loading" });
  const [showAll, setShowAll] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setHistory({ phase: "loading" });
    try {
      const res = await authFetch("/api/billing/history");
      if (!res || !res.ok) {
        setHistory({ phase: "error" });
        return;
      }
      const json = (await res.json()) as {
        success?: boolean;
        data?: { transactions?: TransactionSummary[] };
      };
      if (!json.success) {
        setHistory({ phase: "error" });
        return;
      }
      setHistory({
        phase: "ready",
        transactions: json.data?.transactions ?? [],
      });
    } catch {
      setHistory({ phase: "error" });
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleDownload = async (txId: string) => {
    setDownloadingId(txId);
    try {
      const res = await authFetch(`/api/billing/invoice/${txId}`);
      if (!res || !res.ok) return;
      const json = (await res.json()) as {
        success?: boolean;
        data?: { url?: string };
      };
      if (json.success && json.data?.url) {
        window.open(json.data.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Surface nothing — the row stays; user can retry.
    } finally {
      setDownloadingId(null);
    }
  };

  const isEnterprise = billing?.plan === "enterprise";
  const planLabel = isEnterprise ? "Enterprise" : "Business";
  const seatLabel = seats === 1 ? "seat" : "seats";

  // `perSeatPrice` is the cycle-effective per-seat *monthly* rate (annual is
  // billed at the discounted monthly-equivalent). Total is what they actually
  // pay each cycle: monthly → seats × rate; annual → seats × rate × 12.
  const totalAmount =
    perSeatPrice != null
      ? cycle === "annual"
        ? seats * perSeatPrice * 12
        : seats * perSeatPrice
      : null;

  const priceLine = isComped
    ? "Complimentary"
    : isEnterprise
    ? "Custom"
    : totalAmount != null
    ? `${fmt(totalAmount)} /${cycle === "annual" ? "yr" : "mo"}`
    : "—";

  const subLine = isComped
    ? "Granted by Annote — no payment required"
    : isEnterprise
    ? `${seats} ${seatLabel} • Custom plan`
    : perSeatPrice != null
    ? `${seats} ${seatLabel} × ${fmt(perSeatPrice)} • ${
        cycle === "annual" ? "Billed annually" : "Monthly billing"
      }`
    : `${cycle === "annual" ? "Annual" : "Monthly"} billing • ${seats} ${seatLabel}`;

  // Renewal date — quiet third line. Hidden for comp'd (no cycle), Enterprise
  // (custom contract), cancel-pending (banner already states the end date),
  // and when the date is absent/invalid (returns "").
  const renewalDate = formatShortDate(billing?.nextBilledAt);
  const showRenewalDate =
    renewalDate !== "" && !isComped && !isEnterprise && !isCanceling;

  return (
    <div className="space-y-6">
      {/* ── Cancel-pending banner (grace period) ─────────────────────── */}
      {isCanceling && (
        <div
          className="flex items-start gap-3 rounded-xl p-4"
          style={{
            background: "var(--color-warning-bg)",
            border: "1px solid var(--color-warning-border)",
          }}
        >
          <Info
            className="mt-0.5 h-5 w-5 flex-shrink-0"
            style={{ color: "var(--color-warning)" }}
            aria-hidden
          />
          <p className="text-sm" style={{ color: "var(--text-heading)" }}>
            Your subscription is set to cancel on{" "}
            <strong>{cancelAtDate}</strong>. You&apos;ll keep access to{" "}
            {planLabel} until then.
          </p>
        </div>
      )}

      {/* ── Section 1: Current plan ──────────────────────────────────── */}
      <div
        className="rounded-[var(--radius-lg)] p-5 md:p-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-start justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Current plan
          </span>
          {!isComped && (
            <StatusBadge
              label={isSuspended ? "Suspended" : "Active"}
              tone={isSuspended ? "danger" : "success"}
            />
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-4">
          <h2
            className="text-2xl font-semibold leading-tight"
            style={{ color: "var(--text-heading)" }}
          >
            {planLabel}
          </h2>
          <p
            className="whitespace-nowrap text-xl font-medium"
            style={{ color: "var(--text-heading)" }}
          >
            {priceLine}
          </p>
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          {subLine}
        </p>
        {showRenewalDate && (
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            Renews on {renewalDate}
          </p>
        )}
      </div>

      {/* ── Section 2: Payment method (hidden for comp'd) ────────────── */}
      {!isComped && (
        <div
          className="rounded-[var(--radius-lg)] p-5 md:p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h3
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Payment method
          </h3>

          <div className="mt-4 flex items-center gap-3">
            <CreditCard
              size={20}
              aria-hidden
              style={{ color: "var(--text-tertiary)" }}
            />
            <span
              className="text-sm"
              style={{ color: "var(--text-heading)" }}
            >
              {card
                ? `${capitalize(card.brand)} ending in ${card.last4}`
                : "No payment method on file"}
            </span>
          </div>

          <button
            type="button"
            onClick={onManageBilling}
            disabled={portalLoading}
            className="mt-6 inline-flex h-[40px] items-center justify-center gap-2 rounded-[var(--radius-btn)] px-4 text-sm font-medium disabled:opacity-60"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-heading)",
              transition: `background-color ${EASE_OUT_200}`,
            }}
            onMouseEnter={(e) => {
              if (!portalLoading)
                e.currentTarget.style.background = "var(--surface-subtle)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {portalLoading ? "Opening…" : "Update payment method"}
          </button>
        </div>
      )}

      {/* ── Section 3: Billing history ───────────────────────────────── */}
      <div
        className="rounded-[var(--radius-lg)] p-5 md:p-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h3
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Billing history
        </h3>

        <div className="mt-5">
          {history.phase === "loading" && <HistorySkeleton />}

          {history.phase === "error" && (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertCircle
                size={22}
                aria-hidden
                style={{ color: "var(--color-danger)" }}
              />
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Couldn&apos;t load billing history.
              </p>
              <button
                type="button"
                onClick={() => void loadHistory()}
                className="mt-3 text-sm font-medium"
                style={{ color: "var(--brand-text)" }}
              >
                Try again
              </button>
            </div>
          )}

          {history.phase === "ready" &&
            history.transactions.length === 0 && (
              <p
                className="py-6 text-center text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                No billing history yet
              </p>
            )}

          {history.phase === "ready" &&
            history.transactions.length > 0 && (
              <HistoryTable
                transactions={
                  showAll
                    ? history.transactions
                    : history.transactions.slice(0, 5)
                }
                downloadingId={downloadingId}
                onDownload={(id) => void handleDownload(id)}
              />
            )}

          {history.phase === "ready" &&
            !showAll &&
            history.transactions.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-4 text-sm font-medium"
                style={{ color: "var(--brand-text)" }}
              >
                Show all ({history.transactions.length})
              </button>
            )}
        </div>
      </div>

      {/* ── Section 4: Cancellation ──────────────────────────────────────
          Hidden for comp'd / suspended workspaces and when a cancel is
          already scheduled (the banner above covers that state). */}
      {!isComped && !isSuspended && !isCanceling && (
        <div className="mt-12">
          <h3
            className="mb-4 text-lg font-semibold"
            style={{ color: "var(--text-heading)" }}
          >
            Cancellation
          </h3>
          <div
            className="flex items-center justify-between gap-4 border-t py-4"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="text-sm"
              style={{ color: "var(--text-heading)" }}
            >
              Cancel plan
            </span>
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="h-9 rounded-[var(--radius-btn)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--color-danger)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCancelModal && (
        <CancelModal
          portalLoading={portalLoading}
          onClose={() => setShowCancelModal(false)}
          onContinue={() => {
            setShowCancelModal(false);
            onManageBilling();
          }}
        />
      )}
    </div>
  );
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "danger";
}) {
  const palette =
    tone === "success"
      ? {
          bg: "var(--color-success-bg)",
          fg: "var(--color-success)",
          bd: "var(--color-success-border)",
        }
      : {
          bg: "var(--color-danger-bg)",
          fg: "var(--color-danger)",
          bd: "var(--color-danger-border)",
        };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.bd}`,
      }}
    >
      {label}
    </span>
  );
}

function HistoryTable({
  transactions,
  downloadingId,
  onDownload,
}: {
  transactions: TransactionSummary[];
  downloadingId: string | null;
  onDownload: (id: string) => void;
}) {
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse">
        <thead>
          <tr>
            {["Date", "Invoice", "Amount", "Status", ""].map((h, i) => (
              <th
                key={h || `col-${i}`}
                className="py-3 text-left text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-tertiary)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <td
                className="py-4 text-sm font-medium"
                style={{ color: "var(--text-heading)" }}
              >
                {fmtDate(tx.billedAt)}
              </td>
              <td
                className="py-4 font-mono text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {tx.invoiceNumber ?? "—"}
              </td>
              <td
                className="py-4 text-sm font-medium tabular-nums"
                style={{ color: "var(--text-heading)" }}
              >
                {tx.total}
              </td>
              <td className="py-4">
                <TxStatusPill status={tx.status} />
              </td>
              <td className="py-4 text-right">
                <button
                  type="button"
                  onClick={() => onDownload(tx.id)}
                  disabled={downloadingId === tx.id}
                  className="inline-flex items-center gap-1.5 text-sm font-medium disabled:opacity-60"
                  style={{ color: "var(--brand-text)" }}
                >
                  <Download size={14} aria-hidden />
                  {downloadingId === tx.id ? "Opening…" : "Download"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TxStatusPill({
  status,
}: {
  status: TransactionSummary["status"];
}) {
  const map: Record<
    TransactionSummary["status"],
    { label: string; bg: string; fg: string; bd: string }
  > = {
    completed: {
      label: "Paid",
      bg: "var(--color-success-bg)",
      fg: "var(--color-success)",
      bd: "var(--color-success-border)",
    },
    paid: {
      label: "Paid",
      bg: "var(--color-success-bg)",
      fg: "var(--color-success)",
      bd: "var(--color-success-border)",
    },
    pending: {
      label: "Pending",
      bg: "var(--brand-subtle)",
      fg: "var(--brand-text)",
      bd: "var(--brand-muted)",
    },
    failed: {
      label: "Failed",
      bg: "var(--color-danger-bg)",
      fg: "var(--color-danger)",
      bd: "var(--color-danger-border)",
    },
    refunded: {
      label: "Refunded",
      bg: "var(--surface-subtle)",
      fg: "var(--text-secondary)",
      bd: "var(--border)",
    },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.bd}`,
      }}
    >
      {s.label}
    </span>
  );
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <span className="echly-skeleton h-4 w-24 rounded" aria-hidden />
          <span className="echly-skeleton h-4 w-20 rounded" aria-hidden />
          <span className="echly-skeleton h-4 w-16 rounded" aria-hidden />
          <span className="echly-skeleton h-4 w-20 rounded" aria-hidden />
        </div>
      ))}
    </div>
  );
}

function CancelModal({
  portalLoading,
  onClose,
  onContinue,
}: {
  portalLoading: boolean;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <ModalPortal>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          background: "var(--surface-overlay)",
          zIndex: MODAL_LAYER_Z_INDEX,
        }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Cancel subscription"
      >
        <div
          className="w-full max-w-md rounded-[var(--radius-lg)] p-7"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-heading)" }}
          >
            Cancel your subscription?
          </h3>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            You&apos;ll keep access to Business until your next billing date.
            Then your workspace moves to Starter.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[40px] items-center rounded-[var(--radius-btn)] px-4 text-sm font-medium"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-heading)",
              }}
            >
              Keep my subscription
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={portalLoading}
              className="inline-flex h-[40px] items-center rounded-[var(--radius-btn)] px-4 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--brand)" }}
            >
              {portalLoading ? "Opening…" : "Continue to portal"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
