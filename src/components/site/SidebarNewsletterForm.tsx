"use client";

/**
 * SidebarNewsletterForm — compact email signup for the homepage sidebar.
 * Client component; uses the shared newsletter API action.
 */

import { FormEvent, useState, useTransition } from "react";

import { subscribeToNewsletter } from "@/lib/api/newsletter";
import { getBrowserErrorMessage } from "@/lib/api/browser";

export function SidebarNewsletterForm() {
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
          source: "homepage-sidebar",
        });
        setMessage(res.detail);
        setEmail("");
      } catch (err) {
        setError(getBrowserErrorMessage(err, "Unable to subscribe right now."));
      }
    });
  }

  if (message) {
    return (
      <p className="form-feedback success" role="status">
        {message}
      </p>
    );
  }

  return (
    <>
      <p className="gp-sidebar-nl-desc">Get the stories that matter before everyone else.</p>
      <form onSubmit={onSubmit} noValidate>
        <div className="gp-sidebar-nl-row">
          <input
            className="gp-sidebar-nl-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            aria-label="Email address"
            disabled={isPending}
          />
        </div>
        <button
          className="gp-sidebar-nl-btn"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Subscribing…" : "Subscribe free"}
        </button>

        {error && (
          <p className="form-feedback error" role="alert" style={{ marginTop: "0.5rem" }}>
            {error}
          </p>
        )}
      </form>
    </>
  );
}
