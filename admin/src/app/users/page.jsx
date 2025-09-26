"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="p-2 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Users</h2>

      {/* ✅ Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">User ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Avatar</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b">
                <td className="p-2">{u.userId}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <img
                    src={u.avatar || "https://i.pravatar.cc/150?u=fallback"}
                    alt={u.name || "User Avatar"}
                    className="w-8 h-8 rounded-full border"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Mobile Card View */}
      <div className="grid gap-3 md:hidden">
        {users.map((u) => (
          <div
            key={u._id}
            className="border rounded-lg p-3 bg-white shadow-sm flex items-center gap-3"
          >
            <img
              src={u.avatar || "https://i.pravatar.cc/150?u=fallback"}
              alt={u.name || "User Avatar"}
              className="w-12 h-12 rounded-full border"
            />
            <div className="flex-1">
              <div className="font-semibold">{u.name}</div>
              <div className="text-sm text-gray-600 break-all">{u.email}</div>
              <div className="text-xs text-gray-500">ID: {u.userId}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
