"use server";

import { revalidatePath } from "next/cache";

/**
 * Server Action — purges ISR cache for the homepage, article page,
 * category page, and section page immediately after publish/unpublish.
 * Runs server-side so no secret needs to be passed from the browser.
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
  // Always flush the homepage
  revalidatePath("/");
  revalidatePath("/", "layout");

  if (articleSlug) revalidatePath(`/articles/${articleSlug}`);
  if (categorySlug) revalidatePath(`/categories/${categorySlug}`);
  if (sectionSlug) revalidatePath(`/sections/${sectionSlug}`);
}
