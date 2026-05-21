// Placeholder footer. Phase 2 will replace the placeholder columns and
// bottom-bar copy with real navigation. Structure is here so Phase 2 is a
// content/design fill-in.

type FooterColumn = {
  heading: string;
  links: ReadonlyArray<{ label: string; href: string }>;
};

const COLUMNS: ReadonlyArray<FooterColumn> = [
  {
    heading: "Product",
    links: [
      { label: "Overview", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Roadmap", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Webflow agencies", href: "#" },
      { label: "Framer agencies", href: "#" },
      { label: "Product teams", href: "#" },
      { label: "Freelancers", href: "#" },
      { label: "Marketing teams", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Help center", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Browser extension", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Customers", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "DPA", href: "#" },
      { label: "Subprocessors", href: "#" },
    ],
  },
];

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t"
      style={{
        background: "var(--surface-page)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3
                className="mb-4 text-sm font-semibold"
                style={{ color: "var(--text-heading)" }}
              >
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ color: "var(--text-body)" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex flex-col items-start justify-between gap-4 border-t pt-8 md:flex-row md:items-center"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            © {year} Annote — Feedback at the speed of seeing it.
          </div>
          <div
            className="text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            Made for teams who care about the small stuff.
          </div>
        </div>
      </div>
    </footer>
  );
}
