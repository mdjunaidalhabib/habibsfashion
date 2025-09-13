export async function apiFetch(path, options = {}) {
  const res = await fetch(`http://localhost:4000${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  return res;
}
