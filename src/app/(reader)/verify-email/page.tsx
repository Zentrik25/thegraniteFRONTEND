import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailForm from "@/components/reader/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Enter the code we sent to your email to activate your account.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-16">
      <Suspense>
        <VerifyEmailForm />
      </Suspense>
    </main>
  );
}
