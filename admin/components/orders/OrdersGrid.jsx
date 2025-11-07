"use client";
import Badge from "./Badge";
import { useState } from "react";

export default function OrdersGrid({ orders, onEdit, onDelete, onStatusChange }) {
  const [updatingId, setUpdatingId] = useState(null);

  if (!orders.length)
    return <div className="p-6 text-center text-gray-500">No orders found.</div>;

  const handleChange = async (id, newStatus) => {
    setUpdatingId(id);
    await onStatusChange(id, newStatus);
    setUpdatingId(null);
  };

  return (
    <div className="grid gap-3 md:hidden">
      {orders.map((o) => (
        <div key={o._id} className="border rounded-lg p-3 bg-white">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div className="font-mono text-xs text-gray-500 break-all">#{o._id}</div>
            <div className="flex gap-1 flex-wrap">
              {/* ✅ Inline Editable Status */}
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
                    : "text-red-600"
                }`}
                value={o.status}
                onChange={(e) => handleChange(o._id, e.target.value)}
                disabled={updatingId === o._id}
              >
                {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2 space-y-0.5 text-sm">
            <div className="font-semibold">{o.billing?.name}</div>
            <div className="text-gray-600">{o.billing?.phone}</div>
            <div className="text-gray-600">{o.billing?.address}</div>
          </div>

          <div className="mt-2 text-sm">
            <div className="font-medium">Items</div>
            <ul className="list-disc ml-5">
              {o.items?.map((it, idx) => (
                <li key={idx}>{it.name} × {it.qty} — ৳{it.price}</li>
              ))}
            </ul>
          </div>

          <div className="mt-2 text-sm space-y-0.5">
            <div>Subtotal: ৳{o.subtotal}</div>
            <div>Delivery: ৳{o.deliveryCharge}</div>
            {!!o.discount && <div>Discount: -৳{o.discount}</div>}
            <div className="font-semibold">Total: ৳{o.total}</div>
            <div className="text-xs text-gray-600 mt-1">Method: {o.paymentMethod?.toUpperCase()}</div>
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            <button onClick={() => onEdit(o)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Edit</button>
            <button onClick={() => onDelete(o._id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
