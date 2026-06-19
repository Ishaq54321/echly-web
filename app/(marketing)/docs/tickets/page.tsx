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
  title: "Working with Tickets — Annote",
  description:
    "Read the AI diagnosis, dig into the raw evidence, and move tickets through your team's workflow.",
};

const IcSparkles = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4 l1.5 4.1 L16.6 9.6 l-4.1 1.5 L11 15.2 l-1.5-4.1 L5.4 9.6 l4.1-1.5 Z" />
    <path d="M17.6 14.4 l.7 1.9 1.9 .7 -1.9 .7 -.7 1.9 -.7-1.9 -1.9-.7 1.9-.7 Z" />
  </svg>
);
const IcTerminal = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 10 L10 12.5 L7 15 M12.5 15 H16" />
  </svg>
);
const IcFlag = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 21 V4" />
    <path d="M6 4.5 h10.5 l-2 3.5 2 3.5 H6" />
  </svg>
);
const IcChat = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 6 a1.5 1.5 0 0 1 1.5-1.5 h12 a1.5 1.5 0 0 1 1.5 1.5 v8 a1.5 1.5 0 0 1-1.5 1.5 H10 l-4 3 V15.5 H6 a1.5 1.5 0 0 1-1.5-1.5 Z" />
    <path d="M8 9 H16 M8 12 H13" />
  </svg>
);

const SECTIONS: DocNavItem[] = [
  { id: "reading-the-diagnosis", label: "Reading the AI diagnosis", icon: IcSparkles },
  { id: "console-network-actions", label: "Console, Network & Actions panels", icon: IcTerminal },
  { id: "resolve-assign-prioritize", label: "Resolve, assign & prioritize", icon: IcFlag },
  { id: "comments-and-discussion", label: "Comments & discussion", icon: IcChat },
];

export default function TicketsPage() {
  return (
    <DocsScaffold>
      <DocHero
        eyebrow="Documentation"
        title="Working with Tickets"
        sub="Read the AI diagnosis, dig into the raw evidence, and move tickets through your team's workflow."
        meta={["4 SECTIONS", "AI DIAGNOSIS", "TEAM WORKFLOW"]}
      />

      <DocLayout
        sections={SECTIONS}
        railFoot={
          <RailFoot
            text="New to capturing? Start with the basics first."
            href="/docs/capturing"
            label="Capturing Feedback"
          />
        }
      >
        <DocSection
          id="reading-the-diagnosis"
          num="01"
          kicker="The verdict"
          title="Reading the AI diagnosis"
          icon={IcSparkles}
        >
          <p className="lead">
            Every ticket gets an automatic diagnosis. Open a ticket and look at the Dev
            Tools panel (the sparkles icon) — it opens on the AI tab and analyzes the
            capture on first view.
          </p>
          <p>
            At the top is a verdict badge, and it&apos;s the first thing to read because it
            tells you how to read everything below it. There are four:
          </p>
          <ul className="facts">
            <li>
              <strong>Captured signals relate to this report</strong> (green) — the evidence
              lines up with what you described. You&apos;ll see a Likely cause and a Suggested
              fix.
            </li>
            <li>
              <strong>Captured errors appear unrelated</strong> (amber) — Annote found errors,
              but they don&apos;t seem connected to your report. You&apos;ll get a relatedness
              assessment and suggested next steps rather than a confident cause.
            </li>
            <li>
              <strong>Design / UX request — no code fault</strong> (gray) — Annote recognized
              this as a design or wording change, not a bug, so there&apos;s nothing technical
              to diagnose.
            </li>
            <li>
              <strong>No related capture — defect not ruled out</strong> (accent) — and this is
              the one to read carefully: it does not mean &ldquo;this isn&apos;t a bug.&rdquo;
              It means the capture didn&apos;t contain anything bearing on what you reported.
              The issue still stands; the evidence just doesn&apos;t point at a cause.
            </li>
          </ul>
          <p>
            Below the badge you&apos;ll read a short summary, the likely cause (or assessment),
            a numbered suggested-fix list, and a confidence level — High, Moderate, or Low.
            Everything carries an &ldquo;AI-generated · review before acting&rdquo; note,
            because the AI reasons from captured evidence and can be wrong. Treat it as a fast,
            well-informed first opinion, not a verdict.
          </p>
          <DocFigure
            src="/docs/assets/tic-1.webp"
            caption={"A ticket's AI tab with a green “related” verdict, likely cause, and suggested fix"}
          />
        </DocSection>

        <DocSection
          id="console-network-actions"
          num="02"
          kicker="Raw evidence"
          title="Console, Network & Actions panels"
          icon={IcTerminal}
        >
          <p className="lead">
            Alongside the AI tab, the Dev Tools panel gives you the raw evidence the diagnosis
            was built from. Three tabs, each readable on its own.
          </p>
          <ul className="facts">
            <li>
              <strong>Console</strong> lists the captured logs, with filters for errors and
              warnings and expandable rows for detail. If there were no errors or warnings, it
              says so plainly rather than leaving you guessing.
            </li>
            <li>
              <strong>Network</strong> is a familiar request table — status, method, name,
              timing — with color-coded status codes. Click any row to see the request detail,
              including the response body, and copy it as cURL to replay the failing call
              yourself. When failed requests are present, the table auto-filters to show errors
              first.
            </li>
            <li>
              <strong>Actions</strong> is the user-action timeline, with a toggle between
              Readable (plain English — &ldquo;Navigated to /profile&rdquo;) and Technical
              (element-level detail) so a PM and an engineer can each read it their way.
            </li>
          </ul>
          <p>
            Each tab has search (<code>Cmd/Ctrl+F</code>), copy, and a clear &ldquo;Nothing
            captured&rdquo; state when a stream is empty.
          </p>
          <DocFigure
            src="/docs/assets/tic-2.webp"
            caption="The Network tab with a color-coded request table and one row expanded"
          />
        </DocSection>

        <DocSection
          id="resolve-assign-prioritize"
          num="03"
          kicker="Workflow"
          title="Resolve, assign & prioritize"
          icon={IcFlag}
        >
          <p className="lead">
            Tickets move through a simple, fast workflow — no heavyweight status ladder to
            manage.
          </p>
          <ul className="facts">
            <li>
              <strong>Resolve.</strong> Each ticket is either Open or Resolved. Hit Resolve and
              it&apos;s done, with no confirmation step; Annote advances you to the next open
              ticket so you can work through a session quickly. Reopen the same way. You can also
              bulk resolve or reopen every ticket in a session at once.
            </li>
            <li>
              <strong>Assign.</strong> Open the assignee control to search your workspace members
              and assign the ticket, remove an assignee, or invite someone new.
            </li>
            <li>
              <strong>Prioritize.</strong> Set a ticket to High, Medium, or Low — or clear it.
              Priority is for triage; it doesn&apos;t change the Open/Resolved state.
            </li>
          </ul>
          <p>
            Tags are how tickets are categorized — Bug, Feature Request, and so on — up to three
            per ticket. Members can also edit a ticket&apos;s title, description, tags, and
            screenshot inline. Deleting a ticket is owner-only and asks for confirmation.
          </p>
          <Note>
            <b>What you can do depends on your access to the session:</b> a Viewer can view and
            (when signed in) comment; a Resolver can also resolve and assign; an Owner can also
            delete tickets. If you don&apos;t have resolve rights, the Resolve button is replaced
            by a way to request access.
          </Note>
          <DocFigure
            src="/docs/assets/tic-3.webp"
            caption="A ticket header showing the Resolve button, assignee, and priority"
          />
        </DocSection>

        <DocSection
          id="comments-and-discussion"
          num="04"
          kicker="Discussion"
          title="Comments & discussion"
          icon={IcChat}
        >
          <p className="lead">
            Each ticket has a comment thread for working things out with your team. The composer
            is rich text — Enter sends, Shift+Enter adds a line. You can @mention teammates from
            a picker, attach files (up to 5 per comment, 10MB each), react with emoji, reply one
            level deep, edit or delete your own comments, and pin a comment directly onto the
            screenshot to point at exactly what you mean.
          </p>
          <p>
            Across the whole workspace, the <strong>Discussion inbox</strong> collects open
            feedback threads in one place, organized into Inbox, Mentions, and Assigned to me.
            It&apos;s the fastest way to see what&apos;s waiting on you without opening every
            session. Resolved threads drop out of the inbox so it stays focused on what&apos;s
            still open.
          </p>
          <DocFigure
            src="/docs/assets/tic-4.webp"
            caption="A comment thread with an @mention and a pinned comment on the screenshot"
          />
        </DocSection>
      </DocLayout>
    </DocsScaffold>
  );
}
