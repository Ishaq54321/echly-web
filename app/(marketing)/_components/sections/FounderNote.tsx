/**
 * FounderNote â€” brief, personal note from the founder, replacing the
 * placeholder "Becoming Annote" editorial. Photo + 3 paragraphs + a signature
 * block with email and Twitter handle.
 *
 * The portrait placeholder reuses an existing avatar from /public/marketing/
 * people/. Swap the src for a real founder photo when one is ready.
 */
export function FounderNote() {
  return (
    <section id="founder" className="founder-note-section">
      <div className="founder-note-container">
        <div className="section-eyebrow founder-note-eyebrow">
          <span className="section-eyebrow-dash">—</span>
          <span className="section-eyebrow-text">From the founder</span>
        </div>

        <div className="founder-note-grid">
          <div className="founder-note-photo">
            <img
              src="/marketing/people/feedback-on-laptop.jpg"
              alt="Aakash, founder of Annote"
            />
          </div>

          <div className="founder-note-content">
            <p className="founder-note-paragraph">
              I built Annote because every feedback workflow I&apos;d ever seen
              was broken in the same way — five tools, scattered context, lost
              in translation between the person who saw the problem and the
              person who had to fix it.
            </p>
            <p className="founder-note-paragraph">
              Annote is the tool I wish I&apos;d had when I was running design
              reviews. Click on the thing, say what&apos;s wrong, send the link.
              Everyone sees the same context. That&apos;s it.
            </p>
            <p className="founder-note-paragraph">
              If you try it and it doesn&apos;t fit your workflow, write to me
              directly. Every email lands in my inbox.
            </p>

            <div className="founder-note-signature">
              <div className="founder-note-name">Aakash</div>
              <div className="founder-note-handles">
                <a href="mailto:aakash@annote.app">aakash@annote.app</a>
                <span className="founder-note-handle-divider">·</span>
                <a
                  href="https://twitter.com/aakashr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @aakashr
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
