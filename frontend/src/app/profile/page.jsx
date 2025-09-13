"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0); // ✅ নতুন state
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // ✅ ইউজার লোড
    apiFetch("/auth/me")
      .then(async (data) => {
        setUser(data);

        // ✅ অর্ডার সংখ্যা লোড
        const orders = await apiFetch("/api/orders/me");
        setOrdersCount(orders.length || 0);

        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Not logged in</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6 max-w-lg mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          {user.avatar && !imgError ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={80}
              height={80}
              className="rounded-full border"
              onError={() => setImgError(true)}
            />
          ) : (
            <FaUserCircle className="w-20 h-20 text-gray-400" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-4 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Joined:</span>
            <span>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>User ID:</span>
            <span>{user._id || user.userId}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Orders:</span>
            <span>{ordersCount}</span> {/* ✅ মোট order সংখ্যা */}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push("/orders")}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            My Orders
          </button>
          <button
            onClick={async () => {
              await apiFetch("/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
