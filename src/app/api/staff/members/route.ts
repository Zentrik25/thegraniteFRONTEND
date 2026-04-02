import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

const VALID_ROLES = new Set(["ADMIN", "EDITOR", "AUTHOR", "MODERATOR"]);

interface CreateStaffBody {
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  password: string;
}

function isValidCreateBody(raw: unknown): raw is CreateStaffBody {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const b = raw as Record<string, unknown>;
  return (
    typeof b.email === "string" &&
    b.email.includes("@") &&
    typeof b.role === "string" &&
    VALID_ROLES.has(b.role) &&
    typeof b.password === "string" &&
    b.password.length >= 8
  );
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const pageSize = String(Math.min(Number(searchParams.get("page_size") ?? "50"), 200));

  const upstream = await fetch(
    `${API_BASE_URL}/api/v1/staff/?page=${page}&page_size=${pageSize}`,
    { headers: { Authorization: `Bearer ${session}` } },
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
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

  if (!isValidCreateBody(body)) {
    return NextResponse.json(
      { error: "Required: email, role (ADMIN|EDITOR|AUTHOR|MODERATOR), password (≥8 chars)." },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/staff/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session}`,
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
