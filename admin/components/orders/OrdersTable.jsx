"use client";
import Badge from "./Badge";
import { useState } from "react";

export default function OrdersTable({ orders, onEdit, onDelete, onStatusChange }) {
  const [updatingId, setUpdatingId] = useState(null);

  if (!orders.length)
    return <div className="p-6 text-center text-gray-500">No orders found.</div>;

  const handleChange = async (id, newStatus) => {
    setUpdatingId(id);
    await onStatusChange(id, newStatus);
    setUpdatingId(null);
  };

  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Order</th>
            <th className="text-left p-3">Customer</th>
            <th className="text-left p-3">Items</th>
            <th className="text-left p-3">Totals</th>
            <th className="text-left p-3">Payment</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t">
              {/* Order Info */}
              <td className="p-3 align-top">
                <div className="font-mono text-xs text-gray-500 break-all">#{o._id}</div>
                <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
              </td>

              {/* Customer */}
              <td className="p-3 align-top">
                <div className="font-semibold">{o.billing?.name}</div>
                <div className="text-gray-600">{o.billing?.phone}</div>
                <div className="text-xs text-gray-500">{o.billing?.address}</div>
              </td>

              {/* Items */}
              <td className="p-3 align-top">
                <ul className="list-disc ml-5">
                  {o.items?.map((it, idx) => (
                    <li key={idx}>{it.name} × {it.qty} — ৳{it.price}</li>
                  ))}
                </ul>
              </td>

              {/* Totals */}
              <td className="p-3 align-top">
                <div>Subtotal: ৳{o.subtotal}</div>
                <div>Delivery: ৳{o.deliveryCharge}</div>
                {!!o.discount && <div>Discount: -৳{o.discount}</div>}
                <div className="font-semibold">Total: ৳{o.total}</div>
              </td>

              {/* Payment */}
              <td className="p-3 align-top">
                <Badge>{o.paymentMethod?.toUpperCase()}</Badge>
              </td>

              {/* ✅ Status Dropdown */}
              <td className="p-3 align-top">
                <select
                  className={`border rounded px-2 py-1 text-sm ${
                    o.status === "pending"
                      ? "text-yellow-600"
                      : o.status === "confirmed"
                      ? "text-blue-600"
                      : o.status === "processing"
                      ? "text-indigo-600"
                      : o.status === "shipped"
                      ? "text-purple-600"
                      : o.status === "delivered"
                      ? "text-green-600"
                      : o.status === "cancelled"
                      ? "text-red-600"
                      : ""
                  }`}
                  value={o.status}
                  onChange={(e) => handleChange(o._id, e.target.value)}
                  disabled={updatingId === o._id}
                >
                  {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>

                {o.trackingId && (
                  <div className="text-xs text-gray-600">Track: {o.trackingId}</div>
                )}
                {o.cancelReason && (
                  <div className="text-xs text-red-600">Reason: {o.cancelReason}</div>
                )}
              </td>

              {/* Actions */}
              <td className="p-3 align-top">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => onEdit(o)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(o._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
