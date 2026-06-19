import type { Metadata } from "next";
import Link from "next/link";
import {
  DocsScaffold,
  DocHero,
  DocLayout,
  Note,
  RailFoot,
  type DocNavItem,
} from "../../_components/docs/DocsScaffold";

export const metadata: Metadata = {
  title: "Privacy markers reference — Annote",
  description:
    "Attributes and classes you add to your own pages to control what Annote captures.",
};

const IcTag = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.6 V5.2 a1.2 1.2 0 0 1 1.2-1.2 H12.6 L20 11.4 a1.5 1.5 0 0 1 0 2.1 L13.5 20 a1.5 1.5 0 0 1-2.1 0 Z" />
    <circle cx="8.3" cy="8.3" r="1.25" />
  </svg>
);
const IcShield = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 L19 5.6 V11 c0 4.5-3 7.6-7 9.4 C8 18.6 5 15.5 5 11 V5.6 Z" />
    <path d="M9 11.6 L11.2 13.8 L15.2 9.4" />
  </svg>
);

const SECTIONS: DocNavItem[] = [
  { id: "block-fully-withhold", label: "Block — fully withhold", icon: IcShield },
  { id: "mask-keep-structure", label: "Mask — keep structure", icon: IcTag },
  { id: "unmask-override", label: "Unmask — override", icon: IcTag },
];

const Legend = (
  <div className="rail-card">
    <p className="rc-title">Treatments</p>
    <div className="rc-item">
      <span className="pill block">
        <span className="pd" />
        Block
      </span>
      <p>
        Interaction is logged, but the element&apos;s text and attributes are
        withheld entirely.
      </p>
    </div>
    <div className="rc-item">
      <span className="pill mask">
        <span className="pd" />
        Mask
      </span>
      <p>Structure is kept; text and labels are dropped.</p>
    </div>
    <div className="rc-item">
      <span className="pill unmask">
        <span className="pd" />
        Unmask
      </span>
      <p>Re-exposes a single element inside a masked region.</p>
    </div>
  </div>
);

export default function PrivacyMarkersPage() {
  return (
    <DocsScaffold>
      <DocHero
        eyebrow="Reference"
        title="Privacy markers reference"
        sub="Attributes and classes you add to your own pages to control what Annote captures."
        meta={["7 MARKERS", "CLOSEST MARKER WINS", "ACTIONS & CONSOLE"]}
      />

      <DocLayout
        sections={SECTIONS}
        railCard={Legend}
        railFoot={
          <RailFoot
            text="How redaction and screenshots are protected — the bigger picture."
            href="/docs/privacy"
            label="Privacy & data protection"
          />
        }
      >
        <p className="ref-lead">
          Add these attributes or classes to elements on your own pages to
          control what Annote captures. The closest marker to an element wins,
          so you can unmask a single field inside a masked region.
        </p>

        <div className="tbl-wrap">
          <table className="ref">
            <thead>
              <tr>
                <th>Marker</th>
                <th>Treatment</th>
                <th>What it does</th>
              </tr>
            </thead>
            <tbody>
              <tr className="group-row" id="block-fully-withhold">
                <td colSpan={3}>Block — fully withhold</td>
              </tr>
              <tr>
                <td className="c-marker">
                  <code>{`[data-private]`}</code>
                </td>
                <td className="c-treat">
                  <span className="pill block">
                    <span className="pd" />
                    Block
                  </span>
                </td>
                <td className="c-does">
                  Records that an interaction happened but{" "}
                  <b>fully withholds</b> the element.
                </td>
              </tr>
              <tr>
                <td className="c-marker">
                  <code>{`.fs-exclude`}</code>
                </td>
                <td className="c-treat">
                  <span className="pill block">
                    <span className="pd" />
                    Block
                  </span>
                </td>
                <td className="c-does">
                  Same — FullStory <span className="fs">&quot;exclude&quot;</span>.
                </td>
              </tr>
              <tr>
                <td className="c-marker">
                  <code>{`.fs-block`}</code>
                </td>
                <td className="c-treat">
                  <span className="pill block">
                    <span className="pd" />
                    Block
                  </span>
                </td>
                <td className="c-does">
                  Same — FullStory <span className="fs">&quot;block&quot;</span>.
                </td>
              </tr>
              <tr>
                <td className="c-marker">
                  <code>{`[data-annote-mask]`}</code>
                </td>
                <td className="c-treat">
                  <span className="pill block">
                    <span className="pd" />
                    Block
                  </span>
                </td>
                <td className="c-does">
                  Annote&apos;s own marker; same full withhold. Use if
                  you&apos;d rather not rely on third-party class names.
                </td>
              </tr>
              <tr className="group-row" id="mask-keep-structure">
                <td colSpan={3}>Mask — keep structure, drop text</td>
              </tr>
              <tr>
                <td className="c-marker">
                  <code>{`.fs-mask`}</code>
                </td>
                <td className="c-treat">
                  <span className="pill mask">
                    <span className="pd" />
                    Mask
                  </span>
                </td>
                <td className="c-does">
                  Keeps structure (tag, classes, role) but{" "}
                  <b>drops text and label attributes</b>.
                </td>
              </tr>
              <tr>
                <td className="c-marker">
                  <code>{`[data-rr-is-password]`}</code>
                </td>
                <td className="c-treat">
                  <span className="pill mask">
                    <span className="pd" />
                    Mask
                  </span>
                </td>
                <td className="c-does">Same — rrweb password marker.</td>
              </tr>
              <tr className="group-row" id="unmask-override">
                <td colSpan={3}>Unmask — override a masked region</td>
              </tr>
              <tr>
                <td className="c-marker">
                  <code>{`.fs-unmask`}</code>
                </td>
                <td className="c-treat">
                  <span className="pill unmask">
                    <span className="pd" />
                    Unmask
                  </span>
                </td>
                <td className="c-does">
                  Overrides a surrounding block/mask region for{" "}
                  <b>this one element</b>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Note last>
          These markers apply to user-action capture and to console capture
          (when a DOM element is logged). They do <b>not</b> affect network
          capture or the screenshot — see{" "}
          <Link className="link" href="/docs/privacy">
            Privacy &amp; data protection
          </Link>{" "}
          for what protects those.
        </Note>
      </DocLayout>
    </DocsScaffold>
  );
}
