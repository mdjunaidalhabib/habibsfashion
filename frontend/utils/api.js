// frontend/utils/api.js
export async function apiFetch(path, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const url = `${baseUrl}${path}`;

  try {
    const res = await fetch(url, {
      credentials: "include", // ✅ কুকি সবসময় পাঠাবে
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `API error: ${res.status} ${res.statusText} → ${errorText}`
      );
    }

    return await res.json(); // ✅ সবসময় JSON ফেরত দেবে
  } catch (err) {
    console.error("apiFetch error:", err.message);
    throw err;
  }
}
