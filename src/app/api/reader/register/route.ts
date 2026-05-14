import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/api/v1/accounts/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the server. Try again." }, { status: 502 });
  }

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({})) as Record<string, unknown>;

    // The backend uses a custom exception format:
    //   { status, code, message, errors: { field: "msg" } }
    // Normalize to what the form expects:
    //   { detail: "...", email: ["..."], username: ["..."] }
    const normalized: Record<string, unknown> = {};

    if (err.errors && typeof err.errors === "object") {
      for (const [key, val] of Object.entries(err.errors as Record<string, unknown>)) {
        // Wrap string values in an array so the form's existing mapping works
        normalized[key] = typeof val === "string" ? [val] : val;
      }
    }

    normalized.detail =
      typeof err.message === "string" ? err.message :
      typeof err.detail  === "string" ? err.detail  :
      upstream.status >= 500          ? "Server error. Please try again in a moment." :
                                        "Registration failed. Please try again.";

    return NextResponse.json(normalized, { status: upstream.status });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
