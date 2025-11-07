"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);

  // ✅ কার্ট কাউন্ট
  const cartCount = Object.keys(cart).length;

  // ✅ Add / Update Cart Logic
  const updateCart = (id, change = 1, isFromAddButton = false) => {
    setCart((prev) => {
      const exists = prev[id] || 0;

      // 🔹 "Add" বাটন থেকে নতুন প্রোডাক্ট যোগ
      if (isFromAddButton) {
        if (exists) return { ...prev, [id]: exists + 1 };
        return { ...prev, [id]: 1 };
      }

      // 🔹 ➕ ➖ বাটনের জন্য
      const newQty = exists + change;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }

      return { ...prev, [id]: newQty };
    });
  };

  // ✅ একক প্রোডাক্ট রিমুভ
  const removeFromCart = (id) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // ✅ Wishlist toggle
  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ LocalStorage Sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [cart, wishlist]);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        wishlist,
        setWishlist,
        cartCount,
        updateCart,
        removeFromCart,
        toggleWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
