import type { Metadata } from "next";
import { hasReaderSession } from "@/lib/auth/reader-session";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/reader/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free Granite Post reader account for unlimited access to Zimbabwe's top news.",
  robots: { index: true, follow: true },
};

export default async function RegisterPage() {
  if (await hasReaderSession()) {
    redirect("/account");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-16">
      <RegisterForm />
    </main>
  );
}
