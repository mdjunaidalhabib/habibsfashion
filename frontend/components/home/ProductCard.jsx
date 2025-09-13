"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
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

  // MongoDB এর _id অথবা static data এর id fallback
  const productId = product._id || product.id;

  const quantity = cart[productId] || 0;
  const discount = product.oldPrice
    ? (((product.oldPrice - product.price) / product.oldPrice) * 100).toFixed(1)
    : 0;
  const isInWishlist = wishlist.includes(productId);
  const totalPrice = product.price * quantity;

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
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Link
      href={`/products/${productId}`}
      className="relative bg-white shadow-md  rounded-lg hover:shadow-lg transition flex flex-col"
    >
      {/* Discount badge */}
      {product.oldPrice && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
          -{discount}%
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(productId);
        }}
        className={`absolute top-1 right-1 p-2 rounded-full shadow-md transition ${
          isInWishlist ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
        }`}
      >
        <FaHeart className="w-4 h-4" />
      </button>

      {/* Image */}
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={300}
        className="rounded-lg mb-3 w-full h-40 sm:h-48 md:h-52 object-cover"
      />
      <div className="px-4">
        {/* Title */}
        <h4 className="font-semibold text-base sm:text-lg mb-1 truncate">
          {product.name}
        </h4>

        {/* Rating */}
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={
                i < product.rating ? "text-yellow-500 w-3" : "text-gray-300 w-3"
              }
            />
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 ">
          <p className="text-blue-600 font-bold text-sm sm:text-base">
            ৳{product.price}
          </p>
          {product.oldPrice && (
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
            className="my-3 sm:mt-4 sm:mb-2 bg-blue-900 w-full text-white px-3 py-1 sm:px-4 sm:py-2  rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800 text-sm sm:text-base"
          >
            <FaShoppingCart /> Add
          </button>
        ) : (
          <div className=" ">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm ">Quantity:</span>
              <div className="flex items-center space-x-1 sm:space-x-2 rounded-lg ">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCart(productId, -1);
                  }}
                  className="bg-gray-50 text-black p-1 sm:p-2 rounded-lg hover:bg-gray-100"
                >
                  <FaMinus className="w-3 h-3 sm:w-3 sm:h-3" />
                </button>
                <span className="text-sm  font-bold">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCart(productId, +1);
                  }}
                  className="bg-gray-50 text-black p-1 sm:p-2 rounded-lg hover:bg-gray-100"
                >
                  <FaPlus className="w-2 h-3 sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>
            <hr className="border-t border-gray-300 m-1" />
            <p className="text-center font-semibold text-gray-700 text-sm sm:text-base ">
              Total: <span className="text-blue-600">৳{totalPrice}</span>
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
