"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import {
  CircleGauge,
  Menu,
  Users,
  Package,
  ShoppingCart,
  ChartBarStacked,
  CreditCard,
  Bell,
  Settings,
} from "lucide-react";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navItems = [

    { icon: <CircleGauge size={18} />, label: "dashboard", href: "/admin" },
    { icon: <ShoppingCart size={18} />, label: "Orders", href: "/admin/orders" },
    { icon: <Package size={18} />, label: "Products", href: "/admin/products" },
    { icon: <ChartBarStacked size={18} />, label: "category", href: "/admin/category" },
    { icon: <Users size={18} />, label: "Users", href: "/admin/users" },
    { icon: <CreditCard size={18} />, label: "Payments", href: "/admin/payments" },
    { icon: <Bell size={18} />, label: "Notifications", href: "/admin/notifications" },
    { icon: <Settings size={18} />, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div
      className={`bg-white shadow-lg p-4 transition-all ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Sidebar Toggle */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu />
      </Button>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map(({ icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition"
          >
            {icon} {sidebarOpen && label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
