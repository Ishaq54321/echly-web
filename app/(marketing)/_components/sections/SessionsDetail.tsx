"use client";

import { SessionDemoStage } from "../demos/session/SessionDemoStage";

/**
 * SessionsDetail — Phase 2C: the demo below the headline is now a forklift of
 * the real production session view (two columns: sidebar + detail), populated
 * with static mock data (Loomly pricing QA, 6 tickets). The bespoke `sd-*`
 * mockup was replaced by <SessionDemoStage>. The section heading + sub-headline
 * are unchanged.
 */
export function SessionsDetail() {
  return (
    <section id="teams" className="sessions-detail">
      <div className="sd-head">
        <h2 className="sd-h">
          Stop chasing feedback across
          <br />
          five different tools.
        </h2>
        <p className="sd-p">
          Annote replaces email threads, Slack DMs, and stray Looms with one
          workflow: <b>click on the thing, say what&apos;s wrong, send the
          link.</b>
        </p>
      </div>

      <div className="sd-stage">
        <SessionDemoStage />
      </div>
    </section>
  );
}
