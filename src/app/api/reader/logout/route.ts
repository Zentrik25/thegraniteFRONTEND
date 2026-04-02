import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get("granite_reader_refresh")?.value;

  if (refresh) {
    await fetch(`${API_BASE_URL}/api/v1/accounts/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).catch(() => {});
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete("granite_reader_session");
  response.cookies.delete("granite_reader_refresh");
  return response;
}
