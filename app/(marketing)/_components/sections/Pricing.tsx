"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";

type Billing = "monthly" | "yearly";

type TierPricing = {
  price: number | null;
  period: string | null;
  billed?: string | null;
  original?: string | null;
  label?: string;
};

type TierData = {
  name: string;
  whoItsFor: string;
  pricing: Record<Billing, TierPricing>;
  cta: { label: string; href: string; variant: "primary" | "secondary" | "tertiary" };
  features: { header: string; items: readonly string[] };
};

const PRICING_TIERS: Record<"starter" | "business" | "enterprise", TierData> = {
  starter: {
    name: "Starter",
    whoItsFor: "Try Annote with your next QA pass",
    pricing: {
      monthly: { price: 0, period: "forever" },
      yearly: { price: 0, period: "forever" },
    },
    cta: { label: "Start free", href: "/signup", variant: "secondary" },
    features: {
      header: "Includes",
      items: [
        "1 member",
        "50 tickets total",
        "Voice-to-ticket AI",
        "Browser, OS, viewport metadata",
        "Public session links",
      ],
    },
  },
  business: {
    name: "Business",
    whoItsFor: "For agencies and product teams shipping client work",
    pricing: {
      monthly: { price: 24, period: "user / month", billed: null },
      yearly: {
        price: 19,
        period: "user / month",
        billed: "$228 / user / year",
        original: "$288 / user / year",
      },
    },
    cta: { label: "Get started", href: "/signup?plan=business", variant: "primary" },
    features: {
      header: "What you get",
      items: [
        "Unlimited team members",
        "Unlimited sessions and tickets",
        "Custom branding (your logo)",
        "Comments & collaboration",
        "Status, priority, assignee",
        "Priority support",
        "Audit log",
      ],
    },
  },
  enterprise: {
    name: "Enterprise",
    whoItsFor: "For organizations needing security, controls, and dedicated support",
    pricing: {
      monthly: { price: null, period: null, label: "Custom" },
      yearly: { price: null, period: null, label: "Custom" },
    },
    cta: { label: "Talk to sales", href: "/contact-sales", variant: "tertiary" },
    features: {
      header: "What you get",
      items: [
        "Everything in Business",
        "SSO (SAML, Google Workspace)",
        "Advanced security controls",
        "Custom contracts & SLA",
        "Dedicated success manager",
        "Custom integrations",
        "Procurement-friendly billing",
      ],
    },
  },
};

function BillingToggle({ value, onChange }: { value: Billing; onChange: (v: Billing) => void }) {
  return (
    <div className="billing-toggle" role="tablist" aria-label="Billing period">
      <button
        type="button"
        role="tab"
        aria-selected={value === "monthly"}
        className={`billing-toggle-option ${value === "monthly" ? "is-active" : ""}`}
        onClick={() => onChange("monthly")}
      >
        Monthly
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "yearly"}
        className={`billing-toggle-option ${value === "yearly" ? "is-active" : ""}`}
        onClick={() => onChange("yearly")}
      >
        Yearly
      </button>
    </div>
  );
}

function PricingTier({
  tier,
  billing,
  featured,
}: {
  tier: keyof typeof PRICING_TIERS;
  billing: Billing;
  featured?: boolean;
}) {
  const data = PRICING_TIERS[tier];
  const pricing = data.pricing[billing];

  return (
    <article className={`pricing-tier ${featured ? "pricing-tier--featured" : ""}`}>
      {featured && <div className="pricing-tier-badge">Recommended</div>}

      <div className="pricing-tier-header">
        <div className="pricing-tier-name">{data.name}</div>
        <div className="pricing-tier-tagline">{data.whoItsFor}</div>
      </div>

      <div className="pricing-tier-price-block">
        {pricing.price === 0 ? (
          <>
            <div className="pricing-tier-price">
              <span className="pricing-tier-price-currency">$</span>
              <span className="pricing-tier-price-number">0</span>
            </div>
            <div className="pricing-tier-price-period">Free forever</div>
          </>
        ) : pricing.price === null ? (
          <>
            <div className="pricing-tier-price pricing-tier-price--custom">Custom</div>
            <div className="pricing-tier-price-period">Tailored to your team</div>
          </>
        ) : (
          <>
            <div className="pricing-tier-price">
              <span className="pricing-tier-price-currency">$</span>
              <span className="pricing-tier-price-number">{pricing.price}</span>
              <span className="pricing-tier-price-period-inline">/ {pricing.period}</span>
            </div>
            {pricing.billed ? (
              <div className="pricing-tier-savings-row">
                <span className="pricing-tier-savings-chip">20% Savings</span>
                <span className="pricing-tier-savings-billed">Billed {pricing.billed}</span>
              </div>
            ) : featured ? (
              <div className="pricing-tier-price-period">Most teams settle here</div>
            ) : (
              <div className="pricing-tier-price-billed">&nbsp;</div>
            )}
          </>
        )}
      </div>

      <Link
        href={data.cta.href}
        className={`pricing-tier-cta pricing-tier-cta--${data.cta.variant}`}
      >
        {data.cta.label}
      </Link>

      <div className="pricing-tier-features">
        <div className="pricing-tier-features-header">{data.features.header}</div>
        <ul className="pricing-tier-features-list">
          {data.features.items.map((item) => (
            <li key={item}>
              <Check className="pricing-tier-features-check" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("yearly");

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-inner">
        <header className="pricing-header">
          <span className="section-eyebrow">
            <span className="section-eyebrow-dash">✦</span>
            <span className="section-eyebrow-text">Pricing</span>
          </span>
          <h2 className="pricing-headline">
            Simple pricing.{" "}
            <span className="pricing-headline-gradient">Pay when it matters.</span>
          </h2>
          <p className="pricing-subhead">
            Try it free. Upgrade when you outgrow it.
          </p>

          <BillingToggle value={billing} onChange={setBilling} />
        </header>

        <div className="pricing-tiers">
          <PricingTier tier="starter" billing={billing} />
          <PricingTier tier="business" billing={billing} featured />
          <PricingTier tier="enterprise" billing={billing} />
        </div>
      </div>
    </section>
  );
}
