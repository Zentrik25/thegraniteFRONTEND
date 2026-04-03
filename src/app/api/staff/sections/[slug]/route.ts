import { NextResponse, type NextRequest } from "next/server";
import { forwardStaffRequest, getJsonBody } from "@/lib/api/staff-proxy";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  return forwardStaffRequest(request, `/api/v1/sections/${slug}/`);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const body = await getJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { slug } = await params;
  return forwardStaffRequest(request, `/api/v1/sections/${slug}/`, {
    method: "PATCH",
    body,
    contentType: "application/json",
  });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  return forwardStaffRequest(request, `/api/v1/sections/${slug}/`, {
    method: "DELETE",
  });
}
