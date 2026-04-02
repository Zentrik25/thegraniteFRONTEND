/**
 * REMOVED — this client-side cookie writer is intentionally empty.
 *
 * Reason: it stored refresh tokens in JS-readable (non-httpOnly) cookies,
 * making them accessible to any script on the page (ads, extensions, XSS).
 *
 * Session tokens are managed exclusively via httpOnly cookies set by Route
 * Handlers on the server. See:
 *   - src/lib/auth/reader-session.ts   (reader)
 *   - src/lib/auth/staff-session.ts    (staff)
 *
 * Do not re-add client-side token storage without a documented security review.
 */
export {};
