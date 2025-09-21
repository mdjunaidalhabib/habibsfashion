"use client";
import { useEffect, useState } from "react";

export default function OrderSummary({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Order fetch failed");
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("❌ Failed to fetch order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <p className="p-3 text-center text-xs text-gray-500 animate-pulse">
        ⏳ Loading order...
      </p>
    );
  if (!order)
    return (
      <p className="p-3 text-center text-xs text-red-500">❌ Order not found</p>
    );

  return (
    <div className="max-w-xs mx-auto my-4 bg-white shadow rounded-lg overflow-hidden text-xs">
      {/* Header */}
      <div className="border-b px-2 py-3 text-center">
        <h2 className="text-sm font-semibold text-green-700">🧾 Order Summary</h2>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Thank you for your purchase
        </p>
      </div>

      {/* Order Info */}
      <div className="flex justify-between gap-2 px-2 py-3 border-b">
        <div>
          <p className="text-gray-500">Order ID</p>
          <p className="font-medium break-all">{order._id}</p>
          <p className="text-gray-500 mt-1">Date</p>
          <p className="font-medium">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 mb-1">Status</p>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium 
              ${
                order.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : order.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
          >
            {order.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Billing */}
      <div className="px-2 py-3 border-b">
        <h3 className="font-semibold mb-1">🧍 Billing</h3>
        <p>
          <span className="font-medium">{order.billing?.name}</span> —{" "}
          {order.billing?.phone}
        </p>
        <p className="text-gray-600">
          {order.billing?.address}, {order.billing?.thana},{" "}
          {order.billing?.district}, {order.billing?.division}
        </p>
        {order.billing?.note && (
          <p className="mt-1 text-gray-500">
            <span className="font-medium">Note:</span> {order.billing.note}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="px-2 py-3 border-b overflow-x-auto">
        <h3 className="font-semibold mb-1">📦 Items</h3>
        <table className="w-full border-collapse text-[11px] min-w-[240px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-1 text-left">Product</th>
              <th className="p-1 text-center">Qty</th>
              <th className="p-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-1">{it.name}</td>
                <td className="p-1 text-center">{it.qty}</td>
                <td className="p-1 text-right font-medium">
                  ৳{it.price * it.qty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-2 py-3 border-b space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">৳{order.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery</span>
          <span className="font-medium">৳{order.deliveryCharge}</span>
        </div>
        <div className="flex justify-between text-green-700 font-semibold border-t pt-1">
          <span>Total</span>
          <span>৳{order.total}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-3 flex flex-col sm:flex-row gap-2">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order._id}/receipt`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
        >
          ⬇️ Receipt
        </a>
        <a
          href="/orders"
          className="flex-1 px-2 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
        >
          📂 My Orders
        </a>
      </div>
    </div>
  );
}
