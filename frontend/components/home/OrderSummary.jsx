"use client";
import { useEffect, useState } from "react";

export default function OrderSummary({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`http://localhost:4000/api/orders/${orderId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (!order) return <p className="p-8">Order not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h2 className="text-xl font-bold text-center mb-6">Order Summary</h2>

      {/* Order Info */}
      <div className="mb-4 text-sm text-gray-700">
        <p>Order ID: {order._id}</p>
        <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
        <p>Status: {order.status}</p>
      </div>

      {/* Billing Info */}
      <div className="mb-4">
        <h3 className="font-semibold">Billing Details</h3>
        <p>
          {order.billing?.name} — {order.billing?.phone}
        </p>
        <p>
          {order.billing?.address}, {order.billing?.thana},{" "}
          {order.billing?.district}, {order.billing?.division}
        </p>
        {order.billing?.note && <p>Note: {order.billing.note}</p>}
      </div>

      {/* Items */}
      <div className="mb-4">
        <h3 className="font-semibold">Items</h3>
        <ul className="list-disc pl-5 text-sm">
          {order.items.map((it, idx) => (
            <li key={idx}>
              {it.name} × {it.qty} — ৳{it.price * it.qty}
            </li>
          ))}
        </ul>
      </div>

      {/* Totals */}
      <div className="space-y-1 font-medium">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>৳{order.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery:</span>
          <span>৳{order.deliveryCharge}</span>
        </div>
        <div className="flex justify-between font-bold text-green-700">
          <span>Total:</span>
          <span>৳{order.total}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        {/* 🚀 Clean Download Receipt Link */}
        <a
          href={`http://localhost:4000/api/orders/${order._id}/receipt`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download Receipt
        </a>

        <a
          href="/orders"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Go to My Orders
        </a>
      </div>
    </div>
  );
}
