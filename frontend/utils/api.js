// frontend/utils/api.js
export async function apiFetch(path, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
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
      let errorText = "";
      try {
        errorText = await res.text();
      } catch {
        errorText = "Unknown error";
      }

      // ❌ এখানে console.error নেই
      throw new Error(
        `API error: ${res.status} ${res.statusText} → ${errorText}`
      );
    }

    return await res.json(); // ✅ সবসময় JSON ফেরত দেবে
  } catch (err) {
    // ❌ এখানে আর console.error করা হবে না
    // শুধু error throw করবো → caller (Navbar, ProductPage ইত্যাদি) handle করবে
    throw err;
  }
}
