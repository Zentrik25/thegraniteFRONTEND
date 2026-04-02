"use client";

import { FormEvent, useState, useTransition } from "react";

import { getBrowserErrorMessage } from "@/lib/api/browser";
import { subscribeToNewsletter } from "@/lib/api/newsletter";

export function NewsletterForm({ source = "frontend" }: { source?: string }) {
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
        const res = await subscribeToNewsletter({ email, source });
        setMessage(res.detail);
        setEmail("");
      } catch (err) {
        setError(getBrowserErrorMessage(err, "Unable to subscribe right now."));
      }
    });
  }

  return (
    <div className="newsletter-block">
      <p className="newsletter-block-eyebrow">Newsletter</p>
      <h3 className="newsletter-block-title">
        Top stories, straight to your inbox.
      </h3>
      <p className="newsletter-block-copy">
        Join readers across Zimbabwe getting The Granite Post delivered daily.
      </p>
      <form onSubmit={onSubmit}>
        <div className="newsletter-row">
          <input
            className="newsletter-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            aria-label="Email address"
          />
          <button className="btn-primary btn-sm" disabled={isPending} type="submit">
            {isPending ? "..." : "Subscribe"}
          </button>
        </div>
        {message && (
          <p className="form-feedback success" style={{ marginTop: "0.6rem" }}>
            {message}
          </p>
        )}
        {error && (
          <p className="form-feedback error" style={{ marginTop: "0.6rem" }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
