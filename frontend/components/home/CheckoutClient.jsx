"use client";
import { apiFetch } from "../../utils/api";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";

export default function CheckoutPage() {
  const { cart, setCart, updateCart, removeFromCart } = useCart();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId");
  const qty = Number(searchParams.get("qty")) || 1;

  // ✅ সব products DB থেকে লোড
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then(setAllProducts)
      .catch((err) => console.error("❌ Failed to load products", err));
  }, []);

  // ✅ cartItems বানানো
  const cartItems = useMemo(() => {
    if (!allProducts.length) return [];

    // ---- Single Checkout Mode ----
    if (productId) {
      const p = allProducts.find((x) => String(x._id) === String(productId));
      if (!p) return [];
      return [
        {
          productId: p._id,
          name: p.name,
          price: p.price,
          qty, // query param থেকে quantity
          image: p.image,
        },
      ];
    }

    // ---- Full Cart Mode ----
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
        };
      })
      .filter(Boolean);
  }, [cart, productId, qty, allProducts]);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Billing form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Delivery charge
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Dropdown data
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);

  // ✅ Load Divisions
  useEffect(() => {
    fetch("http://localhost:4000/api/locations/divisions")
      .then((res) => res.json())
      .then(setDivisions);
  }, []);

  // ✅ Load Districts when division changes
  useEffect(() => {
    if (division) {
      fetch(`http://localhost:4000/api/locations/districts/${division}`)
        .then((res) => res.json())
        .then(setDistricts);
    } else {
      setDistricts([]);
      setDistrict("");
    }
  }, [division]);

  // ✅ Load Thanas when district changes
  useEffect(() => {
    if (division && district) {
      fetch(
        `http://localhost:4000/api/locations/thanas/${division}/${district}`
      )
        .then((res) => res.json())
        .then(setThanas);
    } else {
      setThanas([]);
      setThana("");
    }
  }, [division, district]);

  // ✅ Auto set Delivery Charge
  useEffect(() => {
    if (division === "ঢাকা") {
      setDeliveryCharge(80);
    } else if (division) {
      setDeliveryCharge(130);
    } else {
      setDeliveryCharge(0);
    }
  }, [division]);

  const total = subtotal + deliveryCharge;

  async function placeOrder() {
    if (!name || !phone || !address || !division || !district || !thana) {
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
      billing: { name, phone, address, division, district, thana, note },
      promoCode,
    };

    try {
      const res = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      if (res.status === 401) {
        const redirectUrl = encodeURIComponent(window.location.href);
        window.location.href = `http://localhost:4000/auth/google?redirect=${redirectUrl}`;
        return;
      }

      if (res.ok) {
        const data = await res.json();

        // ✅ শুধু full cart হলে clear করব
        if (!productId) setCart({});

        // ✅ Redirect to order summary
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

      {error && (
        <p className="text-center text-red-600 font-semibold mb-4">{error}</p>
      )}

      {!cartItems.length ? (
        <p className="text-center text-gray-600">🛒 আপনার কার্ট খালি</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Billing Form */}
          <div>
            {/* Name */}
            <label className="block mb-3">
              <span className="text-sm font-medium">আপনার নাম *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </label>

            {/* Phone */}
            <label className="block mb-3">
              <span className="text-sm font-medium">মোবাইল নাম্বার *</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </label>

            {/* Address */}
            <label className="block mb-3">
              <span className="text-sm font-medium">ঠিকানা *</span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md"
                rows="2"
              />
            </label>

            {/* Division */}
            <label className="block mb-3">
              <span className="text-sm font-medium">বিভাগ *</span>
              <select
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value);
                  setDistrict("");
                  setThana("");
                }}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="">বিভাগ সিলেক্ট করুন</option>
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            {/* District */}
            <label className="block mb-3">
              <span className="text-sm font-medium">জেলা *</span>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setThana("");
                }}
                disabled={!division}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="">জেলা সিলেক্ট করুন</option>
                {districts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </label>

            {/* Thana */}
            <label className="block mb-3">
              <span className="text-sm font-medium">থানা *</span>
              <select
                value={thana}
                onChange={(e) => setThana(e.target.value)}
                disabled={!district}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="">থানা সিলেক্ট করুন</option>
                {thanas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            {/* Note */}
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
                    {!productId && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCart(it.productId, -1)}
                          className="px-2 py-1 bg-red-500 text-white rounded"
                        >
                          <FaMinus />
                        </button>
                        <span>{it.qty}</span>
                        <button
                          onClick={() => updateCart(it.productId, +1)}
                          className="px-2 py-1 bg-green-500 text-white rounded"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">৳{it.price * it.qty}</p>
                  {!productId && (
                    <button
                      onClick={() => removeFromCart(it.productId)}
                      className="text-red-500 text-sm flex items-center gap-1 mt-1"
                    >
                      <FaTrashAlt /> Remove
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

            <button
              onClick={placeOrder}
              disabled={loading}
              className={`w-full mt-4 py-3 font-bold rounded-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {loading ? "Processing..." : `অর্ডার কনফার্ম করুন ৳${total}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
