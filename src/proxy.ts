import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Staff CMS protection ──────────────────────────────────────────────────
  if (pathname.startsWith("/cms") && pathname !== "/cms/login") {
    const staffSession = request.cookies.get("granite_staff_session");
    if (!staffSession?.value) {
      const loginUrl = new URL("/cms/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Reader account protection ─────────────────────────────────────────────
  if (pathname.startsWith("/account")) {
    const readerSession = request.cookies.get("granite_reader_session");
    if (!readerSession?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cms/:path*", "/account/:path*"],
};
