"use client";
import { apiFetch } from "../../utils/api";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartUtils } from "../../hooks/useCartUtils";
import QuantityController from "./QuantityController";
import CheckoutButton from "./CheckoutButton";

export default function CheckoutPage() {
  const { cart, setCart, updateCart, removeFromCart, calcSubtotal } = useCartUtils();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId");
  const initialQty = Number(searchParams.get("qty")) || 1;
  const [checkoutQty, setCheckoutQty] = useState(initialQty);

  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/products")
      .then((data) => setAllProducts(data))
      .catch((err) => console.error("❌ Failed to load products", err))
      .finally(() => setProductsLoading(false));
  }, []);

  const cartItems = useMemo(() => {
    if (!allProducts.length) return [];
    if (productId) {
      const p = allProducts.find((x) => String(x._id) === String(productId));
      if (!p) return [];
      return [
        {
          productId: p._id,
          name: p.name,
          price: p.price,
          qty: checkoutQty,
          image: p.image,
          stock: p.stock,
        },
      ];
    }
    return Object.keys(cart)
      .map((id) => {
        const p = allProducts.find((x) => String(x._id) === String(id));
        if (!p) return null;
        return {
          productId: p._id,
          name: p.name,
          price: p.price,
          qty: cart[id],
          image: p.image,
          stock: p.stock,
        };
      })
      .filter(Boolean);
  }, [cart, productId, checkoutQty, allProducts]);

  const subtotal = calcSubtotal(cartItems);
  const deliveryCharge = 100;
  const total = subtotal + deliveryCharge;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function placeOrder() {
    if (!name || !phone || !address) {
      setError("সব ঘর পূরণ করতে হবে!");
      return;
    }
    if (!/^(01[3-9]\d{8})$/.test(phone)) {
      setError("সঠিক ১১ সংখ্যার মোবাইল নাম্বার দিন");
      return;
    }

    setError("");
    setLoading(true);

    const orderData = {
      items: cartItems,
      subtotal,
      deliveryCharge,
      total,
      billing: { name, phone, address, note },
      promoCode,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (!productId) setCart({});
        window.location.href = `/order-summary/${data.order._id}`;
      } else {
        console.error("🔥 Order failed", res);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-xl font-bold text-green-700 text-center mb-6">
        অর্ডারটি সম্পন্ন করতে আপনার নাম, মোবাইল নাম্বার ও ঠিকানা লিখুন
      </h2>

      {error && <p className="text-center text-red-600 mb-4">{error}</p>}

      {productsLoading ? (
        <p className="text-center text-gray-600">⏳ প্রোডাক্ট লোড হচ্ছে...</p>
      ) : !cartItems.length ? (
        <p className="text-center text-gray-600">🛒 আপনার কার্ট খালি</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Billing Form */}
          <div>
            <label className="block mb-3">
              <span className="text-sm font-medium">আপনার নাম *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium">মোবাইল নাম্বার *</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium">ঠিকানা *</span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
                rows="2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">নোট (ঐচ্ছিক)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
                rows="2"
              />
            </label>
          </div>

          {/* Product Details */}
          <div>
            {cartItems.map((it) => (
              <div
                key={it.productId}
                className="flex items-center justify-between border p-3 rounded-lg mb-3"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium">{it.name}</p>
                    <QuantityController
                      qty={it.qty}
                      stock={it.stock}
                      onChange={(change) =>
                        productId
                          ? setCheckoutQty((prev) =>
                              Math.min(Math.max(1, prev + change), it.stock)
                            )
                          : updateCart(it.productId, change, it.stock)
                      }
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">৳{it.price * it.qty}</p>
                  {!productId && (
                    <button
                      onClick={() => removeFromCart(it.productId)}
                      className="text-red-500 text-sm flex items-center gap-1 mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between mt-4 text-lg font-semibold">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between mt-2 text-lg font-semibold">
              <span>Delivery Charge</span>
              <span>৳{deliveryCharge}</span>
            </div>
            <div className="flex justify-between mt-2 text-lg font-bold text-green-700">
              <span>Total</span>
              <span>৳{total}</span>
            </div>

            {/* ✅ Checkout Page → অর্ডার কনফার্ম করুন */}
            <CheckoutButton
              product={cartItems[0]}
              productId={productId}
              qty={productId ? checkoutQty : 1}
              total={total}
              fullWidth
              onClick={placeOrder}
            />
          </div>
        </div>
      )}
    </div>
  );
}
