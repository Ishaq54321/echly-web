/**
 * NovaWorkflow — "Explore the main features", carried by the ORIGINAL
 * sticky-stacking card deck (ClickToTicket): as you scroll, each step card
 * pins and the next rises and stacks over it — Capture → Speak → Share, each
 * with its live mockup (pointer + capture pill, voice waveform + AI draft,
 * diagnosis + session link).
 *
 * The deck component renders unchanged; nova.css overrides
 *   • hide its legacy internal header (the nova header below replaces it),
 *   • recolor the card chrome to the system's cool hairlines/radii,
 *   • swap the colorful photo backdrops for quiet monochrome gradients.
 */

import { ClickToTicket } from "../ClickToTicket";
import { Reveal } from "../../nova/Reveal";

export function NovaWorkflow() {
  return (
    <div className="nv-workflow">
      <div className="nv-container">
        <Reveal className="nv-workflow-head">
          <p className="nv-eyebrow">The workflow</p>
          <h2 className="nv-h2">
            Explore the
            <br />
            <span className="nv-dim">main features</span>
          </h2>
        </Reveal>
      </div>
      <ClickToTicket />
    </div>
  );
}
