"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);

  // ✅ LocalStorage থেকে load করার সময় normalize
  useEffect(() => {
    // ---- Cart ----
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      const normalized = {};
      Object.keys(parsed).forEach((key) => {
        if (String(key).length > 10) {
          normalized[String(key)] = parsed[key];
        }
      });
      setCart(normalized);
      localStorage.setItem("cart", JSON.stringify(normalized));
    }

    // ---- Wishlist ----
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      const parsed = JSON.parse(savedWishlist);
      const normalized = parsed.filter((id) => String(id).length > 10);
      setWishlist(normalized.map((id) => String(id)));
      localStorage.setItem("wishlist", JSON.stringify(normalized));
    }
  }, []);

  // ✅ Save to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ✅ Cart update logic (Unique product count)
  const updateCart = (id, change) => {
    const key = String(id);
    setCart((prev) => {
      const exists = prev[key] || 0;

      // 👉 প্রথমবার add করলে শুধু 1 হবে
      if (!exists && change > 0) {
        return { ...prev, [key]: 1 };
      }

      // 👉 quantity change হলে শুধু সেই product update হবে
      const qty = exists + change;
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }

      return { ...prev, [key]: qty };
    });
  };

  // ✅ Remove product from cart
  const removeFromCart = (id) => {
    const key = String(id);
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // ✅ Toggle wishlist
  const toggleWishlist = (id) => {
    const key = String(id);
    setWishlist((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  // ✅ Unique product count (cart icon এর জন্য)
  const cartCount = Object.keys(cart).length;

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        wishlist,
        setWishlist,
        updateCart,
        removeFromCart,
        toggleWishlist,
        cartCount, // 👉 header/cart icon এ এইটা ব্যবহার করবেন
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
