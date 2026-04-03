export function handleCmsAuthRedirect(status: number): boolean {
  if (typeof window === "undefined") return false;

  if (status === 401) {
    window.location.href = "/cms/login";
    return true;
  }

  if (status === 403) {
    window.location.href = "/cms";
    return true;
  }

  return false;
}
