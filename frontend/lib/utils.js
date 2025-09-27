export async function apiFetch(url, options = {}) {
  return fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}${url}`, {
    ...options,
    credentials: "include", // ✅ cookie পাঠাতে হবে
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}
