import { NextResponse, type NextRequest } from "next/server";
import { forwardStaffRequest, getJsonBody } from "@/lib/api/staff-proxy";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return forwardStaffRequest(request, "/api/v1/categories/");
}

export async function POST(request: NextRequest) {
  const body = await getJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  return forwardStaffRequest(request, "/api/v1/categories/", {
    method: "POST",
    body,
    contentType: "application/json",
  });
}
