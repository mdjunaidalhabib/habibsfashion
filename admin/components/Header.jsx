"use client";

import { useState } from "react";
import { Button } from "./button"; // তোমার root components path অনুযায়ী ঠিক করো
import { Menu } from "lucide-react";
import MenuBar from "./MenuBar";
import { navItems } from "./menuConfig";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow p-2 md:p-7 flex items-center justify-between relative">
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button variant="ghost" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu />
        </Button>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold absolute left-1/2 transform -translate-x-1/2">
        Admin Panel
      </h1>

      {/* Placeholder (to balance flex layout) */}
      <div className="w-8 md:hidden" />

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute left-4 top-14 w-56 bg-white shadow-lg rounded-lg border z-50 md:hidden">
          <MenuBar items={navItems} onItemClick={() => setMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
