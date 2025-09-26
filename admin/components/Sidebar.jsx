"use client";

import { navItems } from "./menuConfig";
import MenuBar from "./MenuBar";

export default function Sidebar() {
  return (
    <div className="hidden md:block w-64 h-screen bg-white shadow-lg p-4">
      <MenuBar items={navItems} />
    </div>
  );
}
