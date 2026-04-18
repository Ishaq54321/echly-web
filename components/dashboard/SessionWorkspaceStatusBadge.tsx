export type SessionWorkspaceStatus = "active" | "done";

const STYLES: Record<SessionWorkspaceStatus, string> = {
  active: "bg-blue-50 text-blue-700",
  done: "bg-neutral-900 text-white",
};

const LABELS: Record<SessionWorkspaceStatus, string> = {
  active: "Active",
  done: "Done",
};

const BASE =
  "inline-flex items-center justify-center rounded-full px-2 py-[3px] text-xs font-medium whitespace-nowrap";

export function SessionWorkspaceStatusBadge({ status }: { status: SessionWorkspaceStatus }) {
  return (
    <span className={`${BASE} ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
