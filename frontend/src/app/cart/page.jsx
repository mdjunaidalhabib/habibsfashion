"use client";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../../context/CartContext";
import { useRouter } from "next/navigation";
import { FaPlus, FaMinus, FaTrash, FaHeart } from "react-icons/fa";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    setCart,
    wishlist,
    updateCart,
    removeFromCart,
    toggleWishlist,
  } = useCart();

  // ✅ সব প্রোডাক্ট লোড করব DB থেকে
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then(setAllProducts)
      .catch((err) => console.error("❌ Failed to fetch products", err));
  }, []);

  // ✅ কার্ট আইটেম বানানো
  const items = useMemo(() => {
    if (!allProducts.length) return [];
    return Object.keys(cart)
      .map((id) => {
        const p = allProducts.find((x) => String(x._id) === id);
        if (!p) return null;
        return { ...p, qty: cart[id] };
      })
      .filter(Boolean);
  }, [cart, allProducts]);

  const grandTotal = items.reduce((sum, p) => sum + p.price * p.qty, 0);

  // ✅ Checkout হ্যান্ডলার (login চেক সহ)
  const handleCheckout = async () => {
    try {
      console.log("👉 Trying to checkout full cart");

      const res = await fetch("http://localhost:4000/auth/checkout", {
        credentials: "include",
      });

      if (res.status === 401) {
        const redirectUrl = encodeURIComponent(
          "http://localhost:3000/checkout"
        );
        console.log("❌ Not logged in. Redirecting:", redirectUrl);
        window.location.href = `http://localhost:4000/auth/google?redirect=${redirectUrl}`;
        return;
      }

      console.log("✅ Logged in. Going to /checkout");
      router.push("/checkout");
    } catch (err) {
      console.error("🔥 Cart checkout error:", err);
    }
  };

  // ✅ Clear All Cart
  const handleClearCart = () => {
    setCart({});
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Your Cart</h1>

        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600"
          >
            Clear All
          </button>
        )}
      </div>

      {!items.length ? (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p>Your cart is empty.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((p) => {
            const discount =
              p.oldPrice &&
              (((p.oldPrice - p.price) / p.oldPrice) * 100).toFixed(1);
            const isInWishlist = wishlist.includes(p._id);

            return (
              <div
                key={p._id}
                className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row items-center gap-4"
              >
                {/* Image + Link */}
                <Link
                  href={`/products/${p._id}`}
                  className="w-24 h-24 relative flex-shrink-0 block"
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-contain rounded"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1">
                  <Link
                    href={`/products/${p._id}`}
                    className="font-semibold hover:underline"
                  >
                    {p.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-600 font-bold">৳{p.price}</span>
                    {p.oldPrice && (
                      <span className="line-through text-gray-400 text-sm">
                        ৳{p.oldPrice}
                      </span>
                    )}
                    {discount && (
                      <span className="text-red-500 text-sm font-medium">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Qty control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCart(p._id, -1)}
                    className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600"
                  >
                    <FaMinus />
                  </button>
                  <span className="font-bold">{p.qty}</span>
                  <button
                    onClick={() => updateCart(p._id, +1)}
                    className="bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600"
                  >
                    <FaPlus />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(p._id)}
                  className="bg-red-600 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-red-700"
                >
                  <FaTrash /> Remove
                </button>

                {/* Wishlist button */}
                <button
                  onClick={() => toggleWishlist(p._id)}
                  className={`p-3 rounded-full shadow ${
                    isInWishlist
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <FaHeart />
                </button>

                <div className="font-semibold text-blue-600 ml-auto">
                  Total: ৳{p.price * p.qty}
                </div>
              </div>
            );
          })}

          <div className="text-right font-bold text-lg mt-6">
            Grand Total: <span className="text-blue-600">৳{grandTotal}</span>
          </div>

          <div className="text-right mt-4">
            <button
              onClick={handleCheckout}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
