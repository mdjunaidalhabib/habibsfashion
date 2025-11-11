// lib/auth.js
export function getToken() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token") || null; // localStorage থেকে টোকেন
    return token && token !== "undefined" && token !== "null" ? token : null;
  }
  return null;
}
