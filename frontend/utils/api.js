export async function apiFetch(url, options = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  // some endpoints may return 204 (no content)
  if (res.status === 204) return null;

  return res.json();
}
