export async function api<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (typeof init.body === "string" && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  let json: unknown = null;
  try { json = await res.json(); } catch { /* empty body */ }
  if (res.status === 401 && url.startsWith("/api/admin") && typeof window !== "undefined") {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/admin/login";
  }
  if (!res.ok) throw new Error((json as { error?: string } | null)?.error ?? "Something went wrong. Please try again.");
  return json as T;
}
