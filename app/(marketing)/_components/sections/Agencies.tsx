import { ArrowIcon } from "../icons";

export function Agencies() {
  return (
    <section id="agencies" className="agencies">
      <div className="ag-head">
        <span className="section-eyebrow">Built for agencies</span>
        <h2 className="ag-h">
          Made for the people who ship
          <br />
          work for other people.
        </h2>
        <p className="ag-p">
          Clients don&apos;t sign up. They click the link, leave feedback in
          their own words, and you get structured tickets ready for your dev
          team.
        </p>
      </div>

      <div className="ag-flow">
        <article className="ag-step">
          <span className="ag-num">01 · Agency</span>
          <h3 className="ag-tit">You start a session.</h3>
          <p className="ag-sub">
            QA the staging build or walk a client review. Every click becomes a
            ticket.
          </p>
          <div className="ag-viz">
            <div className="ag-row">
              <span className="ag-av">MA</span>
              <span>Maya · session host</span>
            </div>
            <div className="ag-row">
              <span className="ag-av b">DT</span>
              <span>Daniel · QA review</span>
            </div>
            <div className="ag-row">
              <span className="ag-av c">SK</span>
              <span>Sarah · design lead</span>
            </div>
          </div>
        </article>
        <span className="ag-arrow">
          <ArrowIcon size={16} />
        </span>

        <article className="ag-step">
          <span className="ag-num">02 · Send</span>
          <h3 className="ag-tit">One link to the client.</h3>
          <p className="ag-sub">
            Custom-branded with your logo, your colors, your domain.
          </p>
          <div className="ag-viz">
            <div className="ag-url">aurora.studio/s/may18</div>
            <div className="ag-row">
              <span className="ag-av d">A</span>
              <span>aurora.studio — branded</span>
            </div>
          </div>
        </article>
        <span className="ag-arrow">
          <ArrowIcon size={16} />
        </span>

        <article className="ag-step">
          <span className="ag-num">03 · Client</span>
          <h3 className="ag-tit">They speak in their own words.</h3>
          <p className="ag-sub">
            No account. No install. AI polishes the rest into clean tickets.
          </p>
          <div className="ag-viz">
            <div className="ag-row">
              <span className="ag-av b">J</span>
              <span>Jordan @ client</span>
            </div>
            <div className="ag-quote">
              &ldquo;This dashboard sidebar keeps collapsing on me — also feels
              too cramped.&rdquo;
            </div>
          </div>
        </article>
        <span className="ag-arrow">
          <ArrowIcon size={16} />
        </span>

        <article className="ag-step">
          <span className="ag-num">04 · Push</span>
          <h3 className="ag-tit">Tickets flow to your stack.</h3>
          <p className="ag-sub">
            Linear, Jira, ClickUp, Notion, GitHub — wherever your devs already
            work.
          </p>
          <div className="ag-viz">
            <div className="ag-mini">
              <div className="ag-mini-tit">Sidebar collapses on first nav</div>
              <div className="ag-mini-meta">
                <span className="ag-sev">High</span>
                <span>→ Linear</span>
              </div>
            </div>
            <div className="ag-mini">
              <div className="ag-mini-tit">
                Empty state copy needs revision
              </div>
              <div className="ag-mini-meta">
                <span>Med</span>
                <span>→ Jira</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
