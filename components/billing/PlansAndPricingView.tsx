"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Sparkles, Info } from "lucide-react";
import type { PlanCatalogItem } from "@/lib/hooks/usePlanCatalog";

const EASE_OUT_200 = "200ms ease-out";

const SALES_MAILTO =
  "mailto:sales@annote.app?subject=Annote%20Enterprise%20inquiry";

/**
 * View A — shown to Starter owners. A Loom-inspired 3-column comparison
 * (Starter / Business / Enterprise) with a seat-count selector, a
 * monthly/annual toggle and a condensed feature table. Goal: convert to
 * Business.
 *
 * Seat count is prefilled with the workspace's current member count
 * (`memberFloor`) and may be increased but not decreased below it — the
 * input still accepts a lower value, but pricing math clamps to the floor
 * and an info banner explains why (you can only shrink by removing members
 * in Settings → Workspace). The effective seat count flows into checkout.
 *
 * Checkout itself stays in BillingTab (it owns the Paddle instance + event
 * wiring); this view just signals intent via `onUpgrade(cycle, seatCount)`.
 */
export function PlansAndPricingView({
  starter,
  business,
  enterprise,
  memberFloor,
  checkoutLoading,
  onUpgrade,
}: {
  starter: PlanCatalogItem | null;
  business: PlanCatalogItem | null;
  enterprise: PlanCatalogItem | null;
  /** Current workspace member count — the floor for the seat selector. */
  memberFloor: number;
  checkoutLoading: boolean;
  onUpgrade: (cycle: "monthly" | "annual", seatCount: number) => void;
}) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const floor = Math.max(memberFloor, 1);
  const [seatCountInput, setSeatCountInput] = useState(floor);

  // Pricing is computed at the floor even if the user types below it; the
  // banner explains the discrepancy rather than silently snapping the input.
  const effectiveSeatCount = Math.max(seatCountInput, floor);
  const showFloorInfo = seatCountInput < floor;

  const fmt = (n: number) =>
    `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;

  const bizMonthly = business?.pricePerSeat ?? null;
  const bizAnnualPerMo =
    business?.annualPricePerSeat ?? business?.pricePerSeat ?? null;

  const businessPrice = useMemo(() => {
    const seatNoun = effectiveSeatCount === 1 ? "seat" : "seats";
    if (billingCycle === "monthly") {
      const total =
        bizMonthly != null ? bizMonthly * effectiveSeatCount : null;
      return {
        big: total != null ? fmt(total) : "—",
        unit: "/mo",
        sub:
          bizMonthly != null
            ? `for ${effectiveSeatCount} ${seatNoun} × ${fmt(
                bizMonthly
              )}/seat/mo`
            : "billed monthly",
      };
    }
    const perMo = bizAnnualPerMo;
    const annualTotal =
      perMo != null ? perMo * effectiveSeatCount * 12 : null;
    return {
      big: annualTotal != null ? fmt(annualTotal) : "—",
      unit: "/year",
      sub:
        perMo != null
          ? `for ${effectiveSeatCount} ${seatNoun} × ${fmt(
              perMo
            )}/seat/mo, billed annually`
          : "billed annually",
    };
  }, [billingCycle, bizMonthly, bizAnnualPerMo, effectiveSeatCount]);

  const handleContactSales = () => {
    window.location.href = SALES_MAILTO;
  };

  return (
    <div>
      {/* ── Heading ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2
          className="text-2xl font-semibold"
          style={{ color: "var(--text-heading)" }}
        >
          Choose the right plan for you
        </h2>
      </div>

      {/* ── Seat count + billing cycle row ───────────────────────────── */}
      <PlansAndPricingHeader
        seatCount={seatCountInput}
        setSeatCount={setSeatCountInput}
        billingCycle={billingCycle}
        setBillingCycle={setBillingCycle}
      />

      {/* ── Floor info banner ────────────────────────────────────────── */}
      {showFloorInfo && (
        <div
          className="mb-6 flex items-start gap-2 rounded-lg p-3"
          style={{
            background: "var(--color-info-bg)",
            border: "1px solid var(--color-info-border)",
          }}
        >
          <Info
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            style={{ color: "var(--color-info)" }}
            aria-hidden
          />
          <p className="text-sm" style={{ color: "var(--text-heading)" }}>
            You currently have {floor} {floor === 1 ? "user" : "users"}. You
            can continue with this user count or enter a higher number.
          </p>
        </div>
      )}

      {/* ── Plan cards ───────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Starter */}
        <PlanColumn
          name="Starter"
          price="$0"
          priceUnit=""
          priceSub="Free forever"
          features={[
            `Up to ${fmtNum(starter?.maxMembers, 5)} members`,
            `${fmtNum(starter?.maxFeedbackPerMonth, 50)} tickets/mo`,
            `${fmtNum(starter?.aiImprovementsPerMonth, 300)} AI improvements/mo`,
            "Basic insights",
          ]}
          cta={
            <button
              type="button"
              disabled
              className="inline-flex h-12 w-full cursor-default items-center justify-center rounded-[var(--radius-btn)] text-sm font-medium"
              style={{
                background: "var(--surface-subtle)",
                color: "var(--text-tertiary)",
              }}
            >
              Current plan
            </button>
          }
        />

        {/* Business — recommended */}
        <PlanColumn
          name="Business"
          recommended
          price={businessPrice.big}
          priceUnit={businessPrice.unit}
          priceSub={businessPrice.sub}
          features={[
            "Unlimited members",
            `${fmtNum(business?.aiImprovementsPerMonth, 1500)} AI improvements/mo`,
            "Unlimited tickets",
            "Priority support",
            "Custom branding",
            "Integrations",
          ]}
          cta={
            <button
              type="button"
              onClick={() => onUpgrade(billingCycle, effectiveSeatCount)}
              disabled={checkoutLoading}
              className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-btn)] text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: "var(--brand)", transition: `opacity ${EASE_OUT_200}` }}
              onMouseEnter={(e) => {
                if (!checkoutLoading) e.currentTarget.style.opacity = "0.95";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {checkoutLoading ? "Opening checkout…" : "Upgrade to Business"}
            </button>
          }
        />

        {/* Enterprise */}
        <PlanColumn
          name="Enterprise"
          price="Custom"
          priceUnit=""
          priceSub="Talk to us"
          features={[
            "Everything in Business",
            "SSO",
            "Audit logs",
            "Dedicated support",
          ]}
          cta={
            <button
              type="button"
              onClick={handleContactSales}
              className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-btn)] text-sm font-medium transition-colors"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-heading)",
                transition: `background-color ${EASE_OUT_200}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-subtle)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface)";
              }}
            >
              Contact sales
            </button>
          }
        />
      </div>

      {/* ── Comparison table ─────────────────────────────────────────── */}
      <div className="mt-12">
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--text-heading)" }}
        >
          Compare features
        </h3>
        <div className="mt-4 overflow-x-auto">
          <ComparisonTable
            starter={starter}
            business={business}
            enterprise={enterprise}
            seatCount={effectiveSeatCount}
            billingCycle={billingCycle}
          />
        </div>
      </div>
    </div>
  );
}

function fmtNum(n: number | null | undefined, fallback: number): string {
  const v = n ?? fallback;
  return v.toLocaleString();
}

function PlansAndPricingHeader({
  seatCount,
  setSeatCount,
  billingCycle,
  setBillingCycle,
}: {
  seatCount: number;
  setSeatCount: (n: number) => void;
  billingCycle: "monthly" | "annual";
  setBillingCycle: (c: "monthly" | "annual") => void;
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      {/* Left: How many people */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="seat-count"
          className="text-sm font-medium"
          style={{ color: "var(--text-heading)" }}
        >
          How many people?
        </label>
        <input
          id="seat-count"
          type="number"
          min={1}
          value={seatCount}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 1) setSeatCount(val);
          }}
          className="h-9 w-20 rounded-md px-3 text-sm"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-heading)",
          }}
        />

        {/* Info icon with tooltip */}
        <div
          className="relative"
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
        >
          <div
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full"
            style={{ background: "var(--text-heading)" }}
            aria-describedby={tooltipOpen ? "seat-count-tooltip" : undefined}
          >
            <Info className="h-3 w-3" style={{ color: "white" }} aria-hidden />
          </div>

          {tooltipOpen && (
            <div
              id="seat-count-tooltip"
              className="absolute left-7 top-1/2 z-50 w-72 -translate-y-1/2 rounded-lg p-3 text-xs shadow-lg"
              style={{
                background: "var(--text-heading)",
                color: "white",
              }}
              role="tooltip"
            >
              To reduce the number of users on your plan, you&apos;ll need to{" "}
              <a
                href="/settings?tab=workspace"
                className="underline"
                style={{ color: "white" }}
              >
                remove users first
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Right: Billing cycle */}
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--text-tertiary)" }}
        >
          Billing cycle
        </span>
        <div
          className="inline-flex items-center gap-1 rounded-[var(--radius-btn)] p-1"
          style={{ background: "var(--surface-subtle)" }}
          role="tablist"
          aria-label="Billing cycle"
        >
          <CycleButton
            label="Monthly"
            active={billingCycle === "monthly"}
            onClick={() => setBillingCycle("monthly")}
          />
          <CycleButton
            label="Annual"
            active={billingCycle === "annual"}
            onClick={() => setBillingCycle("annual")}
            suffix={
              <span
                className="ml-1.5 text-xs font-medium"
                style={{ color: "var(--color-success)" }}
              >
                Save 20%
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
}

function CycleButton({
  label,
  active,
  onClick,
  suffix,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  suffix?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="inline-flex items-center rounded-[var(--radius-sm,6px)] px-4 py-1.5 text-sm font-medium"
      style={{
        background: active ? "var(--surface)" : "transparent",
        color: active ? "var(--text-heading)" : "var(--text-secondary)",
        border: active
          ? "1px solid var(--border)"
          : "1px solid transparent",
        transition: `background-color ${EASE_OUT_200}, color ${EASE_OUT_200}`,
      }}
    >
      {label}
      {suffix}
    </button>
  );
}

function PlanColumn({
  name,
  recommended,
  price,
  priceUnit,
  priceSub,
  features,
  cta,
}: {
  name: string;
  recommended?: boolean;
  price: string;
  priceUnit: string;
  priceSub: string;
  features: string[];
  cta: ReactNode;
}) {
  return (
    <div
      className="relative flex flex-col rounded-[var(--radius-lg)] p-8"
      style={{
        background: "var(--surface)",
        border: recommended
          ? "1px solid var(--brand)"
          : "1px solid var(--border)",
        boxShadow: recommended ? "0 0 0 1px var(--brand)" : "none",
      }}
    >
      {recommended && (
        <span
          className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white"
          style={{ background: "var(--brand)" }}
        >
          <Sparkles size={11} aria-hidden />
          Recommended
        </span>
      )}

      <h3
        className="text-lg font-semibold"
        style={{ color: "var(--text-heading)" }}
      >
        {name}
      </h3>

      <div className="mt-4 flex items-end gap-1">
        <span
          className="text-3xl font-bold leading-none"
          style={{ color: "var(--text-heading)" }}
        >
          {price}
        </span>
        {priceUnit && (
          <span
            className="pb-0.5 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {priceUnit}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
        {priceSub}
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <Check
              size={16}
              strokeWidth={2.5}
              aria-hidden
              style={{
                color: "var(--color-success)",
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <span style={{ color: "var(--text-secondary)" }}>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">{cta}</div>
    </div>
  );
}

function ComparisonTable({
  starter,
  business,
  enterprise,
  seatCount,
  billingCycle,
}: {
  starter: PlanCatalogItem | null;
  business: PlanCatalogItem | null;
  enterprise: PlanCatalogItem | null;
  seatCount: number;
  billingCycle: "monthly" | "annual";
}) {
  const limit = (n: number | null | undefined) =>
    n == null ? "Unlimited" : n.toLocaleString();

  const fmt = (n: number) =>
    `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;

  const priceCell = (item: PlanCatalogItem | null): ReactNode => {
    if (!item) return "—";
    const monthly = item.pricePerSeat;
    const annualPerMo = item.annualPricePerSeat ?? item.pricePerSeat;
    if (monthly == null && annualPerMo == null) return "Custom";
    if (monthly === 0) return "Free";
    if (billingCycle === "monthly") {
      return monthly != null ? `${fmt(monthly * seatCount)}/mo` : "—";
    }
    return annualPerMo != null
      ? `${fmt(annualPerMo * seatCount * 12)}/year`
      : "—";
  };

  const yes = (
    <Check
      size={16}
      strokeWidth={2.5}
      aria-hidden
      className="mx-auto"
      style={{ color: "var(--color-success)" }}
    />
  );
  const no = (
    <span style={{ color: "var(--text-tertiary)" }} aria-label="Not included">
      —
    </span>
  );

  const rows: Array<{
    label: string;
    starter: ReactNode;
    business: ReactNode;
    enterprise: ReactNode;
  }> = [
    {
      label: `Price (${seatCount} ${seatCount === 1 ? "seat" : "seats"})`,
      starter: starter ? "Free" : "—",
      business: priceCell(business),
      enterprise: "Custom",
    },
    {
      label: "Team members",
      starter: limit(starter?.maxMembers),
      business: limit(business?.maxMembers),
      enterprise: limit(enterprise?.maxMembers),
    },
    {
      label: "AI improvements/mo",
      starter: limit(starter?.aiImprovementsPerMonth),
      business: limit(business?.aiImprovementsPerMonth),
      enterprise: limit(enterprise?.aiImprovementsPerMonth),
    },
    {
      label: "Feedback tickets/mo",
      starter: limit(starter?.maxFeedbackPerMonth),
      business: limit(business?.maxFeedbackPerMonth),
      enterprise: limit(enterprise?.maxFeedbackPerMonth),
    },
    {
      label: "Priority support",
      starter: no,
      business: business?.prioritySupport === false ? no : yes,
      enterprise: yes,
    },
    {
      label: "Custom branding",
      starter: no,
      business: business?.customBranding ? yes : no,
      enterprise: yes,
    },
    {
      label: "Integrations",
      starter: no,
      business: yes,
      enterprise: yes,
    },
    { label: "SSO", starter: no, business: no, enterprise: yes },
    { label: "Audit logs", starter: no, business: no, enterprise: yes },
  ];

  return (
    <table className="w-full min-w-[520px] border-collapse">
      <thead>
        <tr>
          <th className="w-[40%] py-3 text-left" />
          {["Starter", "Business", "Enterprise"].map((h) => (
            <th
              key={h}
              className="py-3 text-center text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.label}
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <td
              className="py-4 text-sm"
              style={{ color: "var(--text-heading)" }}
            >
              {r.label}
            </td>
            <td
              className="py-4 text-center text-sm"
              style={{ color: "var(--text-heading)" }}
            >
              {r.starter}
            </td>
            <td
              className="py-4 text-center text-sm"
              style={{ color: "var(--text-heading)" }}
            >
              {r.business}
            </td>
            <td
              className="py-4 text-center text-sm"
              style={{ color: "var(--text-heading)" }}
            >
              {r.enterprise}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
