import { safeApiFetch, unwrapList } from "@/lib/api/fetcher";
import type { ApiListResponse, UserDetailResponse, UserProfile } from "@/lib/types";

export async function getAuthors() {
  const result = await safeApiFetch<ApiListResponse<UserProfile> | UserProfile[]>(
    "/api/v1/users/",
    { next: { revalidate: 300 } },
  );
  return result.data ? unwrapList(result.data) : [];
}

export async function getAuthor(slug: string) {
  const result = await safeApiFetch<UserDetailResponse>(`/api/v1/users/${slug}/`, {
    next: { revalidate: 120 },
  });
  return result.data;
}
