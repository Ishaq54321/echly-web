export function Context() {
  return (
    <section className="context">
      <div className="context-inner">
        <span className="section-eyebrow">Why this is different</span>
        <blockquote className="context-quote">
          The screenshot is the <em>easy</em> part.
          <br />
          The context is the product.
        </blockquote>
        <p className="context-p">
          Other tools give you a screenshot and a blank text field. Annote
          gives the AI the page — element, layout, browser, everything around
          it — so the ticket lands ready to ship.
        </p>
        <div className="context-chips">
          <span className="context-chip">
            <i className="cc-dot v" />
            aurora.com/dashboard
          </span>
          <span className="context-chip">
            <i className="cc-dot b" />
            New project button
          </span>
          <span className="context-chip">
            <i className="cc-dot m" />
            1440×900 · Chrome 124
          </span>
          <span className="context-chip">
            <i className="cc-dot a" />
            macOS Sequoia
          </span>
          <span className="context-chip">
            <i className="cc-dot t" />
            Aurora brand tokens
          </span>
        </div>
      </div>
    </section>
  );
}
