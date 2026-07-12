import type { Metadata } from "next";
import {
  DocsScaffold,
  DocHero,
  DocLayout,
  DocSection,
  DocFigure,
  Note,
  RailFoot,
  type DocNavItem,
} from "../../_components/docs/DocsScaffold";

export const metadata: Metadata = {
  title: "Admin & Workspace — Annote",
  alternates: { canonical: "/docs/admin" },
  description:
    "Set up your workspace and team, manage plans and billing, and control your personal settings.",
};

const IcUsers = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19 c0-3 2.4-5 5.5-5 s5.5 2 5.5 5" />
    <path d="M16 5.2 a3 3 0 0 1 0 5.8" />
    <path d="M17 14.2 c2.4 .4 4 2.3 4 4.8" />
  </svg>
);
const IcCard = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3 9.5 H21 M6.5 14.5 H10" />
  </svg>
);
const IcSettings = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7 H13 M17 7 H20" />
    <path d="M4 17 H8 M12 17 H20" />
    <circle cx="15" cy="7" r="2.2" />
    <circle cx="10" cy="17" r="2.2" />
  </svg>
);

const SECTIONS: DocNavItem[] = [
  { id: "workspace-and-team", label: "Workspace & team setup", icon: IcUsers },
  { id: "plans-and-billing", label: "Plans & billing", icon: IcCard },
  { id: "account-and-settings", label: "Account & settings", icon: IcSettings },
];

export default function AdminPage() {
  return (
    <DocsScaffold>
      <DocHero
        eyebrow="Documentation"
        title="Admin & Workspace"
        sub="Set up your workspace and team, manage plans and billing, and control your personal settings."
        meta={["3 SECTIONS", "ROLES & SEATS", "BILLING"]}
      />

      <DocLayout
        sections={SECTIONS}
        railFoot={
          <RailFoot
            text="Stuck on something? We're quick to respond."
            href="#"
            label="Contact support"
          />
        }
      >
        <DocSection
          id="workspace-and-team"
          num="01"
          kicker="Team"
          title="Workspace & team setup"
          icon={IcUsers}
        >
          <p className="lead">
            Your workspace is created when you finish onboarding, and it&apos;s where
            your team and their feedback live. You manage it from Settings → Workspace.
          </p>
          <p>
            There are two roles: <strong>Owner</strong> and <strong>Member</strong>.
            Owners can edit the workspace name and logo, invite and remove members,
            manage invites, transfer ownership, and delete the workspace. Members can do
            everything else and can leave a workspace on their own. Roles are set at
            invite time and don&apos;t change afterward — the one exception is
            transferring ownership.
          </p>
          <p>
            To invite someone, go to Settings → Workspace → Members → Invite member,
            enter their email, and send. Invitations are always sent as Member and expire
            after 30 days; pending invites show in the members table where you can resend
            or revoke them. You can belong to up to five workspaces and switch between
            them from the sidebar.
          </p>
          <DocFigure
            src="/docs/assets/adm-1.webp"
            caption="The Members table with the Invite member control"
          />
        </DocSection>

        <DocSection
          id="plans-and-billing"
          num="02"
          kicker="Billing"
          title="Plans & billing"
          icon={IcCard}
        >
          <p className="lead">Annote has three plans, managed under Settings → Billing.</p>
          <Note amber>
            <b>Confirm the exact figures below against your current pricing before publishing</b>{" "}
            — your live site and product config should agree.
          </Note>
          <ul className="facts">
            <li>
              <strong>Starter</strong> is free, and a good way to try Annote on a QA pass.
              It includes a capped number of members and monthly tickets and the core
              voice-to-ticket capture and AI.
            </li>
            <li>
              <strong>Business</strong> is a per-seat monthly plan (with a discount for
              annual billing) and lifts the caps — unlimited members, sessions, and
              tickets — and adds custom branding with your own logo.
            </li>
            <li>
              <strong>Enterprise</strong> is custom, for organizations that need SSO,
              advanced security controls, and dedicated support. It&apos;s arranged
              through sales rather than purchased in-app.
            </li>
          </ul>
          <p>
            Upgrading is owner-only: from the Billing tab, choose your seat count and
            billing cycle and check out through Stripe; your plan activates once payment
            confirms. From the same tab you can update your payment method, download
            invoices, and cancel (which keeps access until the end of your billing
            period). A usage meter shows how many of this month&apos;s tickets you&apos;ve
            used, turning amber as you approach the limit.
          </p>
          <Note>
            <b>Two billing details worth knowing up front:</b> hitting a plan limit blocks
            the action with an upgrade prompt rather than charging you automatically — and
            removing a member doesn&apos;t immediately reduce your bill; the seat is
            reflected at your next renewal, not mid-cycle.
          </Note>
          <DocFigure
            src="/docs/assets/adm-2.webp"
            caption="The Billing tab with the plan card and monthly usage meter"
          />
        </DocSection>

        <DocSection
          id="account-and-settings"
          num="03"
          kicker="Personal"
          title="Account & settings"
          icon={IcSettings}
        >
          <p className="lead">
            Your personal settings live under Settings, across a few tabs.
          </p>
          <ul className="facts">
            <li>
              <strong>My account</strong> is where you edit your name and avatar, change
              your email (with your current password — this is managed by Google if you
              signed in that way), reset your password, or delete your account.
            </li>
            <li>
              <strong>Notifications</strong> lets you control which emails you get —
              there&apos;s a toggle for activity notifications (comments, mentions,
              assignments, resolutions, and views) and one for product updates. These are
              email preferences and they save; transactional emails (like receipts and
              security messages) always send.
            </li>
            <li>
              <strong>Security</strong> is where you reset your password and, in a
              clearly-marked danger zone, transfer ownership or delete a workspace
              (owners) or leave a workspace (members) — each guarded by a type-to-confirm
              step.
            </li>
          </ul>
          <DocFigure
            src="/docs/assets/adm-3.webp"
            caption="The Settings page showing the account tabs"
          />
        </DocSection>
      </DocLayout>
    </DocsScaffold>
  );
}
