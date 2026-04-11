import { type NextRequest } from "next/server";
import { forwardStaffRequest } from "@/lib/api/staff-proxy";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return forwardStaffRequest(request, "/api/v1/articles/top-stories/");
}
