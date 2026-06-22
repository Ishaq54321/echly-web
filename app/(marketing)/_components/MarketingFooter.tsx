import { AnnoteLogo } from "./AnnoteLogo";

type FooterColumn = {
  heading: string;
  links: ReadonlyArray<{ label: string; href: string }>;
};

const COLUMNS: ReadonlyArray<FooterColumn> = [
  {
    heading: "Use cases",
    links: [
      { label: "QA testing", href: "/use-cases/qa-testing" },
      { label: "Design review", href: "/use-cases/design-review" },
      { label: "Client feedback", href: "/use-cases/client-feedback" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Agencies", href: "/use-cases/agencies" },
      { label: "Teams", href: "/use-cases/teams" },
      { label: "Help center", href: "/docs" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/marketing/terms.html" },
      { label: "Privacy policy", href: "/marketing/privacy.html" },
      { label: "Trust", href: "/marketing/trust.html" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/company/annoteai" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="mk-footer">
      <div className="foot-inner">
        <div className="foot-brand">
          <div className="foot-brand-row">
            <span className="mk-logo-mark">
              <AnnoteLogo width={22} height={28} variant="white" />
            </span>
            <span className="mk-logo-word">Annote</span>
          </div>
          <p className="foot-tag">Feedback at the speed of seeing it.</p>
        </div>
        {COLUMNS.map((col) => (
          <div className="foot-col" key={col.heading}>
            <h6>{col.heading}</h6>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="foot-wordmark" aria-hidden="true">
        ANNOTE
      </div>
    </footer>
  );
}
