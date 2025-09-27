"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const user = params.get("user");

    if (token) {
      localStorage.setItem("token", token);
      if (user) {
        try {
          localStorage.setItem("user", user);
        } catch {}
      }
      router.replace("/");
    } else {
      router.replace("/login");
    }
  }, [params, router]);

  return <p className="text-center mt-10">Completing login...</p>;
}
