import { NextResponse, type NextRequest } from "next/server";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";
import { API_BASE_URL } from "@/lib/env";

function buildUpstreamUrl(path: string, request: NextRequest): string {
  return `${API_BASE_URL}${path}${request.nextUrl.search || ""}`;
}

export function getStaffToken(request: NextRequest) {
  return request.cookies.get(STAFF_ACCESS_COOKIE)?.value ?? null;
}

export async function getJsonBody(request: NextRequest) {
  const body = await request.text().catch(() => "");
  return body.trim() ? body : null;
}

export function unauthorizedJson() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function forwardStaffRequest(
  request: NextRequest,
  path: string,
  options?: {
    method?: string;
    body?: BodyInit | null;
    contentType?: string;
  },
) {
  const token = getStaffToken(request);
  if (!token) return unauthorizedJson();

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  if (options?.contentType) {
    headers.set("Content-Type", options.contentType);
  }

  const upstream = await fetch(buildUpstreamUrl(path, request), {
    method: options?.method ?? request.method,
    headers,
    body: options?.body ?? null,
    cache: "no-store",
  });

  const responseText = await upstream.text();
  const contentType =
    upstream.headers.get("content-type") ?? "application/json; charset=utf-8";

  return new NextResponse(responseText || null, {
    status: upstream.status,
    headers: responseText ? { "Content-Type": contentType } : undefined,
  });
}
