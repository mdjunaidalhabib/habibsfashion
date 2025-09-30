"use client";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useState, useCallback } from "react";

export default function CheckoutButton({
  productId,
  qty,
  total,
  fullWidth,
  onClick,
  label,
}) {
  const router = useRouter();
  const { me } = useUser(); // ✅ logged-in user check
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    if (loading) return; // 🔹 Double-click রোধ
    setLoading(true);

    if (!me) {
      // ❌ User login নাই → backend Google OAuth এ পাঠাও
      const checkoutUrl = productId
        ? `${window.location.origin}/checkout?productId=${productId}&qty=${qty || 1}`
        : `${window.location.origin}/checkout`;

      // ✅ এখন সবসময় /auth/callback এ আসবে
      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google?redirect=${encodeURIComponent(
        checkoutUrl
      )}`;
      return;
    }

    if (onClick) {
      // ✅ placeOrder function থাকলে সেটা চালাও (checkout page এ)
      onClick();
      setLoading(false); // onClick শেষ হলে reset করো
    } else {
      // ✅ Direct checkout এ যাও
      const checkoutUrl = productId
        ? `/checkout?productId=${productId}&qty=${qty || 1}`
        : `/checkout`;
      router.push(checkoutUrl);
    }
  }, [loading, me, onClick, productId, qty, router]);

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${fullWidth ? "w-full" : ""} px-4 sm:px-24 py-3 font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading
        ? "⏳ Processing..."
        : label
        ? label
        : total
        ? `অর্ডার কনফার্ম করুন ৳${total}`
        : "Checkout"}
    </button>
  );
}
