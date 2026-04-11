import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * POST /api/revalidate
 *
 * On-demand ISR purge. Call this from the Django backend (or CMS) immediately
 * after publishing, unpublishing, or updating an article so the homepage and
 * section pages reflect the change without waiting for the revalidate timer.
 *
 * Body (JSON):
 *   {
 *     "secret": "<REVALIDATE_SECRET env var>",
 *     "article_slug": "my-article-slug",           // optional
 *     "category_slug": "crime-courts",             // optional
 *     "section_slug": "news",                      // optional
 *     "paths": ["/", "/sections/news"]             // optional extra paths
 *   }
 *
 * Always revalidates "/" (homepage). Conditionally revalidates article/category/section
 * pages when their slugs are provided.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    secret: providedSecret,
    article_slug,
    category_slug,
    section_slug,
    paths,
  } = body as Record<string, unknown>;

  // Validate secret (skip check if env var not set — useful for local dev)
  if (secret && providedSecret !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const revalidated: string[] = [];

  function purge(path: string) {
    revalidatePath(path);
    revalidated.push(path);
  }

  // Always revalidate the homepage
  purge("/");

  // Article detail page
  if (typeof article_slug === "string" && article_slug) {
    purge(`/articles/${article_slug}`);
  }

  // Category page
  if (typeof category_slug === "string" && category_slug) {
    purge(`/categories/${category_slug}`);
  }

  // Section page
  if (typeof section_slug === "string" && section_slug) {
    purge(`/sections/${section_slug}`);
  }

  // Any extra paths the caller wants to purge
  if (Array.isArray(paths)) {
    for (const p of paths) {
      if (typeof p === "string" && p) purge(p);
    }
  }

  return NextResponse.json({ ok: true, revalidated });
}
