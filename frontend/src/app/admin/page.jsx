"use client";

import { useState } from "react";
import Sidebar from "../../../components/admin/Sidebar";
import StatsGrid from "../../../components/admin/StatsGrid";
import SalesChart from "../../../components/admin/SalesChart";
import ProductsManagement from "../../../components/admin/ProductsManagement";

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <StatsGrid />
        <SalesChart />
        <ProductsManagement />
      </div>
    </div>
  );
}
