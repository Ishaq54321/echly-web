"use client";

import { useState } from "react";

const TABS = [
  { id: "agencies", label: "Agencies" },
  { id: "design", label: "Design" },
  { id: "product", label: "Product" },
  { id: "engineering", label: "Engineering" },
  { id: "qa", label: "QA" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type FeatureCardProps = {
  avatarSrc: string;
  avatarAlt: string;
  text: string;
};

function FeatureCard({ avatarSrc, avatarAlt, text }: FeatureCardProps) {
  return (
    <div className="who-its-for-feature-card">
      <img
        src={avatarSrc}
        alt={avatarAlt}
        className="who-its-for-feature-avatar"
      />
      <span className="who-its-for-feature-text">{text}</span>
    </div>
  );
}

function AgenciesContent() {
  return (
    <>
      <h3 className="who-its-for-tab-title">
        Ship client work{" "}
        <span className="who-its-for-tab-title-gradient">
          without losing the thread.
        </span>
      </h3>
      <p className="who-its-for-tab-body">
        Stop chasing client feedback across Slack DMs, Loom links, and email
        threads. One session captures it all — structured, contextual, ready
        for handoff.
      </p>
      <ul className="who-its-for-bullets">
        <li>Branded sessions you send to stakeholders</li>
        <li>Voice-to-ticket on any staging or live URL</li>
        <li>Dev-ready output: page, element, browser, all attached</li>
      </ul>
    </>
  );
}

function DesignContent() {
  return (
    <>
      <h3 className="who-its-for-tab-title">
        Less translating.{" "}
        <span className="who-its-for-tab-title-gradient">More designing.</span>
      </h3>
      <p className="who-its-for-tab-body">
        Designers shouldn&apos;t be playing telephone with feedback. Capture the
        comment ON the design, structure it once, route it correctly. The
        pixel-perfect cycle, finally short.
      </p>
      <ul className="who-its-for-bullets">
        <li>Capture feedback directly on the live design or prototype</li>
        <li>Voice notes preserve nuance text can&apos;t</li>
        <li>Comments thread on the exact element, not &quot;the thing on page 3&quot;</li>
      </ul>
    </>
  );
}

function ProductContent() {
  return (
    <>
      <h3 className="who-its-for-tab-title">
        Every spec has{" "}
        <span className="who-its-for-tab-title-gradient">a backstory.</span>
      </h3>
      <p className="who-its-for-tab-body">
        Product specs need the why, not just the what. Annote captures the
        moment of insight — the click, the voice, the context — so your team
        builds the right thing the first time.
      </p>
      <ul className="who-its-for-bullets">
        <li>Voice notes become structured PRDs in seconds</li>
        <li>Page + element context auto-attached to every ticket</li>
        <li>Priority and assignee set inline, no separate tool</li>
      </ul>
    </>
  );
}

function EngineeringContent() {
  return (
    <>
      <h3 className="who-its-for-tab-title">
        Bug reports devs{" "}
        <span className="who-its-for-tab-title-gradient">
          don&apos;t have to decode.
        </span>
      </h3>
      <p className="who-its-for-tab-body">
        Stop asking &quot;what page?&quot; and &quot;what browser?&quot; Every
        Annote ticket arrives with the page, the element, the OS, the viewport —
        and a description that actually makes sense.
      </p>
      <ul className="who-its-for-bullets">
        <li>Browser, OS, screen size auto-captured</li>
        <li>Element selector and page URL on every ticket</li>
        <li>AI-cleaned descriptions, not raw transcripts</li>
      </ul>
    </>
  );
}

function QAContent() {
  return (
    <>
      <h3 className="who-its-for-tab-title">
        Cover the build.{" "}
        <span className="who-its-for-tab-title-gradient">
          Speak the issues.
        </span>
      </h3>
      <p className="who-its-for-tab-body">
        QA shouldn&apos;t mean 200 screenshots in a Notion doc. Walk through the
        build, click anything wrong, speak the issue. Your test pass becomes a
        structured backlog in one session.
      </p>
      <ul className="who-its-for-bullets">
        <li>One session for the whole QA pass</li>
        <li>Voice-to-ticket, no typing during the test run</li>
        <li>Open / In Progress / Resolved tracked inline</li>
      </ul>
    </>
  );
}

function AgenciesFeatures() {
  return (
    <>
      <FeatureCard
        avatarSrc="/marketing/people/maya-anand.jpg"
        avatarAlt="Maya"
        text="Run QA passes solo or with the team"
      />
      <FeatureCard
        avatarSrc="/marketing/people/daniel-torres.jpg"
        avatarAlt="Daniel"
        text="Capture client review notes without breaking flow"
      />
      <FeatureCard
        avatarSrc="/marketing/people/sarah-kim.jpg"
        avatarAlt="Sarah"
        text="Brand every session with your logo"
      />
      <FeatureCard
        avatarSrc="/marketing/people/alex-nguyen.jpg"
        avatarAlt="Alex"
        text="Hand off tickets devs can actually work from"
      />
    </>
  );
}

function DesignFeatures() {
  return (
    <>
      <FeatureCard
        avatarSrc="/marketing/people/sarah-kim.jpg"
        avatarAlt="Sarah"
        text="Annotate live builds, not screenshots"
      />
      <FeatureCard
        avatarSrc="/marketing/people/alex-nguyen.jpg"
        avatarAlt="Alex"
        text="Preserve design intent in every ticket"
      />
      <FeatureCard
        avatarSrc="/marketing/people/maya-anand.jpg"
        avatarAlt="Maya"
        text="Compare versions without losing comments"
      />
      <FeatureCard
        avatarSrc="/marketing/people/daniel-torres.jpg"
        avatarAlt="Daniel"
        text="Sync feedback across stakeholders"
      />
    </>
  );
}

function ProductFeatures() {
  return (
    <>
      <FeatureCard
        avatarSrc="/marketing/people/alex-nguyen.jpg"
        avatarAlt="Alex"
        text="Turn user observations into spec-ready tickets"
      />
      <FeatureCard
        avatarSrc="/marketing/people/maya-anand.jpg"
        avatarAlt="Maya"
        text="Capture insights from any product surface"
      />
      <FeatureCard
        avatarSrc="/marketing/people/daniel-torres.jpg"
        avatarAlt="Daniel"
        text="Set priority and ownership in the same flow"
      />
      <FeatureCard
        avatarSrc="/marketing/people/sarah-kim.jpg"
        avatarAlt="Sarah"
        text="Trace every ticket back to its source"
      />
    </>
  );
}

function EngineeringFeatures() {
  return (
    <>
      <FeatureCard
        avatarSrc="/marketing/people/daniel-torres.jpg"
        avatarAlt="Daniel"
        text="Reproduce bugs without the back-and-forth"
      />
      <FeatureCard
        avatarSrc="/marketing/people/maya-anand.jpg"
        avatarAlt="Maya"
        text="Skip the 'what browser?' email"
      />
      <FeatureCard
        avatarSrc="/marketing/people/sarah-kim.jpg"
        avatarAlt="Sarah"
        text="Get full context on every ticket"
      />
      <FeatureCard
        avatarSrc="/marketing/people/alex-nguyen.jpg"
        avatarAlt="Alex"
        text="Triage faster with structured input"
      />
    </>
  );
}

function QAFeatures() {
  return (
    <>
      <FeatureCard
        avatarSrc="/marketing/people/maya-anand.jpg"
        avatarAlt="Maya"
        text="Walk through every page, hands-free"
      />
      <FeatureCard
        avatarSrc="/marketing/people/sarah-kim.jpg"
        avatarAlt="Sarah"
        text="Catch UI bugs with their context"
      />
      <FeatureCard
        avatarSrc="/marketing/people/daniel-torres.jpg"
        avatarAlt="Daniel"
        text="Track status across the whole session"
      />
      <FeatureCard
        avatarSrc="/marketing/people/alex-nguyen.jpg"
        avatarAlt="Alex"
        text="Hand off resolved tickets to dev"
      />
    </>
  );
}

export function WhoItsFor() {
  const [activeTab, setActiveTab] = useState<TabId>("agencies");

  return (
    <section id="personas" className="who-its-for-section">
      <header className="who-its-for-header">
        <div className="who-its-for-eyebrow">— WHO IT&apos;S FOR</div>
        <h2 className="who-its-for-headline">
          Built for the teams who own the work.
        </h2>
        <p className="who-its-for-subheading">
          Wherever feedback gets stuck, Annote moves it forward.
        </p>

        <div className="who-its-for-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`who-its-for-tab ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="who-its-for-content-card">
        <div className="who-its-for-grid">
          <div className="who-its-for-copy-column" key={`copy-${activeTab}`}>
            {activeTab === "agencies" && <AgenciesContent />}
            {activeTab === "design" && <DesignContent />}
            {activeTab === "product" && <ProductContent />}
            {activeTab === "engineering" && <EngineeringContent />}
            {activeTab === "qa" && <QAContent />}
          </div>

          <div
            className="who-its-for-features-column"
            key={`features-${activeTab}`}
          >
            {activeTab === "agencies" && <AgenciesFeatures />}
            {activeTab === "design" && <DesignFeatures />}
            {activeTab === "product" && <ProductFeatures />}
            {activeTab === "engineering" && <EngineeringFeatures />}
            {activeTab === "qa" && <QAFeatures />}
          </div>
        </div>
      </div>
    </section>
  );
}
