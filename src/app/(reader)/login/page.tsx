import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasReaderSession } from "@/lib/auth/reader-session";
import LoginForm from "@/components/reader/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Granite Post reader account.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Already logged in — skip the form
  if (await hasReaderSession()) {
    redirect("/account");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
