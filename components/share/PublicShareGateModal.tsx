"use client";

export type PublicShareGateDetail = {
  reason: "tier" | "app";
  action: "resolve" | "resolve_next" | "comment" | "assign" | "defer";
};

function messageFor(detail: PublicShareGateDetail): { title: string; body: string } {
  if (detail.reason === "app") {
    return {
      title: "Open in Echly",
      body: "Sign in to Echly to resolve tickets, comment, assign, and collaborate on this session.",
    };
  }
  switch (detail.action) {
    case "comment":
      return {
        title: "Comment not included",
        body: "This share link does not allow commenting. Ask the owner for access with comment permission.",
      };
    case "resolve":
    case "resolve_next":
      return {
        title: "Resolve not included",
        body: "This share link does not allow resolving tickets. Ask the owner for a resolve link.",
      };
    case "assign":
    case "defer":
    default:
      return {
        title: "Not available here",
        body: "This action is not available on shared links yet. Open the session in Echly to continue.",
      };
  }
}

export function PublicShareGateModal({
  detail,
  onClose,
}: {
  detail: PublicShareGateDetail | null;
  onClose: () => void;
}) {
  if (detail == null) return null;
  const { title, body } = messageFor(detail);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="public-share-gate-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 border border-[var(--layer-2-border)] shadow-[var(--layer-2-shadow-hover)] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="public-share-gate-title"
          className="text-[18px] font-semibold leading-[1.3] text-[hsl(var(--text-primary-strong))]"
        >
          {title}
        </h2>
        <p className="mt-2 text-[14px] text-secondary leading-relaxed">{body}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] px-4 py-2.5 text-[14px] font-medium text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          {detail.reason === "app" ? (
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-4 py-2.5 text-[14px] font-medium text-white hover:bg-[#1D4ED8] transition-colors"
            >
              Try Echly
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
