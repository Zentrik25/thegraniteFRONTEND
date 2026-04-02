import { cookies } from "next/headers";

export const STAFF_ACCESS_COOKIE = "granite_staff_session";
export const STAFF_REFRESH_COOKIE = "granite_staff_refresh";
export const STAFF_ACCESS_MAX_AGE = 60 * 60;           // 1 hour
export const STAFF_REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

/** Cookie options for staff access and refresh cookies. */
export function staffCookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Read the staff access token from the httpOnly cookie (server only). */
export async function getStaffAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(STAFF_ACCESS_COOKIE)?.value ?? null;
}

/** True if a staff session cookie is present (server only). */
export async function hasStaffSession(): Promise<boolean> {
  return (await getStaffAccessToken()) !== null;
}
