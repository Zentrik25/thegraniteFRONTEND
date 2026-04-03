import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

const VALID_ROLES = new Set(["ADMIN", "EDITOR", "AUTHOR", "MODERATOR"]);

interface CreateStaffBody {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
  password: string;
}

function isValidCreateBody(raw: unknown): raw is CreateStaffBody {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const b = raw as Record<string, unknown>;
  
  // Validate email
  if (typeof b.email !== "string" || !b.email.includes("@")) return false;
  
  // Validate username
  if (typeof b.username !== "string" || b.username.length < 3) return false;
  if (!/^[a-zA-Z0-9@.+\-_]+$/.test(b.username)) return false;
  
  // Validate role
  if (typeof b.role !== "string" || !VALID_ROLES.has(b.role)) return false;
  
  // Validate password
  if (typeof b.password !== "string" || b.password.length < 8) return false;
  
  return true;
}

function validateCreateBody(raw: unknown): { valid: boolean; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};
  
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { valid: false, errors: { non_field_errors: ["Invalid request body."] } };
  }
  
  const b = raw as Record<string, unknown>;
  
  // Validate email
  if (!b.email || typeof b.email !== "string") {
    errors.email = ["Email is required."];
  } else if (!b.email.includes("@")) {
    errors.email = ["Enter a valid email address."];
  }
  
  // Validate username
  if (!b.username || typeof b.username !== "string") {
    errors.username = ["Username is required."];
  } else if (b.username.length < 3) {
    errors.username = ["Username must be at least 3 characters."];
  } else if (!/^[a-zA-Z0-9@.+\-_]+$/.test(b.username)) {
    errors.username = ["Username can only contain letters, digits, @, ., +, -, and _."];
  }
  
  // Validate role
  if (!b.role || typeof b.role !== "string") {
    errors.role = ["Role is required."];
  } else if (!VALID_ROLES.has(b.role)) {
    errors.role = [`Invalid role. Must be one of: ${Array.from(VALID_ROLES).join(", ")}`];
  }
  
  // Validate password
  if (!b.password || typeof b.password !== "string") {
    errors.password = ["Password is required."];
  } else if (b.password.length < 8) {
    errors.password = ["Password must be at least 8 characters."];
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
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
    return NextResponse.json({ errors: { non_field_errors: ["Invalid request body."] } }, { status: 400 });
  }

  // Validate using detailed validator
  const { valid, errors } = validateCreateBody(body);
  if (!valid) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Also ensure it passes the type check
  if (!isValidCreateBody(body)) {
    return NextResponse.json(
      { errors: { non_field_errors: ["Required: email, username (≥3 chars, letters/digits/@/./+/-/_), role (ADMIN|EDITOR|AUTHOR|MODERATOR), password (≥8 chars)."] } },
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
