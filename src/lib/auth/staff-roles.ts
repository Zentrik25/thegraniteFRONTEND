const ROLE_HIERARCHY = [
  "contributor",
  "author",
  "moderator",
  "editor",
  "senior_editor",
  "admin",
] as const;

export type StaffRoleName = (typeof ROLE_HIERARCHY)[number];

const ROLE_ALIASES: Record<string, StaffRoleName> = {
  CONTRIBUTOR: "contributor",
  contributor: "contributor",
  AUTHOR: "author",
  author: "author",
  MODERATOR: "moderator",
  moderator: "moderator",
  EDITOR: "editor",
  editor: "editor",
  SENIOR_EDITOR: "senior_editor",
  senior_editor: "senior_editor",
  "senior editor": "senior_editor",
  ADMIN: "admin",
  admin: "admin",
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  return Buffer.from(padded, "base64").toString("utf8");
}

export function normalizeStaffRole(role?: string | null): StaffRoleName | null {
  if (!role) return null;
  return ROLE_ALIASES[role] ?? null;
}

export function hasMinimumStaffRole(
  role: string | null | undefined,
  minimum: StaffRoleName,
): boolean {
  const normalizedRole = normalizeStaffRole(role);
  const normalizedMinimum = normalizeStaffRole(minimum);
  if (!normalizedRole || !normalizedMinimum) return false;

  return (
    ROLE_HIERARCHY.indexOf(normalizedRole) >=
    ROLE_HIERARCHY.indexOf(normalizedMinimum)
  );
}

export function decodeJwtPayload(
  token?: string | null,
): Record<string, unknown> | null {
  if (!token) return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    return JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractStaffRoleFromJwt(token?: string | null): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  if (typeof payload["role"] === "string") {
    return payload["role"];
  }

  if (typeof payload["staff_role"] === "string") {
    return payload["staff_role"];
  }

  if (
    payload["user"] &&
    typeof payload["user"] === "object" &&
    typeof (payload["user"] as Record<string, unknown>)["role"] === "string"
  ) {
    return (payload["user"] as Record<string, string>)["role"];
  }

  return null;
}
