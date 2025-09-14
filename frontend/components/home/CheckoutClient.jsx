"use client";
import { apiFetch } from "../../utils/api";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";

// 🔹 Skeleton for dropdown
const SelectSkeleton = () => (
  <div className="h-10 w-full bg-gray-200 rounded animate-pulse mt-1"></div>
);

export default function CheckoutPage() {
  const { cart, setCart, updateCart, removeFromCart } = useCart();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId");
  const initialQty = Number(searchParams.get("qty")) || 1;

  // ✅ Single checkout এর জন্য local qty
  const [checkoutQty, setCheckoutQty] = useState(initialQty);

  // ✅ Products লোড
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/products")
      .then((data) => setAllProducts(data))
      .catch((err) => console.error("❌ Failed to load products", err))
      .finally(() => setProductsLoading(false));
  }, []);

  // ✅ Cart items বানানো
  const cartItems = useMemo(() => {
    if (!allProducts.length) return [];

    // ---- Single Checkout ----
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
        },
      ];
    }

    // ---- Full Cart ----
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
  }, [cart, productId, checkoutQty, allProducts]);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  // --- Billing form states ---
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

  // --- Delivery Charge & Dropdown ---
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/locations/divisions")
      .then(setDivisions)
      .finally(() => setLocationsLoading(false));
  }, []);
  useEffect(() => {
    if (division) {
      apiFetch(`/api/locations/districts/${division}`).then(setDistricts);
    } else {
      setDistricts([]);
      setDistrict("");
    }
  }, [division]);
  useEffect(() => {
    if (division && district) {
      apiFetch(`/api/locations/thanas/${division}/${district}`).then(setThanas);
    } else {
      setThanas([]);
      setThana("");
    }
  }, [division, district]);

  useEffect(() => {
    if (division === "ঢাকা") setDeliveryCharge(80);
    else if (division) setDeliveryCharge(130);
    else setDeliveryCharge(0);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
        credentials: "include",
      });

      if (res.status === 401) {
        const redirectUrl = encodeURIComponent(window.location.href);
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirect=${redirectUrl}`;
        return;
      }

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

            {/* Division */}
            <label className="block mb-3">
              <span className="text-sm font-medium">বিভাগ *</span>
              {locationsLoading ? (
                <SelectSkeleton />
              ) : (
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
              )}
            </label>

            {/* District */}
            <label className="block mb-3">
              <span className="text-sm font-medium">জেলা *</span>
              {locationsLoading ? (
                <SelectSkeleton />
              ) : (
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
              )}
            </label>

            {/* Thana */}
            <label className="block mb-3">
              <span className="text-sm font-medium">থানা *</span>
              {locationsLoading ? (
                <SelectSkeleton />
              ) : (
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
              )}
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
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          productId
                            ? setCheckoutQty(Math.max(1, checkoutQty - 1))
                            : it.qty > 1 && updateCart(it.productId, -1)
                        }
                        className={`px-2 py-1 rounded text-white ${
                          it.qty > 1 || productId
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FaMinus />
                      </button>
                      <span>{it.qty}</span>
                      <button
                        onClick={() =>
                          productId
                            ? setCheckoutQty(checkoutQty + 1)
                            : updateCart(it.productId, +1)
                        }
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <FaPlus />
                      </button>
                    </div>
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

            {/* Totals */}
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
