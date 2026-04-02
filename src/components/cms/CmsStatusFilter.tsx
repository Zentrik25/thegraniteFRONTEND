"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface CmsStatusFilterProps {
  defaultValue: string;
}

/**
 * Status filter dropdown for the CMS articles list.
 * Extracted as a Client Component because <select onChange> cannot be used
 * in Server Components.
 */
export default function CmsStatusFilter({ defaultValue }: CmsStatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("status", e.target.value);
    } else {
      params.delete("status");
    }
    // Reset to page 1 when changing filter
    params.delete("page");
    router.push(`/cms/articles?${params.toString()}`);
  }

  return (
    <select
      defaultValue={defaultValue}
      onChange={handleChange}
      style={{
        padding: "0.5rem",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "0.875rem",
      }}
    >
      <option value="">All statuses</option>
      <option value="published">Published</option>
      <option value="draft">Draft</option>
      <option value="scheduled">Scheduled</option>
      <option value="archived">Archived</option>
    </select>
  );
}
