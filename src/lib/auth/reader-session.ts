import { cookies } from "next/headers";

const ACCESS_COOKIE = "granite_reader_session";
const REFRESH_COOKIE = "granite_reader_refresh";
const ACCESS_MAX_AGE = 60 * 60;        // 1 hour
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

/** Read the reader access token from the httpOnly cookie (server only). */
export async function getReaderAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value ?? null;
}

/** True if a reader session cookie is present (server only). */
export async function hasReaderSession(): Promise<boolean> {
  const token = await getReaderAccessToken();
  return token !== null;
}

/** Cookie options shared between access and refresh setters. */
function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts, ACCESS_MAX_AGE, REFRESH_MAX_AGE };
