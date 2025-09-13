"use client";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { FaHeart, FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa";
import { useCart } from "../../../context/CartContext";
import { apiFetch } from "../../../utils/api"; // ✅ আমাদের helper ব্যবহার করা হলো

const WishlistPage = () => {
  const { cart, updateCart, wishlist, toggleWishlist } = useCart();
  const [allProducts, setAllProducts] = useState([]);

  // ✅ সব প্রোডাক্ট লোড করব DB থেকে
  useEffect(() => {
    apiFetch("/api/products")
      .then(setAllProducts)
      .catch((err) => console.error("❌ Failed to fetch products", err));
  }, []);

  // ✅ wishlist এর প্রোডাক্ট ফিল্টার করব
  const wishlistProducts = useMemo(() => {
    return allProducts.filter((p) => wishlist.includes(String(p._id)));
  }, [allProducts, wishlist]);

  if (wishlistProducts.length === 0) {
    return (
      <div>
        <p className="text-center mt-20">No products in wishlist!</p>
      </div>
    );
  }

  return (
    <div>
      <section className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Wishlist</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistProducts.map((product) => {
            const quantity = cart[String(product._id)] || 0;
            const discount =
              product.oldPrice &&
              (
                ((product.oldPrice - product.price) / product.oldPrice) *
                100
              ).toFixed(1);

            return (
              <div
                key={product._id}
                className="bg-white p-3 rounded-lg shadow-md flex flex-col"
              >
                {/* Image */}
                <div className="relative mb-2">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="rounded-lg w-full h-40 object-cover"
                  />
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      wishlist.includes(String(product._id))
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <FaHeart />
                  </button>
                </div>

                {/* Info */}
                <h4 className="font-semibold">{product.name}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-blue-600 font-bold">৳{product.price}</p>
                  {product.oldPrice && (
                    <p className="text-gray-400 line-through text-sm">
                      ৳{product.oldPrice}
                    </p>
                  )}
                  {discount && (
                    <p className="text-red-500 text-sm">{discount}% OFF</p>
                  )}
                </div>

                {/* Cart actions */}
                {!quantity ? (
                  <button
                    onClick={() => updateCart(product._id, +1)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg mt-auto flex items-center justify-center gap-1"
                  >
                    <FaShoppingCart /> Add
                  </button>
                ) : (
                  <div className="flex items-center justify-between mt-auto">
                    <button
                      onClick={() => updateCart(product._id, -1)}
                      className="bg-red-500 text-white px-2 py-1 rounded-lg"
                    >
                      <FaMinus />
                    </button>
                    <span className="font-bold">{quantity}</span>
                    <button
                      onClick={() => updateCart(product._id, +1)}
                      className="bg-green-500 text-white px-2 py-1 rounded-lg"
                    >
                      <FaPlus />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default WishlistPage;
