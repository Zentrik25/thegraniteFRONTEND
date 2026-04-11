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
  // Next.js 16: revalidateTag requires a second profile argument.
  // { expire: 0 } means "expire immediately" — equivalent to unconditional purge.
  const now = { expire: 0 };
  revalidateTag("articles", now);
  revalidateTag("featured", now);
  revalidateTag("top-stories", now);
  revalidateTag("breaking", now);

  if (articleSlug) revalidateTag(`article-${articleSlug}`, now);
  if (categorySlug) revalidateTag(`category-${categorySlug}`, now);
  if (sectionSlug) revalidateTag(`section-${sectionSlug}`, now);

  // ── Path-based invalidation (Full Route Cache + Vercel Edge Cache) ──────────
  revalidatePath("/");
  revalidatePath("/", "layout");

  if (articleSlug) revalidatePath(`/articles/${articleSlug}`);
  if (categorySlug) revalidatePath(`/categories/${categorySlug}`);
  if (sectionSlug) revalidatePath(`/sections/${sectionSlug}`);

  revalidatePath("/search");
}
