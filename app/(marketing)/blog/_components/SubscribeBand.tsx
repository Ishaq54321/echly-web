"use client";

/**
 * "Subscribe to the blog" email-capture band.
 *
 * TODO(newsletter): the submit is a visual stub — it validates the address
 * and flips to a success state, but doesn't send the email anywhere yet.
 * Wire `handleSubmit` to the newsletter backend of choice (e.g. a /api
 * route that writes to ConvertKit/Resend/Firestore) when one exists.
 */

import { useState } from "react";
import { Check } from "lucide-react";

export function SubscribeBand() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  };

  return (
    <section className="blg-subscribe">
      <div className="blg-container">
        <div className="blg-subscribe-panel">
          <h2 className="nv-h5 blg-subscribe-title">Subscribe to the blog</h2>
          <p className="nv-body blg-subscribe-sub">
            Product updates, engineering notes, and the occasional strong
            opinion about bug reports. No noise.
          </p>

          {done ? (
            <p className="blg-subscribe-done">
              <Check size={17} strokeWidth={2.5} aria-hidden="true" />
              Thanks — you&rsquo;re on the list.
            </p>
          ) : (
            <form className="blg-subscribe-form" onSubmit={handleSubmit}>
              <label className="nv-sr" htmlFor="blg-subscribe-email">
                Email address
              </label>
              <input
                id="blg-subscribe-email"
                className="blg-subscribe-input"
                type="email"
                required
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="nv-btn nv-btn--primary-inverse">
                Subscribe
              </button>
            </form>
          )}
          <p className="blg-subscribe-note">
            One or two emails a month. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
