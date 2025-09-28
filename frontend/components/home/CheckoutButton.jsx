"use client";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";

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

  const handleClick = () => {
    if (!me) {
      // ❌ User login নাই → backend Google OAuth এ পাঠাও
      const redirectUrl = encodeURIComponent(
        productId
          ? `${window.location.origin}/checkout?productId=${productId}&qty=${qty || 1}`
          : `${window.location.origin}/checkout`
      );

      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google?redirect=${redirectUrl}`;
      return;
    }

    if (onClick) {
      // ✅ placeOrder function থাকলে সেটা চালাও (checkout page এ)
      onClick();
    } else {
      // ✅ Direct checkout এ যাও
      const checkoutUrl = productId
        ? `/checkout?productId=${productId}&qty=${qty || 1}`
        : `/checkout`;
      router.push(checkoutUrl);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${fullWidth ? "w-full" : ""} mt-4 py-3 font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white`}
    >
      {label ? label : total ? `অর্ডার কনফার্ম করুন ৳${total}` : "Checkout"}
    </button>
  );
}
