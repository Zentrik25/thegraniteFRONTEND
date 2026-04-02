/**
 * Convert a Django media URL to a browser-reachable proxy path.
 *
 * Django builds absolute URLs using request.build_absolute_uri() →
 * e.g. http://127.0.0.1:8000/media/images/foo.jpg — unreachable from the browser.
 *
 * Any URL whose pathname starts with /media/ is rewritten to go through the
 * /api/media/[...path] Next.js route handler, which proxies to the Django backend
 * using the server-side API_BASE_URL env var (works in both dev and production).
 *
 * Non-media URLs (CDN links, Unsplash, etc.) are returned unchanged.
 */
export function mediaProxyPath(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { pathname } = new URL(url);
    if (pathname.startsWith("/media/")) {
      // Strip /media prefix — the proxy route prepends it when fetching from Django.
      return `/api/media${pathname.slice("/media".length)}`;
    }
  } catch {
    // Already a relative path — pass through as-is.
  }
  return url;
}
