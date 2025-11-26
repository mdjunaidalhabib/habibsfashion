"use client";
import { useEffect } from "react";

export default function AdminPWARegister() {
  useEffect(() => {
    // ✅ dev এ SW off থাকবে
    if (process.env.NODE_ENV !== "production") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/admin-sw.js")
        .then(() => console.log("✅ Admin SW registered"))
        .catch((err) => console.log("❌ Admin SW failed", err));
    }
  }, []);

  return null;
}
