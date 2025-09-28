"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../../../context/UserContext"; // ✅ ঠিক path

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMe } = useUser(); // ✅ এখানে setUser না, setMe

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      localStorage.setItem("token", token);

      const user = JSON.parse(decodeURIComponent(userStr));
      setMe(user); // ✅ context এ update হবে

      router.push("/");
    } else {
      router.push("/login");
    }
  }, []);

  return <p className="text-center">⏳ Logging in...</p>;
}
