import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function buildQueryString(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    } else if (typeof value === "string") {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export default async function AdminAliasCatchAllPage({
  params,
  searchParams,
}: PageProps) {
  const { path } = await params;
  const query = buildQueryString(await searchParams);
  redirect(`/cms/${path.join("/")}${query}`);
}
