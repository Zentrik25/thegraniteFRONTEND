import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="reader-apple"
      style={
        {
          "--bg": "#f5f5f7",
          "--surface": "#ffffff",
          "--surface-strong": "#ffffff",
          "--line": "#d2d2d7",
          "--ink": "#1d1d1f",
          "--muted": "rgba(0,0,0,0.48)",
          "--accent": "#0071e3",
          "--accent-deep": "#0056b3",
          "--accent-soft": "rgba(0,113,227,0.1)",
          "--dark": "#1d1d1f",
          "--radius": "8px",
          "--radius-sm": "5px",
          "--shadow": "rgba(0,0,0,0.12) 0 2px 12px",
          "--shadow-md": "rgba(0,0,0,0.18) 0 4px 24px",
          "--font": "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          "--font-ui": "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        } as React.CSSProperties
      }
    >
      {/* Tailwind colour tokens + font-serif override scoped to reader pages */}
      <style>{`
        .reader-apple {
          --color-accent:      #0071e3;
          --color-accent-deep: #0056b3;
          --color-accent-soft: rgba(0,113,227,0.1);
          --color-ink:         #1d1d1f;
          --color-muted:       rgba(0,0,0,0.48);
          --color-line:        #d2d2d7;
          --color-bg:          #f5f5f7;
          --color-surface:     #ffffff;
          --color-dark:        #1d1d1f;
        }
        /* Replace serif with SF Pro / system sans across all reader pages */
        .reader-apple .font-serif {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            "Helvetica Neue", Helvetica, Arial, sans-serif;
          letter-spacing: -0.28px;
        }
        /* Make inline body text use system sans too */
        .reader-apple body,
        .reader-apple {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
            "Helvetica Neue", Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      {/* ── Apple-style sticky dark-glass nav ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: "48px",
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#ffffff",
            textDecoration: "none",
            letterSpacing: "-0.28px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          }}
        >
          The Granite Post
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {(
            [
              { href: "/account", label: "Account" },
              { href: "/account/bookmarks", label: "Bookmarks" },
              { href: "/account/subscription", label: "Subscription" },
            ] as const
          ).map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.8)",
                textDecoration: "none",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                transition: "color 0.15s",
              }}
            >
              {label}
            </Link>
          ))}

          {/* Sign out pill */}
          <form action="/api/reader/logout" method="POST">
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "980px",
                color: "rgba(255,255,255,0.8)",
                cursor: "pointer",
                fontSize: "12px",
                padding: "3px 12px",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                transition: "border-color 0.15s, color 0.15s",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {children}
    </div>
  );
}
