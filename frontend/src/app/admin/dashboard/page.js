"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders/all", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <h2 className="mt-4 font-semibold">All Orders</h2>
      {orders.map((o, i) => (
        <div key={i} className="border p-3 my-2">
          <p>Order ID: {o._id}</p>
          <p>User: {o.userId}</p>
          <p>Total: ${o.totalPrice}</p>
          <p>Status: {o.status}</p>
        </div>
      ))}
    </div>
  );
}
