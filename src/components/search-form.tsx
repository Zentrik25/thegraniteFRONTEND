"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SearchForm({
  initialQuery = "",
  autoFocus = false,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    startTransition(() => {
      router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    });
  }

  return (
    <form className="search-bar-wrap" onSubmit={onSubmit} role="search">
      <input
        className="search-input-field"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search The Granite Post…"
        aria-label="Search"
        autoFocus={autoFocus}
      />
      <button className="btn-primary" disabled={isPending} type="submit">
        {isPending ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
