"use client";

import { FormEvent, useState, useTransition } from "react";

import { subscribeToNewsletter } from "@/lib/api/newsletter";
import { getBrowserErrorMessage } from "@/lib/api/browser";

/**
 * BBC-style full-width newsletter signup band.
 * Grey (#f6f6f6) background with thick black top border.
 * Two-column layout: copy left, form right.
 */
export function HomeNewsletterBand() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    startTransition(async () => {
      try {
        const res = await subscribeToNewsletter({ email, source: "homepage-band" });
        setMessage(res.detail);
        setEmail("");
      } catch (err) {
        setError(getBrowserErrorMessage(err, "Unable to subscribe right now."));
      }
    });
  }

  return (
    <section
      className="home-newsletter-band"
      aria-labelledby="newsletter-band-label"
    >
      <div className="home-newsletter-inner">
        {/* Copy */}
        <div className="home-newsletter-copy">
          <p className="home-newsletter-eyebrow">Free newsletter</p>
          <h2 className="home-newsletter-title" id="newsletter-band-label">
            Zimbabwe&apos;s most-read briefing, delivered daily.
          </h2>
          <p className="home-newsletter-desc">
            Join readers across Zimbabwe getting authoritative news, analysis, and
            commentary from The Granite Post — straight to your inbox, every morning.
          </p>
        </div>

        {/* Form */}
        <div className="home-newsletter-form-wrap">
          {message ? (
            <p
              className="form-feedback success"
              style={{ fontSize: "0.92rem", padding: "0.9rem 1rem" }}
              role="status"
            >
              {message}
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="home-newsletter-field-row">
                <input
                  className="home-newsletter-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  aria-label="Email address"
                  disabled={isPending}
                />
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={isPending}
                  style={{ flexShrink: 0, borderRadius: 0 }}
                >
                  {isPending ? "Subscribing…" : "Subscribe free"}
                </button>
              </div>

              {error && (
                <p className="form-feedback error" style={{ marginTop: "0.6rem" }} role="alert">
                  {error}
                </p>
              )}

              <p className="home-newsletter-note" style={{ marginTop: "0.6rem" }}>
                No spam. Unsubscribe at any time. By subscribing you agree to our{" "}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
