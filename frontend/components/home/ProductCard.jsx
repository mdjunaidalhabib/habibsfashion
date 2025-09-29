"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaStar,
  FaHeart,
  FaShoppingCart,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";

const ProductCard = ({ product }) => {
  const { cart, setCart, wishlist, setWishlist } = useCart();

  const productId = product?._id || product?.id;
  const quantity = cart[productId] || 0;

  const discount = product?.oldPrice
    ? (((product.oldPrice - product.price) / product.oldPrice) * 100).toFixed(1)
    : 0;

  const isInWishlist = wishlist.includes(productId);
  const totalPrice = product?.price * quantity;

  // ✅ Main image (Cloudinary URL direct)
  const mainImage =
    product?.images && product.images.length > 0
      ? product.images[0]
      : product?.image;

  // ✅ Updated Cart Logic
  const updateCart = (id, change) => {
    setCart((prev) => {
      const exists = prev[id] || 0;

      // প্রথমবার Add করলে cart এ 1 product count হবে
      if (!exists && change > 0) {
        return { ...prev, [id]: 1 };
      }

      // Quantity change হলে শুধু সেই product update হবে
      const qty = exists + change;
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }

      return { ...prev, [id]: qty };
    });
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Link
      href={`/products/${productId}`}
      className="relative bg-white shadow-md rounded-lg hover:shadow-lg transition flex flex-col"
    >
      {/* ✅ Image Container */}
      <div className="relative w-full h-40 sm:h-48 md:h-52 mb-3">
        {/* ✅ Top Badges inside image container */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
          {/* Discount badge */}
          {product?.oldPrice && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition transform hover:scale-105">
              -{discount}%
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(productId);
            }}
            className={`p-2 rounded-full shadow-md transition transform hover:scale-110 ${
              isInWishlist ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            <FaHeart className="w-4 h-4" />
          </button>
        </div>

        {/* ✅ Product Image */}
        {mainImage && (
          <Image
            src={mainImage} // ✅ Direct Cloudinary URL
            alt={product?.name || "Product"}
            fill
            className="rounded-lg object-cover"
            priority
          />
        )}
      </div>

      <div className="px-4 pb-3">
        {/* Title */}
        <h4 className="font-semibold text-base sm:text-lg mb-1 truncate">
          {product?.name}
        </h4>

        {/* Stock Info */}
        <p
          className={`text-xs font-medium mb-2 ${
            product?.stock > 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {product?.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={
                i < product?.rating ? "text-yellow-500 w-3" : "text-gray-300 w-3"
              }
            />
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <p className="text-blue-600 font-bold text-sm sm:text-base">
            ৳{product?.price}
          </p>
          {product?.oldPrice && (
            <p className="text-gray-400 line-through text-xs sm:text-sm">
              ৳{product.oldPrice}
            </p>
          )}
        </div>

        {/* Cart actions */}
        {!quantity ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              updateCart(productId, +1);
            }}
            className="my-3 sm:mt-4 sm:mb-2 bg-blue-900 w-full text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800 text-sm sm:text-base"
            disabled={product?.stock <= 0}
          >
            <FaShoppingCart /> Add
          </button>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Quantity:</span>
              <div className="flex items-center space-x-1 sm:space-x-2 rounded-lg">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCart(productId, -1);
                  }}
                  className="bg-gray-50 text-black p-1 sm:p-2 rounded-lg hover:bg-gray-100"
                >
                  <FaMinus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCart(productId, +1);
                  }}
                  disabled={quantity >= product?.stock}
                  className="bg-gray-50 text-black p-1 sm:p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <FaPlus className="w-2 h-3" />
                </button>
              </div>
            </div>
            <hr className="border-t border-gray-300 m-1" />
            <p className="text-center font-semibold text-gray-700 text-sm sm:text-base">
              Total: <span className="text-blue-600">৳{totalPrice}</span>
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
