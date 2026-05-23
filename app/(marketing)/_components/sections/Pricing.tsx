import Link from "next/link";
import { ArrowIcon } from "../icons";

export function Pricing() {
  return (
    <section id="pricing" className="pricing">
      <div className="pr-head">
        <span className="section-eyebrow">Pricing</span>
        <h2 className="pr-h">
          Simple pricing.
          <br />
          Free for small teams.
        </h2>
        <p className="pr-p">
          No contracts. No card. Upgrade when you outgrow it.
        </p>
      </div>
      <div className="pr-row">
        <article className="pr-card">
          <div className="pr-tier">Starter</div>
          <div className="pr-amount">
            $0<span className="pr-period">free forever</span>
          </div>
          <ul className="pr-features">
            <li>Limited members</li>
            <li>50 tickets / month</li>
            <li>Limited AI improvements / month</li>
            <li>Basic insights</li>
          </ul>
          <Link className="btn-white pr-cta" href="/signup">
            Get started
          </Link>
        </article>

        <article className="pr-card is-rec">
          <div className="pr-rec-badge">Recommended</div>
          <div className="pr-tier">Business</div>
          <div className="pr-amount">
            $19<span className="pr-period">/mo per seat</span>
          </div>
          <ul className="pr-features">
            <li>Unlimited members</li>
            <li>Unlimited tickets</li>
            <li>Unlimited AI improvements / month</li>
            <li>Priority support</li>
            <li>Custom branding</li>
            <li>Integrations</li>
          </ul>
          <Link className="btn-primary pr-cta" href="/signup">
            Upgrade to Business <ArrowIcon size={12} />
          </Link>
        </article>

        <article className="pr-card">
          <div className="pr-tier">Enterprise</div>
          <div className="pr-amount">
            Custom<span className="pr-period">talk to us</span>
          </div>
          <ul className="pr-features">
            <li>Everything in Business</li>
            <li>SSO &amp; SAML</li>
            <li>Audit logs</li>
            <li>Dedicated support</li>
          </ul>
          <a className="btn-white pr-cta" href="#contact">
            Contact sales
          </a>
        </article>
      </div>
    </section>
  );
}
