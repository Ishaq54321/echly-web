import { ArrowIcon } from "../icons";

const TOOLS: ReadonlyArray<string> = [
  "Linear",
  "Jira",
  "GitHub",
  "Notion",
  "Slack",
  "ClickUp",
  "Asana",
  "Webflow",
  "Framer",
  "Shopify",
];

export function Integrations() {
  return (
    <section id="integrations" className="integ">
      <div className="integ-head">
        <span className="section-eyebrow">Integrations</span>
        <h2 className="integ-h">The layer before the ticket.</h2>
        <p className="integ-p">
          Push to your tools when you&apos;re ready. Or stay in Annote.
        </p>
      </div>
      <div className="integ-grid">
        {TOOLS.map((name) => (
          <div className="integ-cell" key={name}>
            <span className="integ-cell-mark" aria-hidden="true" />
            <span className="nm">{name}</span>
          </div>
        ))}
      </div>
      <div className="integ-foot">
        <span>And many more</span>
        <a className="integ-foot-link" href="#all-integrations">
          See all integrations <ArrowIcon size={11} />
        </a>
      </div>
    </section>
  );
}
