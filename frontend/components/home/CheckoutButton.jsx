"use client";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useState, useCallback } from "react";

export default function CheckoutButton({
  product,       // Product object for stock check
  productId,     // Optional productId for direct checkout
  qty = 1,       // Default quantity
  total,         // Optional total amount for display
  fullWidth,     // If true, button takes full width
  onClick,       // Optional custom click handler
  label,         // Optional custom label
}) {
  const router = useRouter();
  const { me } = useUser();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    if (loading) return;

    // Disable if out of stock
    if (product && product.stock <= 0) return;

    setLoading(true);

    // 🔹 User not logged in → redirect to Google Auth
    if (!me) {
      const checkoutUrl = productId
        ? `${window.location.origin}/checkout?productId=${productId}&qty=${qty}`
        : `${window.location.origin}/checkout`;

      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google?redirect=${encodeURIComponent(
        checkoutUrl
      )}`;
      return;
    }

    // 🔹 Custom onClick provided → execute it
    if (onClick) {
      onClick();
      setLoading(false);
      return;
    }

    // 🔹 Default checkout route
    const checkoutUrl = productId
      ? `/checkout?productId=${productId}&qty=${qty}`
      : `/checkout`;

    router.push(checkoutUrl);
  }, [loading, me, onClick, product, productId, qty, router]);

  const isDisabled = loading || (product && product.stock <= 0);

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${fullWidth ? "w-full" : "w-auto"} 
        px-4 sm:px-24 py-3 font-medium rounded-lg
        bg-green-600 hover:bg-green-700 transition-colors duration-200
        text-white shadow-md
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      `}
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span> Processing...
        </>
      ) : label ? (
        label
      ) : total ? (
        `অর্ডার কনফার্ম করুন ৳${total}`
      ) : (
        "Checkout"
      )}
    </button>
  );
}
