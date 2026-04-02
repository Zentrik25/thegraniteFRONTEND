import type { Metadata } from "next";

import { AuthorCard } from "@/components/site/AuthorCard";
import { EmptyState } from "@/components/site/EmptyState";
import { getAuthors } from "@/lib/api/users";

export const metadata: Metadata = {
  title: "Authors",
  description: "Meet the journalists and writers behind The Granite Post.",
};

export default async function AuthorsPage() {
  const authors = await getAuthors();

  return (
    <main className="container" id="main-content">
      <header className="page-header">
        <p className="page-header-eyebrow">Newsroom</p>
        <h1 className="page-header-title">Authors</h1>
        <p className="page-header-desc">
          The journalists, editors, and contributors who bring you The Granite
          Post.
        </p>
      </header>

      {authors.length === 0 ? (
        <EmptyState
          title="No author profiles yet"
          copy="Author pages will appear here as the newsroom adds bylines."
        />
      ) : (
        <div>
          {authors.map((author) => (
            <AuthorCard key={author.slug} author={author} />
          ))}
        </div>
      )}
    </main>
  );
}
