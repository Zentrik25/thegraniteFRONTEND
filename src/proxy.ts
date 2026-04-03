/**
 * Next.js 16 proxy (formerly middleware) — route protection for /cms/* and /account/*
 *
 * Strategy:
 *  1. If the access cookie is present, let the request through immediately.
 *  2. If the access cookie is absent but a refresh cookie exists, redirect
 *     through the appropriate /api/.../refresh?next=<path> route handler.
 *     That handler will attempt a token refresh, set a new access cookie,
 *     and redirect back to the original destination.
 *  3. If neither cookie exists, redirect straight to the login page.
 *
 * The proxy itself makes no network calls (edge-compatible).
 */

import { NextResponse, type NextRequest } from "next/server";
import { extractStaffRoleFromJwt, hasMinimumStaffRole } from "@/lib/auth/staff-roles";

/** Validate that a redirect target is a safe relative path on this origin. */
function safeNext(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  // Must be a relative path — reject anything that looks like an absolute URL
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return fallback;
  }
  return raw;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const dest = pathname + search;
  const staffRoot = pathname.startsWith("/admin") ? "/admin" : "/cms";
  const editorOnlyCmsPath =
    pathname.startsWith("/cms/sections") ||
    pathname.startsWith("/cms/categories") ||
    pathname.startsWith("/cms/tags") ||
    pathname.startsWith("/admin/sections") ||
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/tags");

  // ── Staff CMS ─────────────────────────────────────────────────────────────
  if (
    (pathname.startsWith("/cms") || pathname.startsWith("/admin")) &&
    !pathname.startsWith("/cms/login") &&
    !pathname.startsWith("/admin/login")
  ) {
    const accessToken = request.cookies.get("granite_staff_session")?.value;

    if (accessToken) {
      if (editorOnlyCmsPath) {
        const role = extractStaffRoleFromJwt(accessToken);
        if (role && !hasMinimumStaffRole(role, "editor")) {
          return NextResponse.redirect(new URL(staffRoot, request.url));
        }
      }

      return NextResponse.next();
    }

    if (request.cookies.get("granite_staff_refresh")?.value) {
      const url = new URL("/api/staff/refresh", request.url);
      url.searchParams.set("next", dest);
      return NextResponse.redirect(url);
    }

    const url = new URL(`${staffRoot}/login`, request.url);
    url.searchParams.set("next", safeNext(dest, staffRoot));
    return NextResponse.redirect(url);
  }

  // ── Reader account ────────────────────────────────────────────────────────
  if (pathname.startsWith("/account")) {
    if (request.cookies.get("granite_reader_session")?.value) {
      return NextResponse.next();
    }

    if (request.cookies.get("granite_reader_refresh")?.value) {
      const url = new URL("/api/reader/refresh", request.url);
      url.searchParams.set("next", dest);
      return NextResponse.redirect(url);
    }

    const url = new URL("/login", request.url);
    url.searchParams.set("next", safeNext(dest, "/account"));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cms/:path*", "/admin/:path*", "/account/:path*"],
};
