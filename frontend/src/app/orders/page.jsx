"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../../../context/UserContext";
import { apiFetch } from "../../../utils/api";
import { downloadReceipt } from "../../../utils/download";

// ✅ Custom date-time formatter
const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(",", " •");
};

export default function OrdersPage() {
  const { me, loadingUser } = useUser();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("lifetime");

  // ✅ pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ fetch orders
  useEffect(() => {
    if (!loadingUser && me) {
      (async () => {
        try {
          const data = await apiFetch(`/api/orders?userId=${me.userId}`);
          setOrders(data || []);
          setFilteredOrders(data || []);
        } catch (err) {
          console.error("❌ Failed to load orders:", err);
          setError("Failed to load orders");
        } finally {
          setLoadingOrders(false);
        }
      })();
    }
  }, [me, loadingUser]);

  // ✅ filter orders
  useEffect(() => {
    if (!orders.length) return;

    const now = new Date();
    let cutoff;

    switch (filter) {
      case "1m":
        cutoff = new Date();
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "6m":
        cutoff = new Date();
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case "lifetime":
      default:
        cutoff = null;
        break;
    }

    let result;
    if (cutoff) {
      result = orders.filter(
        (order) => order.createdAt && new Date(order.createdAt) >= cutoff
      );
    } else {
      result = orders;
    }

    setFilteredOrders(result);
    setCurrentPage(1); // reset to first page when filter changes
  }, [filter, orders]);

  // ✅ pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  if (loadingUser || loadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Loading orders...</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-gray-500 mb-4 text-lg">You are not logged in</p>
        <a
          href="/"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md shadow hover:from-blue-700 hover:to-blue-600 transition"
        >
          Go Home
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg mb-4">
          No orders found for this time range.
        </p>
        <button
          onClick={() => setFilter("lifetime")}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 transition"
        >
          Reset Filter
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1m">Last 1 Month</option>
          <option value="6m">Last 6 Months</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>

      {/* 📱 Mobile Card View */}
      <div className="grid gap-4 sm:hidden">
        {paginatedOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white shadow-sm rounded-lg p-3 border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-gray-900 text-sm truncate">
                #{order.orderId || order._id}
              </h2>
              <span
                className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-600"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {order.status}
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-1">
              <span className="font-medium">Date:</span>{" "}
              {formatDateTime(order.createdAt)}
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">Total:</span> ৳{order.total}
            </p>

            <div className="flex gap-2 mt-3">
              <Link
                href={`/orders/${order._id}`}
                className="flex-1 px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs rounded-md hover:from-blue-700 hover:to-blue-600 shadow-sm transition text-center"
              >
                View
              </Link>
              <button
                onClick={() => downloadReceipt(order._id, order)}
                className="flex-1 px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-600 text-white text-xs rounded-md hover:from-gray-800 hover:to-gray-700 shadow-sm transition"
              >
                Receipt
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 💻 Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-2 sm:p-3 whitespace-nowrap">Order ID</th>
              <th className="p-2 sm:p-3">Date</th>
              <th className="p-2 sm:p-3">Status</th>
              <th className="p-2 sm:p-3">Total</th>
              <th className="p-2 sm:p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr
                key={order._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-2 sm:p-3 font-medium text-gray-900">
                  {order.orderId || order._id}
                </td>
                <td className="p-2 sm:p-3 text-gray-600">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="p-2 sm:p-3">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
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
                <td className="p-2 sm:p-3 font-semibold text-gray-800">
                  ৳{order.total}
                </td>
                <td className="p-2 sm:p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/orders/${order._id}`}
                      className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs rounded-md hover:from-blue-700 hover:to-blue-600 shadow-sm transition"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => downloadReceipt(order._id, order)}
                      className="px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-600 text-white text-xs rounded-md hover:from-gray-800 hover:to-gray-700 shadow-sm transition"
                    >
                      Receipt
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔄 Pagination Controls */}
      <div className="flex justify-center items-center gap-4 my-6">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm shadow-sm transition ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
          }`}
        >
          Previous
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm shadow-sm transition ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
