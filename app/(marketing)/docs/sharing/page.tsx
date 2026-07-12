import type { Metadata } from "next";
import {
  DocsScaffold,
  DocHero,
  DocLayout,
  DocSection,
  DocFigure,
  RailFoot,
  type DocNavItem,
} from "../../_components/docs/DocsScaffold";

export const metadata: Metadata = {
  title: "Sharing & Collaboration — Annote",
  alternates: { canonical: "/docs/sharing" },
  description:
    "Share a session with anyone — no signup — and keep your team in sync as work happens.",
};

const IcShare = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="17.5" cy="6" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="17.5" cy="18" r="2.5" />
    <path d="M8.2 10.8 L15.3 7.2 M8.2 13.2 L15.3 16.8" />
  </svg>
);
const IcActivity = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12 H7 L9.5 5 L14.5 19 L17 12 H21" />
  </svg>
);

const SECTIONS: DocNavItem[] = [
  { id: "sharing-a-session", label: "Sharing a session", icon: IcShare },
  { id: "activity-and-presence", label: "Activity & presence", icon: IcActivity },
];

export default function SharingPage() {
  return (
    <DocsScaffold>
      <DocHero
        eyebrow="Documentation"
        title="Sharing & Collaboration"
        sub="Share a session with anyone — no signup — and keep your team in sync as work happens."
        meta={["2 SECTIONS", "LINK SHARING", "REAL-TIME"]}
      />

      <DocLayout
        sections={SECTIONS}
        railFoot={
          <RailFoot
            text="Manage roles, seats, and billing for your team."
            href="/docs/admin"
            label="Admin & Workspace"
          />
        }
      >
        <DocSection
          id="sharing-a-session"
          num="01"
          kicker="Share"
          title="Sharing a session"
          icon={IcShare}
        >
          <p className="lead">
            A session is meant to be shared. From a session&apos;s menu, choose Share to
            invite people by email or to share a link — and anyone with the link can
            open it in their browser with no signup and no install. The Annote extension
            is only for the person doing the capturing; everyone else just needs the link.
          </p>
          <p>
            Sharing comes with access tiers so you control what recipients can do:{" "}
            <strong>view</strong> (read the session and its tickets),{" "}
            <strong>comment</strong> (add to discussions), or <strong>resolve</strong>{" "}
            (act on tickets). Pick the level that fits — a stakeholder who should follow
            along gets view; a teammate helping clear the queue gets resolve. You can also
            approve access requests from people who open a restricted link.
          </p>
          <DocFigure
            src="/docs/assets/shr-1.webp"
            caption="The Share dialog with email invite and link-access-tier options"
          />
        </DocSection>

        <DocSection
          id="activity-and-presence"
          num="02"
          kicker="Awareness"
          title="Activity & presence"
          icon={IcActivity}
        >
          <p className="lead">
            Two features keep a team in sync without anyone asking &ldquo;what
            changed?&rdquo;
          </p>
          <p>
            <strong>Activity</strong> is a chronological feed of everything happening in
            your workspace — comments, tickets created, resolved, reopened, or deleted,
            sessions, members joining or leaving, invites, and access approvals. Filter it
            by type, session, or member; it&apos;s grouped by day, and @mentions get a
            distinct badge. Click any ticket or session in the feed to jump straight to it.
          </p>
          <p>
            <strong>Presence</strong> shows who&apos;s looking at a session right now —
            their avatars appear, ringed, in the session&apos;s top bar while they&apos;re
            actively viewing. It&apos;s scoped to the session you&apos;re in, so you can
            see when a teammate is reviewing the same thing you are.
          </p>
          <DocFigure
            src="/docs/assets/shr-2.webp"
            caption="The activity feed grouped by day, plus presence avatars on a session"
          />
        </DocSection>
      </DocLayout>
    </DocsScaffold>
  );
}
