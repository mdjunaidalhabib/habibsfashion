"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaStar, FaPlus, FaMinus, FaHeart } from "react-icons/fa";
import ProductCard from "./ProductCard";
import { useCart } from "../../context/CartContext";

export default function ProductDetailsClient({
  product,
  category,
  related = [],
}) {
  const router = useRouter();
  const { cart, setCart, wishlist, setWishlist } = useCart();

  // ---- Color Variant state ----
  const [activeColor, setActiveColor] = useState(
    product.colors?.length ? product.colors[0].name : null
  );

  // ---- Images depending on color ----
  const images = useMemo(() => {
    if (product.colors && activeColor) {
      const colorObj = product.colors.find((c) => c.name === activeColor);
      return colorObj?.images || [product.image];
    }
    if (Array.isArray(product.images) && product.images.length) {
      return product.images;
    }
    return [product.image];
  }, [product, activeColor]);

  const [activeIdx, setActiveIdx] = useState(0);

  // ✅ Cart & Wishlist
  const quantity = cart[product._id] || 0;
  const totalPrice = product.price * quantity;
  const discountPct = product.oldPrice
    ? (((product.oldPrice - product.price) / product.oldPrice) * 100).toFixed(1)
    : null;
  const isInWishlist = wishlist.includes(product._id);

  const updateCart = (id, change) => {
    setCart((prev) => {
      const qty = (prev[id] || 0) + change;
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: qty };
    });
  };

  const toggleWishlist = (id) => {
    if (isInWishlist) setWishlist(wishlist.filter((x) => x !== id));
    else setWishlist([...wishlist, id]);
  };

  // ✅ Single checkout handler
  const handleSingleCheckout = async () => {
    try {
      const checkoutUrl = `/checkout?productId=${product._id}&qty=${
        quantity || 1
      }`;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/checkout`,
        { credentials: "include" }
      );

      if (res.status === 401) {
        const redirectUrl = encodeURIComponent(
          `${window.location.origin}${checkoutUrl}`
        );
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirect=${redirectUrl}`;
        return;
      }

      router.push(checkoutUrl);
    } catch (err) {
      console.error("🔥 Checkout error:", err);
    }
  };

  const [tab, setTab] = useState("desc"); // desc | info | reviews
  const tabBtn = (key, label) => (
    <button
      onClick={() => setTab(key)}
      className={`px-4 py-2 rounded-lg text-sm font-medium ${
        tab === key
          ? "bg-gray-200 text-gray-900"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        {category && (
          <>
            <Link
              href={`/categories/${category.id}`}
              className="hover:underline"
            >
              {category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-700">{product.name}</span>
      </nav>

      {/* Top: Gallery + Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gallery */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={images[activeIdx]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Thumbs */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border ${
                    i === activeIdx
                      ? "border-blue-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
            {product.name}
          </h1>

          <p className="text-gray-600 mb-3">
            {product.subtitle || "Premium quality with elegant design."}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={
                    i < (product.rating || 0)
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.rating || 0}/5
            </span>
          </div>

          {/* Price + Wishlist */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-blue-600 font-bold text-2xl">
                ৳{product.price}
              </p>
              {product.oldPrice && (
                <p className="text-gray-400 line-through text-lg">
                  ৳{product.oldPrice}
                </p>
              )}
              {discountPct && (
                <span className="text-red-500 font-semibold">
                  -{discountPct}%
                </span>
              )}
            </div>
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`p-3 rounded-full shadow ${
                isInWishlist
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <FaHeart />
            </button>
          </div>

          {/* Add to cart + checkout */}
          {!quantity ? (
            <div className="flex gap-2">
              <button
                onClick={() => updateCart(product._id, +1)}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Add to Cart
              </button>
              <button
                onClick={handleSingleCheckout}
                className="w-40 bg-emerald-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-emerald-700"
              >
                Checkout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <button
                    onClick={() => updateCart(product._id, -1)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    <FaMinus className="w-4 h-4" />
                  </button>
                  <span className="font-bold min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateCart(product._id, +1)}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateCart(product._id, -quantity)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm">
                  Total:{" "}
                  <span className="text-blue-600 font-semibold">
                    ৳{totalPrice}
                  </span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSingleCheckout}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <section className="mt-8">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          {tabBtn("desc", "Description")}
          {tabBtn("info", "Additional Information")}
          {tabBtn("reviews", "Reviews")}
        </div>

        <div className="mt-4 bg-white rounded-2xl shadow p-4 sm:p-6 text-gray-700 leading-relaxed">
          {tab === "desc" && (
            <p>{product.description || "No description available."}</p>
          )}
          {tab === "info" && (
            <p>
              {product.additionalInfo || "No additional information provided."}
            </p>
          )}
          {tab === "reviews" && (
            <div className="text-sm">
              {product.reviews?.length ? (
                product.reviews.map((r, i) => (
                  <div key={i} className="border-b py-2">
                    <p className="font-semibold">
                      {r.user}{" "}
                      <span className="text-yellow-500">
                        {"★".repeat(r.rating)}
                      </span>{" "}
                      <span className="text-gray-500">{r.rating}/5</span>
                    </p>
                    <p>{r.comment}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related products */}
      {related?.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold">
              Related products
            </h3>
            {category && (
              <Link
                href={`/categories/${category.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View all in {category.name}
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
