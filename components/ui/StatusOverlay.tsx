"use client";

export type StatusOverlayProps = {
  title: string;
  message: string;
};

/**
 * Fixed overlay for workspace status fetch failures. Does not unmount underlying UI.
 */
export function StatusOverlay({ title, message }: StatusOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-6 backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="echly-status-overlay-title"
    >
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-xl">
        <p id="echly-status-overlay-title" className="text-lg font-medium text-gray-900">
          {title}
        </p>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <button
          type="button"
          className="mt-5 rounded-lg bg-[#466EFF] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    </div>
  );
}
