import { AnnoteLogo } from "./AnnoteLogo";

type FooterColumn = {
  heading: string;
  links: ReadonlyArray<{ label: string; href: string }>;
};

const COLUMNS: ReadonlyArray<FooterColumn> = [
  {
    heading: "Product",
    links: [
      { label: "Annote Capture", href: "#" },
      { label: "Annote Voice", href: "#" },
      { label: "Sessions", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact us", href: "#" },
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Help center", href: "#" },
      { label: "Partners", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Trust", href: "#" },
      { label: "DPA", href: "#" },
      { label: "Your privacy choices", href: "#" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "LinkedIn", href: "#" },
      { label: "X", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "Threads", href: "#" },
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
