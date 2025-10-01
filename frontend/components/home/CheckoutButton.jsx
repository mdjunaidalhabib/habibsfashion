"use client";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useState, useCallback } from "react";

export default function CheckoutButton({
  product,   // নতুন prop → stock check
  productId,
  qty = 1,   // default quantity
  total,
  fullWidth,
  onClick,
  label,
}) {
  const router = useRouter();
  const { me } = useUser();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    if (loading) return;
    setLoading(true);

    // ✅ লগ-ইন না করা থাকলে Google Auth এ পাঠানো হবে
    if (!me) {
      const checkoutUrl = productId
        ? `${window.location.origin}/checkout?productId=${productId}&qty=${qty}`
        : `${window.location.origin}/checkout`;

      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google?redirect=${encodeURIComponent(
        checkoutUrl
      )}`;
      return;
    }

    // ✅ custom onClick থাকলে সেটাই চলবে
    if (onClick) {
      onClick();
      setLoading(false);
      return;
    }

    // ✅ default checkout route
    const checkoutUrl = productId
      ? `/checkout?productId=${productId}&qty=${qty}`
      : `/checkout`;

    router.push(checkoutUrl);
  }, [loading, me, onClick, productId, qty, router]);

  const isDisabled = loading || !product || product?.stock <= 0;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`${fullWidth ? "w-full" : ""} 
        px-4 sm:px-24 py-3 font-medium rounded-lg 
        bg-green-600 hover:bg-green-700 text-white 
        disabled:opacity-50 disabled:cursor-not-allowed`}
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
