import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

/**
 * Django builds media URLs using request.build_absolute_uri() →
 * http://127.0.0.1:8000/media/... — unreachable from the browser.
 *
 * We add a `proxy_url` field to every media item pointing to our
 * /api/media/... pass-through route so images render in the browser.
 * The original `url` (absolute backend URL) is preserved — that's what
 * gets saved into Article.image_url (a URLField requiring a valid URL).
 */
function withProxyUrl(item: Record<string, unknown>): Record<string, unknown> {
  if (typeof item.url !== "string") return item;
  try {
    const parsed = new URL(item.url);
    if (parsed.pathname.startsWith("/media/")) {
      // Strip the leading "/media" so the proxy route receives the subpath only.
      // /api/media/[...path] already prepends /media/ when fetching from Django.
      return { ...item, proxy_url: `/api/media${parsed.pathname.slice("/media".length)}` };
    }
  } catch {
    // Not a parseable URL — leave as-is.
  }
  return item;
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const pageSize = String(Math.min(Number(searchParams.get("page_size") ?? "48"), 100));

  const upstream = await fetch(
    `${API_BASE_URL}/api/v1/media/?page=${page}&page_size=${pageSize}`,
    { headers: { Authorization: `Bearer ${session}` } },
  );

  const data = await upstream.json().catch(() => ({}));

  if (data && Array.isArray(data.results)) {
    data.results = data.results.map(withProxyUrl);
  }

  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const outForm = new FormData();
  outForm.append("file", file, file instanceof File ? file.name : "upload");

  const upstream = await fetch(`${API_BASE_URL}/api/v1/media/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session}` },
    body: outForm,
  });

  const data = await upstream.json().catch(() => ({}));

  const rewritten =
    data && typeof data === "object" && !Array.isArray(data)
      ? withProxyUrl(data as Record<string, unknown>)
      : data;

  return NextResponse.json(rewritten, { status: upstream.status });
}
