"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const registered = params.get("registered");

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    setStatus("verifying");

    fetch("/api/reader/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.ok) {
          setStatus("success");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(body.error || "Verification failed. The link may have expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, [token, router]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.75rem", fontWeight: 700 }}>
        Verify your email
      </h1>

      {status === "idle" && registered && (
        <>
          <p style={{ color: "var(--muted)" }}>
            We&rsquo;ve sent a verification email to your inbox. Click the link in the email to
            activate your account.
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Didn&rsquo;t receive it? Check your spam folder or{" "}
            <Link href="/register" style={{ color: "var(--accent)" }}>
              try registering again
            </Link>
            .
          </p>
        </>
      )}

      {status === "verifying" && (
        <p style={{ color: "var(--muted)" }}>Verifying your email address…</p>
      )}

      {status === "success" && (
        <div
          style={{
            background: "#f0fff4",
            border: "1px solid #c3e6cb",
            color: "#155724",
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <p style={{ fontWeight: 700 }}>Email verified!</p>
          <p style={{ fontSize: "0.875rem" }}>Redirecting you to login…</p>
        </div>
      )}

      {status === "error" && (
        <div
          style={{
            background: "#fff0f0",
            border: "1px solid #f5c6cb",
            color: "#721c24",
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <p>{message}</p>
          <Link
            href="/register"
            style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.875rem" }}
          >
            Try registering again
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
