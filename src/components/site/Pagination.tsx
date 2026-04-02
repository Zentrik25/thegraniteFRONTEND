import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Build the href for a given page number */
  buildHref: (page: number) => string;
}

export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Show at most 7 page slots: prev · up to 5 page numbers · next
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <Link
        className={`page-btn${currentPage <= 1 ? " disabled" : ""}`}
        href={currentPage > 1 ? buildHref(currentPage - 1) : "#"}
        aria-disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        ←
      </Link>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="page-btn disabled" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={p}
            className={`page-btn${p === currentPage ? " active" : ""}`}
            href={buildHref(p)}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        className={`page-btn${currentPage >= totalPages ? " disabled" : ""}`}
        href={currentPage < totalPages ? buildHref(currentPage + 1) : "#"}
        aria-disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        →
      </Link>
    </nav>
  );
}
