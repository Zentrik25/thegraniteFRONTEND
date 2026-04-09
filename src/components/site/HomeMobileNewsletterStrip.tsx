"use client";

/**
 * HomeMobileNewsletterStrip — compact newsletter signup shown on mobile only,
 * placed immediately after the Top Stories block for early visibility.
 * Hidden at ≥900px (desktop uses the full HomeNewsletterBand at the bottom).
 */

import { FormEvent, useState, useTransition } from "react";

import { subscribeToNewsletter } from "@/lib/api/newsletter";
import { getBrowserErrorMessage } from "@/lib/api/browser";

export function HomeMobileNewsletterStrip() {
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
        const res = await subscribeToNewsletter({
          email,
          source: "homepage-mobile-strip",
        });
        setMessage(res.detail);
        setEmail("");
      } catch (err) {
        setError(getBrowserErrorMessage(err, "Unable to subscribe right now."));
      }
    });
  }

  return (
    <div className="gp-mobile-nl-wrap gp-container">
      <section
        className="gp-mobile-nl-card"
        aria-labelledby="gp-mobile-nl-label"
      >
        <div className="gp-mobile-nl-copy">
          <p className="gp-mobile-nl-eyebrow">Free newsletter</p>
          <h2 className="gp-mobile-nl-headline" id="gp-mobile-nl-label">
            Zimbabwe&rsquo;s most-read daily briefing.
          </h2>
          <p className="gp-mobile-nl-body">
            The news that matters, explained clearly and delivered to your inbox
            every morning.
          </p>
        </div>

        {message ? (
          <p className="gp-mobile-nl-success" role="status">
            {message}
          </p>
        ) : (
          <form className="gp-mobile-nl-form" onSubmit={onSubmit} noValidate>
            <input
              className="gp-mobile-nl-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              aria-label="Email address"
              disabled={isPending}
            />
            <button
              className="gp-mobile-nl-btn"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Subscribing…" : "Subscribe free"}
            </button>

            {error && (
              <p className="gp-mobile-nl-error" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
