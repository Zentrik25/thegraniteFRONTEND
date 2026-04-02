import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get("granite_staff_refresh")?.value;

  // Best-effort blacklist on backend
  if (refresh) {
    await fetch(`${API_BASE_URL}/api/v1/auth/token/blacklist/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).catch(() => {});
  }

  const response = NextResponse.redirect(new URL("/cms/login", request.url));
  response.cookies.delete("granite_staff_session");
  response.cookies.delete("granite_staff_refresh");
  return response;
}
