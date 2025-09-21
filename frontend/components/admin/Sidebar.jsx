"use client";

import { Button } from "../ui/button";
import { Menu, Users, Package, ShoppingCart, CreditCard, Bell, Settings } from "lucide-react";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navItems = [
    { icon: ShoppingCart, label: "Orders" },
    { icon: Package, label: "Products" },
    { icon: Users, label: "Users" },
    { icon: CreditCard, label: "Payments" },
    { icon: Bell, label: "Notifications" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className={`bg-white shadow-lg p-4 transition-all ${sidebarOpen ? "w-64" : "w-16"}`}>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu />
      </Button>
      <nav className="space-y-4">
        {navItems.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 cursor-pointer">
            <Icon /> {sidebarOpen && label}
          </div>
        ))}
      </nav>
    </div>
  );
}
