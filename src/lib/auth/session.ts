"use client";

// Cookie-based session management — runs in the browser only.
// Access tokens expire in 1h; refresh tokens in 7 days.

type SessionKind = "reader" | "staff";

const KEYS = {
  reader: { access: "granite_reader_access", refresh: "granite_reader_refresh" },
  staff: { access: "granite_staff_access", refresh: "granite_staff_refresh" },
} as const;

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function saveSession(
  kind: SessionKind,
  access: string,
  refresh: string,
) {
  setCookie(KEYS[kind].access, access, 60 * 60);        // 1h
  setCookie(KEYS[kind].refresh, refresh, 60 * 60 * 24 * 7); // 7d
}

export function clearSession(kind: SessionKind) {
  deleteCookie(KEYS[kind].access);
  deleteCookie(KEYS[kind].refresh);
}

export function getAccessToken(kind: SessionKind): string | null {
  return getCookie(KEYS[kind].access);
}

export function getRefreshToken(kind: SessionKind): string | null {
  return getCookie(KEYS[kind].refresh);
}

export function hasSession(kind: SessionKind): boolean {
  return Boolean(getAccessToken(kind));
}
