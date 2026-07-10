"use client";

/**
 * NovaPricing — the pricing section restyled to the reference system:
 * centered head with mono eyebrow, pill billing toggle (near-black active
 * state), three quiet tier cards with the featured tier fully inverted
 * (near-black surface, light type). Tier data unchanged from the previous
 * homepage.
 */

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Reveal } from "../../nova/Reveal";

type Billing = "monthly" | "yearly";

type TierData = {
  id: string;
  name: string;
  tagline: string;
  price: (billing: Billing) => {
    main: string;
    period: string;
    note?: string;
    strike?: string;
  };
  cta: { label: string; href: string };
  featured?: boolean;
  featuresHead: string;
  features: readonly string[];
};

const TIERS: ReadonlyArray<TierData> = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Try Annote with your next QA pass",
    price: () => ({ main: "$0", period: "Free forever" }),
    cta: { label: "Start free", href: "/signup" },
    featuresHead: "Includes",
    features: [
      "1 member",
      "50 tickets total",
      "Voice-to-ticket AI",
      "Browser, OS, viewport metadata",
      "Public session links",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "For agencies and product teams shipping client work",
    price: (billing) =>
      billing === "yearly"
        ? {
            main: "$19",
            period: "per user / month",
            note: "Billed $228 / user / year",
            strike: "$288",
          }
        : { main: "$24", period: "per user / month" },
    cta: { label: "Get started", href: "/signup?plan=business" },
    featured: true,
    featuresHead: "What you get",
    features: [
      "Unlimited team members",
      "Unlimited sessions and tickets",
      "Custom branding (your logo)",
      "Comments & collaboration",
      "Status, priority, assignee",
      "Priority support",
      "Audit log",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Security, controls, and dedicated support",
    price: () => ({ main: "Custom", period: "Tailored to your team" }),
    cta: { label: "Talk to sales", href: "/contact-sales" },
    featuresHead: "What you get",
    features: [
      "Everything in Business",
      "SSO (SAML, Google Workspace)",
      "Advanced security controls",
      "Custom contracts & SLA",
      "Dedicated success manager",
      "Custom integrations",
      "Procurement-friendly billing",
    ],
  },
];

export function NovaPricing() {
  const [billing, setBilling] = useState<Billing>("yearly");

  return (
    <section id="pricing" className="nv-pricing">
      <div className="nv-container">
        <Reveal className="nv-pricing-head">
          <p className="nv-eyebrow" style={{ justifyContent: "center" }}>
            Pricing
          </p>
          <h2 className="nv-h2">
            Simple pricing.
            <br />
            <span className="nv-dim">Pay when it matters.</span>
          </h2>
          <p className="nv-body">Try it free. Upgrade when you outgrow it.</p>

          <div
            className="nv-billing-toggle"
            role="tablist"
            aria-label="Billing period"
          >
            {(["monthly", "yearly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={billing === option}
                className={billing === option ? "is-active" : ""}
                onClick={() => setBilling(option)}
              >
                {option === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="nv-pricing-grid">
          {TIERS.map((tier, i) => {
            const price = tier.price(billing);
            return (
              <Reveal
                as="article"
                key={tier.id}
                className={`nv-tier${tier.featured ? " nv-tier--featured" : ""}`}
                delay={i * 110}
                threshold={0.1}
              >
                {tier.featured && (
                  <span className="nv-tier-badge">Recommended</span>
                )}
                <div>
                  <div className="nv-tier-name">{tier.name}</div>
                  <div className="nv-tier-tagline">{tier.tagline}</div>
                </div>

                <div>
                  <div className="nv-tier-price">{price.main}</div>
                  <div className="nv-tier-period">
                    {price.strike && (
                      <span className="nv-tier-strike">{price.strike}</span>
                    )}
                    {price.period}
                    {price.note && (
                      <>
                        <br />
                        {price.note}
                      </>
                    )}
                  </div>
                </div>

                <Link
                  href={tier.cta.href}
                  className={`nv-btn ${
                    tier.featured ? "nv-btn--primary-inverse" : "nv-btn--primary"
                  }`}
                >
                  {tier.cta.label}
                </Link>

                <div>
                  <div className="nv-tier-features-head">
                    {tier.featuresHead}
                  </div>
                  <ul className="nv-tier-features">
                    {tier.features.map((item) => (
                      <li className="nv-tier-feature" key={item}>
                        <Check size={15} strokeWidth={2} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
