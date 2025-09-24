"use client";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "../../../components/admin/Sidebar";
import MenuBar from "../../../components/admin/MenuBar";
import { navItems } from "../../../components/admin/menuConfig";

export default function AdminLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar only for desktop */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-2 md:p-7 flex items-center justify-between relative">
          {/* Left (Mobile Menu button) */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu />
            </Button>
          </div>

          {/* Center (Title) */}
          <h1 className="text-xl font-bold absolute left-1/2 transform -translate-x-1/2">
            Admin Panel
          </h1>

          {/* Right (empty placeholder to balance layout) */}
          <div className="w-8 md:hidden" />

          {/* Mobile Dropdown Menu */}
          {menuOpen && (
            <div className="absolute left-4 top-14 w-56 bg-white shadow-lg rounded-lg border z-50 md:hidden">
              <MenuBar items={navItems} onItemClick={() => setMenuOpen(false)} />
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-2 overflow-auto flex-1">{children}</main>
      </div>
    </div>
  );
}
