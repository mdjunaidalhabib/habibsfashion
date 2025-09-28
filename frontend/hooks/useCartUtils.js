"use client";
import { useCart } from "../context/CartContext";

export function useCartUtils() {
  const { cart, setCart, wishlist, setWishlist, removeFromCart } = useCart();

  // 🛒 Cart update logic
  const updateCart = (id, change, stock) => {
    setCart((prev) => {
      const currentQty = prev[id] || 0;
      const newQty = currentQty + change;

      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }

      if (stock && newQty > stock) return prev;
      return { ...prev, [id]: newQty };
    });
  };

  // ❤️ Wishlist toggle
  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 💰 Subtotal calculation
  const calcSubtotal = (items) =>
    items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return {
    cart,
    setCart,
    wishlist,
    setWishlist,
    removeFromCart,
    updateCart,
    toggleWishlist,
    calcSubtotal,
  };
}
