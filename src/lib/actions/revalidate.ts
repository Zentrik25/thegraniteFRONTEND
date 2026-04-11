"use server";

import { revalidatePath } from "next/cache";

/**
 * Server Action — purges the Full Route Cache and Vercel Edge Cache for pages
 * affected by a publish/unpublish event.
 *
 * Key article list fetches (homepage, featured, breaking, top-stories) use
 * cache: "no-store" so they always hit the API when the page renders — meaning
 * revalidatePath alone is sufficient: once the page is marked stale here, the
 * next render automatically fetches fresh data.
 */
export async function revalidateAfterPublish({
  articleSlug,
  categorySlug,
  sectionSlug,
}: {
  articleSlug?: string | null;
  categorySlug?: string | null;
  sectionSlug?: string | null;
}) {
  // Homepage — always flush (covers hero, top-stories, latest grid)
  revalidatePath("/");
  revalidatePath("/", "layout");

  if (articleSlug) revalidatePath(`/articles/${articleSlug}`);
  if (categorySlug) revalidatePath(`/categories/${categorySlug}`);
  if (sectionSlug) revalidatePath(`/sections/${sectionSlug}`);

  // Search results pick up newly published articles
  revalidatePath("/search");
}
