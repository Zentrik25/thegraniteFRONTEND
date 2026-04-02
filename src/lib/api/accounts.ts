import { browserJson } from "@/lib/api/browser";
import type {
  BookmarkRecord,
  ApiListResponse,
  ReaderAuthResponse,
  ReaderProfile,
  ReadingHistoryRecord,
} from "@/lib/types";

export async function registerReader(payload: {
  email: string;
  username: string;
  password: string;
}) {
  return browserJson<ReaderAuthResponse>("/api/v1/accounts/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginReader(payload: { email: string; password: string }) {
  return browserJson<ReaderAuthResponse>("/api/v1/accounts/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutReader(accessToken: string) {
  return browserJson<{ detail: string }>("/api/v1/accounts/logout/", {
    method: "POST",
  }, accessToken);
}

export async function getReaderMe(accessToken: string) {
  return browserJson<ReaderProfile>("/api/v1/accounts/me/", {
    method: "GET",
  }, accessToken);
}

export async function getBookmarks(accessToken: string) {
  return browserJson<ApiListResponse<BookmarkRecord>>("/api/v1/accounts/bookmarks/", {
    method: "GET",
  }, accessToken);
}

export async function addBookmark(articleId: string | number, accessToken: string) {
  return browserJson<BookmarkRecord>("/api/v1/accounts/bookmarks/", {
    method: "POST",
    body: JSON.stringify({ article: articleId }),
  }, accessToken);
}

export async function deleteBookmark(bookmarkId: string, accessToken: string) {
  return browserJson<void>(`/api/v1/accounts/bookmarks/${bookmarkId}/`, {
    method: "DELETE",
  }, accessToken);
}

export async function getReadingHistory(accessToken: string) {
  return browserJson<ApiListResponse<ReadingHistoryRecord>>(
    "/api/v1/accounts/reading-history/",
    { method: "GET" },
    accessToken,
  );
}

export async function recordReadingHistory(
  articleId: string | number,
  accessToken: string,
) {
  return browserJson<ReadingHistoryRecord>("/api/v1/accounts/reading-history/", {
    method: "POST",
    body: JSON.stringify({ article: articleId }),
  }, accessToken);
}

export async function verifyReaderEmail(payload: { key: string }) {
  return browserJson<{ detail: string }>("/api/v1/accounts/verify-email/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotReaderPassword(payload: { email: string }) {
  return browserJson<{ detail: string }>("/api/v1/accounts/password/reset/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetReaderPassword(payload: {
  uid: string;
  token: string;
  new_password: string;
}) {
  return browserJson<{ detail: string }>("/api/v1/accounts/password/reset/confirm/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
