import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

interface ChangePasswordBody {
  old_password: string;
  new_password: string;
}

function isValidBody(raw: unknown): raw is ChangePasswordBody {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const b = raw as Record<string, unknown>;
  return (
    typeof b.old_password === "string" &&
    b.old_password.length > 0 &&
    typeof b.new_password === "string" &&
    b.new_password.length >= 8
  );
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "Required: old_password, new_password (≥8 chars)." },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/auth/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session}`,
    },
    body: JSON.stringify(body),
  });

  if (upstream.status === 204 || upstream.status === 200) {
    const text = await upstream.text();
    if (!text) return NextResponse.json({ ok: true }, { status: 200 });
    const data = JSON.parse(text);
    return NextResponse.json(data, { status: upstream.status });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
