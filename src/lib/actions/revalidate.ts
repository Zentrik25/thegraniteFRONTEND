"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Server Action — purges ISR cache for the homepage, article page,
 * category page, and section page immediately after publish/unpublish.
 *
 * Uses BOTH revalidateTag (busts the fetch Data Cache entries directly)
 * AND revalidatePath (busts the Full Route Cache / rendered HTML).
 * revalidateTag alone is sufficient for data freshness but revalidatePath
 * ensures Vercel's Edge Cache is cleared too.
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
  // ── Tag-based invalidation (Data Cache) ─────────────────────────────────────
  // "articles" tag is shared by all article-related fetches — busts list +
  // detail + category + section endpoints in one call.
  revalidateTag("articles");
  revalidateTag("featured");
  revalidateTag("top-stories");
  revalidateTag("breaking");

  if (articleSlug) revalidateTag(`article-${articleSlug}`);
  if (categorySlug) revalidateTag(`category-${categorySlug}`);
  if (sectionSlug) revalidateTag(`section-${sectionSlug}`);

  // ── Path-based invalidation (Full Route Cache + Vercel Edge Cache) ──────────
  revalidatePath("/");
  revalidatePath("/", "layout");

  if (articleSlug) revalidatePath(`/articles/${articleSlug}`);
  if (categorySlug) revalidatePath(`/categories/${categorySlug}`);
  if (sectionSlug) revalidatePath(`/sections/${sectionSlug}`);

  revalidatePath("/search");
}
