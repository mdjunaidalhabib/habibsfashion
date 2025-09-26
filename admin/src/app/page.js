"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(`${API}/api/orders`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);

          // Stats
          const totalOrders = data.length;
          const totalSales = data.reduce((sum, o) => sum + (o.total || 0), 0);
          const pendingOrders = data.filter((o) => o.status === "pending").length;
          const deliveredOrders = data.filter((o) => o.status === "delivered").length;

          setStats({ totalOrders, totalSales, pendingOrders, deliveredOrders });
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    }
    fetchOrders();
  }, [API]);

  // 📊 Sales (Last 7 days)
  const salesData = (() => {
    const last7 = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last7[key] = 0;
    }
    orders.forEach((o) => {
      const key = o.createdAt?.slice(0, 10);
      if (last7[key] !== undefined) {
        last7[key] += o.total || 0;
      }
    });
    return Object.entries(last7).map(([date, total]) => ({ date, total }));
  })();

  // 🏆 Top Products
  const topProducts = (() => {
    const map = {};
    orders.forEach((o) => {
      o.items?.forEach((it) => {
        if (!map[it.productId]) {
          map[it.productId] = { name: it.name, qty: 0, revenue: 0 };
        }
        map[it.productId].qty += it.qty;
        map[it.productId].revenue += it.price * it.qty;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  })();

  // 📅 Monthly Sales (last 12 months)
  const monthlySales = (() => {
    const map = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = 0;
    }
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (map[key] !== undefined) {
        map[key] += o.total || 0;
      }
    });
    return Object.entries(map).map(([month, sales]) => ({ month, sales }));
  })();

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold">Dashboard Overview</h1>

      {/* 📊 Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <div className="bg-white shadow rounded-lg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-500">Total Orders</div>
          <div className="text-lg sm:text-xl font-bold">{stats.totalOrders}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-500">Total Sales (Lifetime)</div>
          <div className="text-lg sm:text-xl font-bold">৳{stats.totalSales}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-500">Pending Orders</div>
          <div className="text-lg sm:text-xl font-bold">{stats.pendingOrders}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-500">Delivered Orders</div>
          <div className="text-lg sm:text-xl font-bold">{stats.deliveredOrders}</div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white shadow rounded-lg p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.qty}</td>
                  <td className="p-2">৳{p.revenue}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-gray-500">
                    No product data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {topProducts.length > 0 && (
          <div className="mt-6 w-full h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qty" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly Sales */}
      <div className="bg-white shadow rounded-lg p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Monthly Sales (Last 12 Months)
        </h2>
        <div className="w-full h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#4f46e5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
