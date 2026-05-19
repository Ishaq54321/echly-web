"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Auto-submitting unsubscribe form.
 *
 * On mount (real browser, JS running) it submits immediately so the flow
 * feels one-click. Email link-prefetch bots and security scanners fetch the
 * page over GET but do not run this effect, so they never trigger the
 * server-action POST — preventing accidental unsubscribes. The visible button
 * is the no-JS fallback and also covers the brief auto-submit window.
 */
export function UnsubscribeForm({
  action,
  token,
}: {
  action: (formData: FormData) => void | Promise<void>;
  token: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSubmitting(true);
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form
      ref={formRef}
      action={action}
      className="mt-6"
      onSubmit={() => setSubmitting(true)}
    >
      <input type="hidden" name="token" value={token} />
      <button
        type="submit"
        disabled={submitting}
        className="inline-block bg-[#15101F] text-white px-6 py-3 rounded-md font-medium disabled:opacity-70"
      >
        {submitting ? "Unsubscribing…" : "Confirm unsubscribe"}
      </button>
    </form>
  );
}
