/**
 * Masthead — Playfair Display nameplate, tagline, date, pill CTAs.
 * Server component; renders above the sticky nav.
 */

import Link from "next/link";

export function Masthead() {
  return (
    <div className="gp-masthead">
      <div className="gp-masthead-inner">
        <div className="gp-masthead-top">
          <div>
            <Link
              href="/"
              className="gp-masthead-nameplate"
              aria-label="The Granite Post — home"
            >
              The Granite <em>Post</em>
            </Link>
            <p className="gp-masthead-tagline">
              Independent Zimbabwean Journalism
            </p>
          </div>

          <nav className="gp-masthead-actions" aria-label="Account actions">
            <Link href="/login" className="gp-btn-signin">
              Sign In
            </Link>
            <Link href="/subscribe" className="gp-btn-subscribe">
              Subscribe
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
