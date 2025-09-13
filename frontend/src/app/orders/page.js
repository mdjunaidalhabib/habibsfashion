"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../utils/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/orders/me")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "http://localhost:4000/auth/google";
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>
      {!orders.length ? (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p>You have no orders yet.</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Shop now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-xl shadow p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Order #{o._id.slice(-6)}</p>
                <span className="text-sm text-gray-600">
                  {new Date(o.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-sm mb-2">Status: {o.status}</p>

              <ul className="text-sm list-disc pl-5 mb-2">
                {o.items.map((it, idx) => (
                  <li key={idx}>
                    {it.name} × {it.qty} — ৳{it.price * it.qty}
                  </li>
                ))}
              </ul>

              <div className="flex justify-between font-bold text-green-700">
                <span>Total:</span>
                <span>৳{o.total}</span>
              </div>

              <div className="mt-3 flex gap-3">
                {/* ✅ View Summary */}
                <a
                  href={`/order-summary/${o._id}`}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                >
                  View Summary
                </a>

                {/* ✅ Direct Receipt Download */}
                <a
                  href={`http://localhost:4000/api/orders/${o._id}/receipt`}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Download Receipt
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
