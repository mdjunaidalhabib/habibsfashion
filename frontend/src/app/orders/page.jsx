"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../../../context/UserContext";
import { apiFetch } from "../../../utils/api";
import { downloadReceipt } from "../../../utils/download";

export default function OrdersPage() {
  const { me, loadingUser } = useUser();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  // ✅ fetch orders for logged-in user
  useEffect(() => {
    if (!loadingUser && me) {
      (async () => {
        try {
          const data = await apiFetch(`/api/orders?userId=${me.userId}`);
          setOrders(data || []);
        } catch (err) {
          console.error("❌ Failed to load orders:", err);
          setError("Failed to load orders");
        } finally {
          setLoadingOrders(false);
        }
      })();
    }
  }, [me, loadingUser]);

  if (loadingUser || loadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">You are not logged in</p>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">You don’t have any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Order ID</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{order.orderId || order._id}</td>
                <td className="p-3">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-600"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3 font-semibold">৳{order.total}</td>
                <td className="p-3 text-center space-x-2">
                  <Link
                    href={`/orders/${order._id}`}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => downloadReceipt(order._id, order)}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
