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
    return <p className="p-8 text-center text-gray-600">⏳ Loading order...</p>;
  if (!order)
    return <p className="p-8 text-center text-red-500">❌ Order not found</p>;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg border my-16">
      {/* Header */}
      <div className="border-b p-6 text-center">
        <h2 className="text-2xl font-bold text-green-700">🧾 Order Summary</h2>
        <p className="text-sm text-gray-500 mt-1">
          Thank you for your purchase!
        </p>
      </div>

      {/* Order Info (ID + Date left, Status right) */}
      <div className="flex items-center justify-between p-6 border-b text-sm">
        <div>
          <p className="text-gray-500">Order ID</p>
          <p className="font-medium break-all">{order._id}</p>
          <p className="text-gray-500 mt-2">Date</p>
          <p className="font-medium">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 mb-1 pr-6">Status</p>
          <span
            className={`inline-block px-3 py-1 text-sm font-semibold rounded-full shadow 
            ${
              order.status === "pending"
                ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                : order.status === "completed"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-200 text-gray-600 border border-gray-400"
            }`}
          >
            {order.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Billing Info */}
      <div className="p-6 border-b">
        <h3 className="font-semibold text-lg mb-2">🧍 Billing Details</h3>
        <p className="text-gray-700">
          <span className="font-medium">{order.billing?.name}</span> —{" "}
          {order.billing?.phone}
        </p>
        <p className="text-gray-600">
          {order.billing?.address}, {order.billing?.thana},{" "}
          {order.billing?.district}, {order.billing?.division}
        </p>
        {order.billing?.note && (
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-medium">Note:</span> {order.billing.note}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="p-6 border-b">
        <h3 className="font-semibold text-lg mb-2">📦 Items</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Product</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{it.name}</td>
                <td className="p-2 text-center">{it.qty}</td>
                <td className="p-2 text-right font-medium">
                  ৳{it.price * it.qty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="p-6 border-b space-y-2 text-sm sm:text-base">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">৳{order.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery:</span>
          <span className="font-medium">৳{order.deliveryCharge}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-green-700 border-t pt-2">
          <span>Total:</span>
          <span>৳{order.total}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order._id}/receipt`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
        >
          ⬇️ Download Receipt
        </a>
        <a
          href="/orders"
          className="px-5 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center"
        >
          📂 Go to My Orders
        </a>
      </div>
    </div>
  );
}
